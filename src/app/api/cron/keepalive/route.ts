import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Keep-alive endpoint: pings the Supabase DB so the (free-tier) Postgres
// compute never auto-pauses from inactivity. Called by the Vercel Cron job
// (vercel.json) and/or an external uptime pinger every few minutes.
//
// The endpoint is intentionally open: it only runs `SELECT 1`, which is
// harmless, and keeping it unauthenticated lets free uptime monitors (e.g.
// UptimeRobot) call it without header configuration. If CRON_SECRET is set
// AND an Authorization header is provided, it must match.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
