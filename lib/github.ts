export interface GitHubStats {
  currentStreak: number
  longestStreak: number
  totalContributions: number
  lastContributionDate: string | null
}

export interface CalendarDay {
  date: string
  contributionCount: number
}

export interface CalendarWeek {
  contributionDays: CalendarDay[]
}

export interface GitHubCalendar {
  weeks: CalendarWeek[]
  totalContributions: number
}

function countStreak(days: CalendarDay[]) {
  const byDate = new Map(days.map(day => [day.date, day.contributionCount]))
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  let currentStreak = 0
  let cursor = new Date(today)

  if ((byDate.get(cursor.toISOString().slice(0, 10)) ?? 0) <= 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    const count = byDate.get(key) ?? 0
    if (count <= 0) break
    currentStreak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  let longestStreak = 0
  let run = 0
  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1
      longestStreak = Math.max(longestStreak, run)
    } else {
      run = 0
    }
  }

  const totalContributions = days.reduce((sum, day) => sum + day.contributionCount, 0)
  const lastContributionDate = [...days].reverse().find(day => day.contributionCount > 0)?.date ?? null

  return { currentStreak, longestStreak, totalContributions, lastContributionDate }
}

/* ── In-memory calendar cache ────────────────────────────────────
   The GitHub GraphQL API sometimes times out. We cache the last
   successful result so the heatmap stays visible even when a
   subsequent fetch fails.
   ──────────────────────────────────────────────────────────────── */
let _cachedCalendar: { weeks: CalendarWeek[]; totalContributions?: number; fetchedAt: number } | null = null
const CALENDAR_CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Scrape contribution data from GitHub's public contribution page.
 * This endpoint requires NO authentication and returns an HTML page
 * with `<td>` elements containing `data-date` and `data-level` attrs.
 */
async function fetchPublicCalendar(username: string): Promise<{ weeks: CalendarWeek[]; totalContributions?: number } | null> {
  try {
    console.debug(`[GitHubCalendar] Trying public scrape for ${username}`)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: {
        'User-Agent': 'Nanda-Portfolio',
        Accept: 'text/html',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    })

    clearTimeout(timeout)
    if (!res.ok) {
      console.warn(`[GitHubCalendar] Public scrape failed: ${res.status}`)
      return null
    }

    const html = await res.text()

    // Try to extract the real total from the page header
    // e.g. "388 contributions in the last year"
    let scrapedTotal: number | undefined
    const totalMatch = html.match(/(\d[\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i)
    if (totalMatch) {
      scrapedTotal = parseInt(totalMatch[1].replace(/,/g, ''), 10)
      console.debug(`[GitHubCalendar] Scraped total contributions: ${scrapedTotal}`)
    }

    // Parse contribution cells from the HTML.
    // Each cell looks like: <td ... data-date="2025-07-16" data-level="2" ...>
    const cellRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g
    const dayMap = new Map<string, number>()
    let match: RegExpExecArray | null

    while ((match = cellRegex.exec(html)) !== null) {
      const date = match[1]
      const level = parseInt(match[2], 10)
      // Map level (0-4) to approximate contribution counts for the heatmap visual only
      const count = level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 4 : level === 3 ? 8 : 12
      dayMap.set(date, count)
    }

    if (dayMap.size === 0) {
      console.warn('[GitHubCalendar] Public scrape returned no contribution cells')
      return null
    }

    // Sort dates and group into weeks (Sun–Sat)
    const sortedDates = [...dayMap.keys()].sort()
    const weeks: CalendarWeek[] = []
    let currentWeek: CalendarDay[] = []

    for (const date of sortedDates) {
      const dow = new Date(date + 'T00:00:00Z').getUTCDay() // 0=Sun
      if (dow === 0 && currentWeek.length > 0) {
        weeks.push({ contributionDays: currentWeek })
        currentWeek = []
      }
      currentWeek.push({ date, contributionCount: dayMap.get(date) ?? 0 })
    }
    if (currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek })
    }

    console.debug(`[GitHubCalendar] Public scrape succeeded: ${weeks.length} weeks, ${dayMap.size} days`)
    return { weeks, totalContributions: scrapedTotal }
  } catch (err) {
    console.error('[GitHubCalendar] Public scrape error:', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Fetch calendar data using the authenticated GraphQL API.
 * Returns exact contribution counts per day + the authoritative total.
 */
async function fetchGraphQLCalendar(username: string, token: string): Promise<{ weeks: CalendarWeek[]; totalContributions: number } | null> {
  const to = new Date()
  const from = new Date()
  from.setUTCFullYear(from.getUTCFullYear() - 1)

  const MAX_RETRIES = 2
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.debug(`[GitHubCalendar] GraphQL fetch for ${username} (attempt ${attempt}/${MAX_RETRIES})`)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Nanda-Portfolio',
        },
        body: JSON.stringify({
          query: `
            query($login: String!, $from: DateTime!, $to: DateTime!) {
              user(login: $login) {
                contributionsCollection(from: $from, to: $to) {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { login: username, from: from.toISOString(), to: to.toISOString() },
        }),
        signal: controller.signal,
        next: { revalidate: 3600 },
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const body = await response.text()
        console.error(`[GitHubCalendar] GraphQL failed: ${response.status} ${response.statusText}`, body)
        if (response.status === 401 || response.status === 403) break
        continue
      }

      const payload = await response.json() as {
        data?: {
          user?: {
            contributionsCollection?: {
              contributionCalendar?: {
                totalContributions: number
                weeks?: CalendarWeek[]
              }
            }
          }
        }
        errors?: Array<{ message: string }>
      }

      if (payload.errors?.length) {
        console.error('[GitHubCalendar] GraphQL errors:', payload.errors)
      }

      const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar
      const weeks = calendar?.weeks ?? null
      const total = calendar?.totalContributions ?? 0
      if (weeks) {
        console.debug(`[GitHubCalendar] GraphQL succeeded: ${weeks.length} weeks, ${total} total contributions`)
        return { weeks, totalContributions: total }
      }
    } catch (err) {
      console.error(`[GitHubCalendar] GraphQL attempt ${attempt} failed:`, err instanceof Error ? err.message : err)
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, attempt * 1000))
      }
    }
  }
  return null
}

/**
 * Main calendar fetcher — tries multiple sources with caching:
 * 1. In-memory cache (if fresh)
 * 2. GraphQL API (exact counts, needs GITHUB_TOKEN) ← preferred
 * 3. Public GitHub contributions page (approximate, no auth needed)
 * 4. Stale cache (if all else fails)
 */
async function fetchCalendarData(): Promise<{ weeks: CalendarWeek[]; totalContributions?: number } | null> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'NandaKumar876'

  // Return cached data if still fresh
  if (_cachedCalendar && Date.now() - _cachedCalendar.fetchedAt < CALENDAR_CACHE_TTL) {
    console.debug('[GitHubCalendar] Returning cached data')
    return { weeks: _cachedCalendar.weeks, totalContributions: _cachedCalendar.totalContributions }
  }

  // Strategy 1 (preferred): GraphQL API — returns exact contribution counts
  if (token) {
    const graphqlResult = await fetchGraphQLCalendar(username, token)
    if (graphqlResult) {
      _cachedCalendar = { weeks: graphqlResult.weeks, totalContributions: graphqlResult.totalContributions, fetchedAt: Date.now() }
      return graphqlResult
    }
  } else {
    console.warn('[GitHubCalendar] No GITHUB_TOKEN set — GraphQL unavailable')
  }

  // Strategy 2: Public scrape (levels are approximate, but total is scraped from header)
  const publicResult = await fetchPublicCalendar(username)
  if (publicResult) {
    _cachedCalendar = { weeks: publicResult.weeks, totalContributions: publicResult.totalContributions, fetchedAt: Date.now() }
    return publicResult
  }

  // Strategy 3: Return stale cache
  if (_cachedCalendar) {
    console.warn('[GitHubCalendar] All sources failed, returning stale cached data')
    return { weeks: _cachedCalendar.weeks, totalContributions: _cachedCalendar.totalContributions }
  }

  console.error('[GitHubCalendar] All sources failed, no cached data')
  return null
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  const result = await fetchCalendarData()
  if (!result) return null
  const days = result.weeks.flatMap(w => w.contributionDays ?? [])
  if (!days.length) return null
  const stats = countStreak(days)
  // If the fetcher returned an authoritative total, use that instead of the sum
  if (result.totalContributions != null) {
    stats.totalContributions = result.totalContributions
  }
  return stats
}

export async function getGitHubCalendar(): Promise<GitHubCalendar> {
  const result = await fetchCalendarData()
  if (result) {
    const days = result.weeks.flatMap(w => w.contributionDays ?? [])
    // Use the authoritative total from the API/scrape if available,
    // otherwise fall back to summing the per-day counts
    const totalContributions = result.totalContributions ?? days.reduce((s, d) => s + d.contributionCount, 0)
    return { weeks: result.weeks, totalContributions }
  }

  // Fallback: generate an empty 52-week calendar so the section always renders
  console.warn('[GitHubCalendar] Using fallback empty calendar')
  const fallbackWeeks: CalendarWeek[] = []
  const now = new Date()
  const cursor = new Date(now)
  cursor.setUTCFullYear(cursor.getUTCFullYear() - 1)
  // Align to Sunday
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay())

  while (cursor <= now) {
    const days: CalendarDay[] = []
    for (let d = 0; d < 7 && cursor <= now; d++) {
      days.push({ date: cursor.toISOString().slice(0, 10), contributionCount: 0 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    fallbackWeeks.push({ contributionDays: days })
  }

  return { weeks: fallbackWeeks, totalContributions: 0 }
}

/* ────────────────────────────────────────────────────────────
   REPO STATS — stars, forks, primary language, last update.
   Used by project cards across home / work / detail pages.
   ──────────────────────────────────────────────────────────── */

export interface RepoStats {
  owner: string
  repo: string
  stars: number
  forks: number
  watchers: number
  language: string | null
  description: string | null
  htmlUrl: string
  pushedAt: string | null
}

/** Pull "owner/repo" out of a github.com URL. Returns null if it's not one. */
export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url)
    if (!/github\.com$/i.test(u.hostname)) return null
    const parts = u.pathname.replace(/^\/+|\/+$/g, '').split('/')
    if (parts.length < 2) return null
    const owner = parts[0]
    const repo  = parts[1].replace(/\.git$/i, '')
    if (!owner || !repo) return null
    return { owner, repo }
  } catch {
    return null
  }
}

/* ────────────────────────────────────────────────────────────
   ACTIVITY FEED — recent public events from GitHub.
   ──────────────────────────────────────────────────────────── */

export type ActivityKind = 'push' | 'pr' | 'issue' | 'release' | 'star' | 'fork' | 'create' | 'other'

export interface ActivityCommit {
  sha: string
  message: string
  url: string
}

export interface ActivityEvent {
  id: string
  kind: ActivityKind
  /** Repo "owner/name" string */
  repo: string
  repoUrl: string
  /** Human action verb-phrase, e.g. "Pushed 3 commits", "Opened a pull request". */
  action: string
  /** Optional ref / branch / title text. */
  detail?: string
  url: string
  createdAt: string
  /** Only present for PushEvent. */
  commits?: ActivityCommit[]
}

/**
 * Extract a clean branch name from a full git ref string.
 * e.g. "refs/heads/main" → "main", "refs/heads/feat/login" → "feat/login"
 */
function extractBranch(ref: string | undefined | null): string {
  if (!ref) return ''
  return ref.replace(/^refs\/heads\//, '')
}

/**
 * Determine the commit count for a PushEvent payload.
 *
 * The GitHub Events API may not include the full commits array in public
 * event payloads — `payload.commits` can be empty even when commits were
 * pushed. We therefore prefer `payload.size` or `payload.distinct_size`
 * (which are always set correctly), falling back to `commits.length`.
 */
function getCommitCount(payload: any): number {
  const commitsLength = Array.isArray(payload?.commits) ? payload.commits.length : 0
  // payload.size = total commits pushed; payload.distinct_size = unique commits
  const size         = typeof payload?.size === 'number' ? payload.size : 0
  const distinctSize = typeof payload?.distinct_size === 'number' ? payload.distinct_size : 0

  // Pick the best non-zero value: prefer the full size, then distinct, then array length
  return size || distinctSize || commitsLength
}

/**
 * Build a human-readable action string for a PushEvent.
 * Examples:
 *   "Pushed 1 commit to main"
 *   "Pushed 5 commits to develop"
 *   "Pushed commits to main" (fallback when count is unknown)
 */
function formatPushAction(count: number, branch: string): { action: string; detail?: string } {
  const branchDetail = branch ? `to ${branch}` : undefined

  if (count > 0) {
    return {
      action: `Pushed ${count} commit${count === 1 ? '' : 's'}`,
      detail: branchDetail,
    }
  }

  // Fallback: we know a push happened but can't determine the count
  return {
    action: 'Pushed commits',
    detail: branchDetail,
  }
}

/**
 * Map a raw GitHub event object into our normalised ActivityEvent format.
 * Returns null for unsupported event types so the caller can filter them out.
 */
function mapEvent(e: any): ActivityEvent | null {
  if (!e || !e.type || !e.repo) return null

  const repo    = e.repo.name as string
  const repoUrl = `https://github.com/${repo}`
  const base    = { id: String(e.id), repo, repoUrl, createdAt: e.created_at as string }

  // Debug: log the raw payload so we can verify event structure
  console.debug(`[GitHubActivity] Processing ${e.type} for ${repo}`, {
    payloadKeys: e.payload ? Object.keys(e.payload) : [],
    ...(e.type === 'PushEvent' && {
      'payload.size':          e.payload?.size,
      'payload.distinct_size': e.payload?.distinct_size,
      'payload.commits.length': Array.isArray(e.payload?.commits) ? e.payload.commits.length : 'N/A',
      'payload.ref':           e.payload?.ref,
    }),
  })

  switch (e.type) {
    /* ── Push ────────────────────────────────────────────── */
    case 'PushEvent': {
      const payload = e.payload ?? {}
      const commits = (payload.commits ?? []).map((c: any) => ({
        sha: c.sha,
        message: c.message,
        url: `${repoUrl}/commit/${c.sha}`,
      })) as ActivityCommit[]

      const branch     = extractBranch(payload.ref)
      const count      = getCommitCount(payload)
      const { action, detail } = formatPushAction(count, branch)

      console.debug(`[GitHubActivity] PushEvent resolved: count=${count}, branch="${branch}"`)

      return {
        ...base,
        kind: 'push',
        action,
        detail,
        url: `${repoUrl}/commits/${branch || 'main'}`,
        commits,
      }
    }

    /* ── Pull Request ───────────────────────────────────── */
    case 'PullRequestEvent': {
      const a  = e.payload?.action ?? 'updated'
      const pr = e.payload?.pull_request
      return {
        ...base,
        kind: 'pr',
        action: `${a[0].toUpperCase() + a.slice(1)} pull request`,
        detail: pr?.title,
        url: pr?.html_url ?? `${repoUrl}/pulls`,
      }
    }

    /* ── Issues ──────────────────────────────────────────── */
    case 'IssuesEvent': {
      const a     = e.payload?.action ?? 'updated'
      const issue = e.payload?.issue
      return {
        ...base,
        kind: 'issue',
        action: `${a[0].toUpperCase() + a.slice(1)} an issue`,
        detail: issue?.title,
        url: issue?.html_url ?? `${repoUrl}/issues`,
      }
    }

    /* ── Release ─────────────────────────────────────────── */
    case 'ReleaseEvent': {
      const r = e.payload?.release
      return {
        ...base,
        kind: 'release',
        action: 'Published a release',
        detail: r?.name ?? r?.tag_name,
        url: r?.html_url ?? `${repoUrl}/releases`,
      }
    }

    /* ── Watch (Star) ────────────────────────────────────── */
    case 'WatchEvent': {
      return { ...base, kind: 'star', action: 'Starred', url: repoUrl }
    }

    /* ── Fork ────────────────────────────────────────────── */
    case 'ForkEvent': {
      return {
        ...base,
        kind: 'fork',
        action: 'Forked',
        url: e.payload?.forkee?.html_url ?? repoUrl,
      }
    }

    /* ── Create (branch / tag / repo) ────────────────────── */
    case 'CreateEvent': {
      const refType = e.payload?.ref_type   // "branch", "tag", or "repository"
      const ref     = e.payload?.ref        // branch/tag name (null for repo)

      let action: string
      if (refType === 'repository') {
        action = 'Created repository'
      } else if (refType === 'branch') {
        action = 'Created branch'
      } else if (refType === 'tag') {
        action = 'Created tag'
      } else {
        action = `Created ${refType ?? 'ref'}`
      }

      return {
        ...base,
        kind: 'create',
        action,
        detail: ref ?? undefined,
        url: repoUrl,
      }
    }

    /* ── Unsupported event type ──────────────────────────── */
    default:
      console.debug(`[GitHubActivity] Skipping unsupported event type: ${e.type}`)
      return null
  }
}

/** Pull the latest public events for a GitHub user. Cached 5 min server-side. */
export async function getRecentActivity(limit = 12): Promise<ActivityEvent[]> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'NandaKumar876'
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Nanda-Portfolio',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=${Math.min(30, limit * 2)}`, {
      headers,
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const list = await res.json() as any[]
    const mapped = list.map(mapEvent).filter(Boolean) as ActivityEvent[]
    return mapped.slice(0, limit)
  } catch {
    return []
  }
}

/** Fetch a single repo's public stats from the REST API. Cached for 1h via
    Next's fetch cache. Falls back to null on any failure. */
export async function getRepoStats(repoUrl: string): Promise<RepoStats | null> {
  const parsed = parseGitHubRepoUrl(repoUrl)
  if (!parsed) return null
  const { owner, repo } = parsed

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Nanda-Portfolio',
  }
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null

    const data = await res.json() as {
      stargazers_count?: number
      forks_count?: number
      watchers_count?: number
      language?: string | null
      description?: string | null
      html_url?: string
      pushed_at?: string | null
    }

    return {
      owner,
      repo,
      stars:       data.stargazers_count ?? 0,
      forks:       data.forks_count ?? 0,
      watchers:    data.watchers_count ?? 0,
      language:    data.language ?? null,
      description: data.description ?? null,
      htmlUrl:     data.html_url ?? `https://github.com/${owner}/${repo}`,
      pushedAt:    data.pushed_at ?? null,
    }
  } catch {
    return null
  }
}
