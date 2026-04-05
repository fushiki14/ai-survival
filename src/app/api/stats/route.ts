import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function GET() {
  try {
    const count = await redis.get("survival:diagnosis:count");
    return NextResponse.json({ count: Number(count) || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
