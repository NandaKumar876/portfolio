import Redis from 'ioredis'

/* ── Helpers ── */
export function hasRedisUrl(): boolean {
  return !!process.env.REDIS_URL
}

/* ── Singleton client ── */
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | null | undefined
}

let connectionFailed = false

export async function getRedisClient(): Promise<Redis | null> {
  if (!hasRedisUrl()) return null
  if (connectionFailed) return null

  // Reuse existing singleton (important for Next.js hot-reload in dev)
  if (globalThis.__redisClient) return globalThis.__redisClient

  try {
    const url = process.env.REDIS_URL!

    // Redis upstash requires TLS — detect rediss:// scheme automatically
    const isTLS = url.startsWith('rediss://')

    const client = new Redis(url, {
      ...(isTLS ? { tls: {} } : {}),
      maxRetriesPerRequest: 3,
      connectTimeout: 8000,
      lazyConnect: true,
    })

    // Test the connection before returning
    await client.connect()
    await client.ping()

    client.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })

    globalThis.__redisClient = client
    console.log('[Redis] Connected to Redis Cloud ✓')
    return client
  } catch (err) {
    console.error('[Redis] Failed to connect:', err)
    connectionFailed = true        // stop retrying on every request
    globalThis.__redisClient = null
    return null
  }
}
