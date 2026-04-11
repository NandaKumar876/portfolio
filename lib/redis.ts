import { createClient } from 'redis'

type RedisClient = ReturnType<typeof createClient>

let redisClientPromise: Promise<RedisClient> | null = null

function normalizeRedisUrl(raw?: string) {
  const value = raw?.trim()
  if (!value) return null

  const trimmed = value.replace(/^redis-cli\s+-u\s+/i, '')
  if (!/^rediss?:\/\//i.test(trimmed)) return null

  try {
    const url = new URL(trimmed)
    return url.protocol === 'redis:' || url.protocol === 'rediss:' ? trimmed : null
  } catch {
    return null
  }
}

export function getRedisUrl() {
  return normalizeRedisUrl(process.env.REDIS_URL)
}

export function hasRedisUrl() {
  return Boolean(getRedisUrl())
}

export async function getRedisClient(): Promise<RedisClient | null> {
  const url = getRedisUrl()
  if (!url) return null

  if (!redisClientPromise) {
    const client = createClient({ url })

    client.on('error', err => {
      console.error('Redis Client Error', err)
    })

    redisClientPromise = client.connect().then(() => client).catch(err => {
      redisClientPromise = null
      throw err
    })
  }

  return redisClientPromise
}
