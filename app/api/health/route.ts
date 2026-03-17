import { NextResponse } from "next/server"
import { checkRedisHealth } from "@/lib/rate-limit"

export async function GET() {
  const redis = await checkRedisHealth()

  return NextResponse.json(
    {
      status: "ok",
      redis,
      version: process.env.npm_package_version ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
