/**
 * Environment-aware rate limiter (sliding window, per IP).
 *
 * Uses Redis when REDIS_URL or REDIS_HOST is set in the environment so all
 * instances share the same counter — required for multi-instance deployments.
 * Falls back to an in-memory Map when neither variable is set, which is safe
 * for single-instance servers, local dev, and CI without a Redis sidecar.
 *
 * Window size and max requests are read from env vars so they can be tuned
 * per environment without code changes.
 */

const WINDOW_MS = parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? "60000", 10)
const MAX_REQUESTS = parseInt(process.env.CONTACT_RATE_LIMIT_MAX ?? "5", 10)

// ---------------------------------------------------------------------------
// In-memory fallback (original implementation — used when Redis is absent)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

// Purge stale entries to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > WINDOW_MS) rateLimitMap.delete(ip)
  }
}, WINDOW_MS * 2)

function isRateLimitedMemory(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  if (entry.count >= MAX_REQUESTS) return true
  entry.count++
  return false
}

// ---------------------------------------------------------------------------
// Redis backend — lazy-init so import never crashes when Redis is unavailable
// ---------------------------------------------------------------------------
type RedisLikeClient = {
  connect: () => Promise<unknown>
  incr: (key: string) => Promise<number>
  pexpire: (key: string, ms: number) => Promise<number>
  on: (event: "error" | "ready", callback: (err?: Error) => void) => void
}

let redisClient: RedisLikeClient | null = null
let redisAvailable = false
let redisInitDone = false

async function getRedisClient(): Promise<RedisLikeClient | null> {
  if (redisInitDone) return redisAvailable ? redisClient : null
  redisInitDone = true

  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) return null

  try {
    const { default: Redis } = await import("ioredis")
    const client = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false })
      : new Redis({ host: process.env.REDIS_HOST, lazyConnect: true, enableOfflineQueue: false })

    await client.connect()

    client.on("error", (err: Error) => {
      console.error("[rate-limit] Redis error — falling back to in-memory:", err.message)
      redisAvailable = false
    })
    client.on("ready", () => {
      redisAvailable = true
    })

    redisClient = client
    redisAvailable = true
    return client
  } catch (err) {
    console.error("[rate-limit] Redis connect failed — using in-memory fallback:", (err as Error).message)
    return null
  }
}

async function isRateLimitedRedis(ip: string): Promise<boolean> {
  const client = await getRedisClient()
  if (!client || !redisAvailable) return isRateLimitedMemory(ip)

  try {
    const key = `rl:${ip}`
    // INCR is atomic; first call in a window sets the initial count.
    const count = await client.incr(key)
    if (count === 1) {
      // Align expiry to the window so keys self-expire without a sweeper.
      await client.pexpire(key, WINDOW_MS)
    }
    return count > MAX_REQUESTS
  } catch (err) {
    // Redis op failed mid-request — degrade gracefully to in-memory.
    console.error("[rate-limit] Redis op error — falling back to in-memory:", (err as Error).message)
    return isRateLimitedMemory(ip)
  }
}

// ---------------------------------------------------------------------------
// Public API — drop-in async replacement for the previous sync isRateLimited
// ---------------------------------------------------------------------------
export async function isRateLimited(ip: string): Promise<boolean> {
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    return isRateLimitedRedis(ip)
  }
  return isRateLimitedMemory(ip)
}
