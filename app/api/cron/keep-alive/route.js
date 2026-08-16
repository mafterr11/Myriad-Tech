import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";

// A Supabase project on the free plan pauses after seven days without database
// activity, which is what used to empty the portfolio. Vercel calls this from
// the schedule in vercel.json.
//
// The schedule runs every five days, so a run that fails is not retried for
// another five — the next one would land on day ten and the project would
// already be asleep. The retries below exist to make sure a transient blip
// never costs the whole slot.
export const dynamic = "force-dynamic";

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  let failure = null;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const { count, error } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true);

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        ok: true,
        publishedProjects: count ?? 0,
        attempts: attempt,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      failure = error;
      console.warn(
        `[keep-alive] attempt ${attempt}/${ATTEMPTS} failed: ${error?.message}`,
      );
      if (attempt < ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  // A non-2xx response is what makes the run show as failed in the Vercel cron
  // log, which is the only warning that the project is about to pause.
  console.error(`[keep-alive] all attempts failed: ${failure?.message}`);
  return NextResponse.json(
    { ok: false, error: failure?.message ?? "unknown error" },
    { status: 502 },
  );
}
