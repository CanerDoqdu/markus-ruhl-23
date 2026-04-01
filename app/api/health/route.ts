import { NextResponse } from "next/server"
import { checkRedisHealth } from "@/lib/rate-limit"
import { logEvent } from "@/lib/api/log"

/**
 * GET /api/health
 *
 * Returns service health status. Always responds HTTP 200 — callers MUST
 * inspect the body `status` field to determine overall service health.
 *
 * Response schema (stable — wave-1 contract):
 * {
 *   status:       'ok' | 'degraded'
 *   dependencies: { redis: 'ok' | 'unavailable' }
 *   version:      string   (npm package version or 'unknown')
 *   timestamp:    ISO-8601 UTC
 * }
 *
 * Fail-open contract:
 *   - status === 'ok':       all dependencies reachable and healthy
 *   - status === 'degraded': one or more non-critical dependencies unavailable;
 *     the service continues accepting requests and HTTP 200 is returned in
 *     BOTH states. Degraded MUST NOT be treated as a fatal error by callers.
 *
 * The `dependencies.redis` field conveys only connectivity state and is
 * intentionally decoupled from `status` to allow future dependencies to be
 * added without breaking existing parsers.
 */
export async function GET() {
  const start = Date.now()

  // checkRedisHealth() is documented as always-resolving, but we wrap defensively
  // so an unexpected rejection never leaks a stack trace to the client.
  let redisHealth: "connected" | "unavailable" = "unavailable"
  try {
    redisHealth = await checkRedisHealth()
  } catch {
    // Treat an unexpected throw as unavailable — fail-open, never expose error.
  }

  // Normalise the internal 'connected'/'unavailable' vocabulary to the public
  // contract values 'ok'/'unavailable' so callers never see implementation
  // detail from the rate-limit module.
  const redis = redisHealth === "connected" ? "ok" : "unavailable"
  const status = redis === "ok" ? "ok" : "degraded"

  const payload = {
    status,
    dependencies: { redis },
    version: process.env.npm_package_version ?? "unknown",
    timestamp: new Date().toISOString(),
  }

  logEvent({
    event: "health_check",
    route: "/api/health",
    method: "GET",
    status: 200,
    durationMs: Date.now() - start,
    serviceStatus: status,
    redisStatus: redis,
  })

  return NextResponse.json(payload, { status: 200 })
}
