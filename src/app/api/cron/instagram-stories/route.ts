import { NextResponse } from "next/server";
import { runMorningInstagramStories } from "@/lib/instagram/run-morning-stories";

export const maxDuration = 300;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const includeMockups = url.searchParams.get("includeMockups") === "1";
  const limitRaw = Number(url.searchParams.get("limit") || "25");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 25)
    : 25;

  const result = await runMorningInstagramStories({
    dryRun,
    limit,
    includeMockups,
  });
  return NextResponse.json(result);
}
