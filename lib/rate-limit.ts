/**
 * Environment-aware rate limiter (sliding window, per IP).
 *
 * Uses Redis when REDIS_URL or REDIS_HOST is set in the environment so all
 * instances share a shared counter — required for multi-instance deployments.
 * Falls back to an in-memory Map when neither variable is set, which is safe
 * for single-instance servers, local dev, and CI without a Redis sidecar.
 *
 * Window size and max requests are read from env vars so they can be tuned
 * per environment without code changes:
 *   CONTACT_RATE_LIMIT_WINDOW_MS  — window duration in ms  (default: 60000)
 *   CONTACT_RATE_LIMIT_MAX        — max requests per window (default: 5)
 *   REDIS_URL                     — full Redis URL (e.g. redis://host:6379)
 *   REDIS_HOST                    — Redis hostname (used when REDIS_URL absent)
 *
 * Algorithm: sliding window.
 * The Redis path uses a per-IP sorted set where each request is recorded as
 * a member with its arrival timestamp as the score.  On every check, entries
 * older than WINDOW_MS are pruned before counting.  This gives a true rolling
 * window with no boundary-burst vulnerability (unlike a fixed-window counter).
 * The in-memory fallback uses a simpler fixed-window counter (acceptable for
 * single-instance use; the sliding-window guarantee only matters at scale).
 *
 * Fail-open vs fail-closed decision:
 * This rate limiter is FAIL-OPEN.  When Redis is unavailable (connection
 * refused, timeout, mid-request network error) the limiter silently falls
 * back to the in-memory counter rather than returning 429 to every request.
 * Rationale: this guards a low-volume contact form.  Failing closed (blocking
 * all requests on Redis outage) would cause a complete service outage for a
 * feature that is not safety-critical.  The in-memory fallback still enforces
 * the limit within a single process.  If strict cross-instance enforcement is
 * required during outages, change the catch block to return true (fail-closed).
 */

import { randomUUID } from "node:crypto"

const WINDOW_MS = parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? "60000", 10)
const MAX_REQUESTS = parseInt(process.env.CONTACT_RATE_LIMIT_MAX ?? "5", 10)

// ---------------------------------------------------------------------------
// In-memory fallback (fixed window — used when Redis is absent)
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

// Sliding-window Lua script.
// Uses a sorted set: score = request timestamp (ms), member = unique request ID.
// All operations (prune, count, insert, expire) run atomically in one EVAL so
// there is no race between the ZADD and the ZCARD/PEXPIRE calls.
//
// KEYS[1] = rate-limit key (e.g. "rl:<ip>")
// ARGV[1] = current timestamp in ms
// ARGV[2] = window size in ms
// ARGV[3] = max requests allowed in the window
// ARGV[4] = unique ID for this request (member in the sorted set)
//
// Returns: 0 = allowed, 1 = rate limited
const SLIDING_WINDOW_SCRIPT = `
local now    = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit  = tonumber(ARGV[3])
local id     = ARGV[4]

-- Evict entries outside the current window (score <= now - window).
-- Entries with score > (now - window) remain — they are within the rolling window.
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - window)

-- Count how many requests remain in the window.
local count = tonumber(redis.call('ZCARD', KEYS[1]))

if count >= limit then
  -- Keep the key alive so it eventually auto-expires even with no new requests.
  redis.call('PEXPIRE', KEYS[1], window)
  return 1
end

-- Record this request and reset the TTL to a full window from now.
redis.call('ZADD', KEYS[1], now, id)
redis.call('PEXPIRE', KEYS[1], window)
return 0
`

/**
 * Strips connection-string credentials from error messages before logging.
 * Redis error messages can embed the full URL including passwords, e.g.:
 *   "connect ECONNREFUSED redis://:mypassword@redis.example.com:6379"
 * Redact anything matching <scheme>://<userinfo>@<host> to prevent accidental
 * credential exposure in log aggregators.
 */
function safeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  return raw.replace(/\w+:\/\/[^@\s]*@/g, "[REDACTED_URL]")
}

type RedisLikeClient = {
  connect: () => Promise<unknown>
  eval: (script: string, numkeys: number, ...args: Array<string | number>) => Promise<unknown>
  on: (event: "error" | "ready", callback: (err?: Error) => void) => void
  ping: () => Promise<string>
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
    // connectTimeout: fail fast during initial handshake (default is 10 s — too long for a web request).
    // commandTimeout: cap per-command latency so a hung Redis never stalls the contact route handler.
    // enableOfflineQueue: false ensures commands are never buffered while the connection is down.
    const redisOpts = { lazyConnect: true, enableOfflineQueue: false, connectTimeout: 2000, commandTimeout: 1000 }
    const client = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, redisOpts)
      : new Redis({ host: process.env.REDIS_HOST, ...redisOpts })

    await client.connect()

    client.on("error", (err: Error) => {
      // FAIL-OPEN: mark Redis as unavailable so subsequent calls use in-memory.
      console.error("[rate-limit] Redis error — falling back to in-memory:", safeErrorMessage(err))
      redisAvailable = false
    })
    client.on("ready", () => {
      redisAvailable = true
    })

    redisClient = client
    redisAvailable = true
    return client
  } catch (err) {
    // FAIL-OPEN: connection failure at startup — proceed with in-memory limiter.
    console.error("[rate-limit] Redis connect failed — using in-memory fallback:", safeErrorMessage(err))
    return null
  }
}

async function isRateLimitedRedis(ip: string): Promise<boolean> {
  const client = await getRedisClient()
  if (!client || !redisAvailable) return isRateLimitedMemory(ip)

  try {
    const key = `rl:${ip}`
    const now = Date.now()
    const requestId = randomUUID()
    // Atomic sliding-window check: prune -> count -> insert, all in one EVAL.
    const result = Number(
      await client.eval(SLIDING_WINDOW_SCRIPT, 1, key, String(now), String(WINDOW_MS), String(MAX_REQUESTS), requestId)
    )
    // Guard against unexpected non-numeric responses from Redis.
    if (!Number.isFinite(result)) return isRateLimitedMemory(ip)
    return result === 1
  } catch (err) {
    // Intentional: rate limiter fails open on Redis unavailability to preserve service availability.
    console.log(JSON.stringify({ event: "rate_limit_redis_error", error: safeErrorMessage(err), timestamp: new Date().toISOString() }))
    return isRateLimitedMemory(ip)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function isRateLimited(ip: string): Promise<boolean> {
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    return isRateLimitedRedis(ip)
  }
  return isRateLimitedMemory(ip)
}

/**
 * Lightweight Redis health check for the /api/health endpoint.
 * Reuses the shared lazy-init client so no new connection is opened.
 * Always resolves — never throws.
 */
export async function checkRedisHealth(): Promise<"connected" | "unavailable"> {
  const client = await getRedisClient()
  if (!client || !redisAvailable) return "unavailable"
  try {
    await client.ping()
    return "connected"
  } catch {
    return "unavailable"
  }
}
