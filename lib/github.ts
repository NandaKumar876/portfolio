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

async function fetchCalendarData(): Promise<CalendarWeek[] | null> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'NandaKumar876'
  if (!token) return null

  const to = new Date()
  const from = new Date()
  from.setUTCFullYear(from.getUTCFullYear() - 1)

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
    next: { revalidate: 3600 },
  })

  if (!response.ok) return null

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
  }

  return payload.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? null
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  const weeks = await fetchCalendarData()
  if (!weeks) return null
  const days = weeks.flatMap(w => w.contributionDays ?? [])
  if (!days.length) return null
  return countStreak(days)
}

export async function getGitHubCalendar(): Promise<GitHubCalendar | null> {
  const weeks = await fetchCalendarData()
  if (!weeks) return null
  const days = weeks.flatMap(w => w.contributionDays ?? [])
  const totalContributions = days.reduce((s, d) => s + d.contributionCount, 0)
  return { weeks, totalContributions }
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
