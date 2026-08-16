import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";

// A Supabase project on the free plan pauses after seven days without database
// activity, which is what used to empty the portfolio. One cheap read a day is
// enough to keep it awake. Vercel calls this from the schedule in vercel.json.
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed: without a secret the endpoint would let anyone poll the
  // database, so it stays disabled until one is configured.
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const supabase = getPublicClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (error) {
    console.error(`[keep-alive] Supabase read failed: ${error.message}`);
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    publishedProjects: count ?? 0,
    checkedAt: new Date().toISOString(),
  });
}
