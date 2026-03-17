import { NextResponse } from "next/server"
import { checkRedisHealth } from "@/lib/rate-limit"

export async function GET() {
  const redisStatus = await checkRedisHealth()
  const redis = redisStatus === "connected" ? "ok" : "unavailable"

  return NextResponse.json(
    {
      status: redis === "ok" ? "ok" : "degraded",
      redis,
      version: process.env.npm_package_version ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
