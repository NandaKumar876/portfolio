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
  const username = process.env.GITHUB_USERNAME || 'thamothara7'
  if (!token) return null

  const to = new Date()
  const from = new Date()
  from.setUTCFullYear(from.getUTCFullYear() - 1)

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Thamo-Portfolio',
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
