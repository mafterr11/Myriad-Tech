import { hasSupabaseConfig, supabaseConfigError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export function isAdminClaims(claims) {
  return Boolean(claims?.sub && claims?.app_metadata?.role === "admin");
}

export async function getAdminContext() {
  if (!hasSupabaseConfig()) {
    return {
      authorized: false,
      supabase: null,
      claims: null,
      error: supabaseConfigError,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims ?? null;

    if (error || !isAdminClaims(claims)) {
      return {
        authorized: false,
        supabase,
        claims,
        error: error?.message ?? "Admin authorization is required.",
      };
    }

    return { authorized: true, supabase, claims, error: null };
  } catch (error) {
    return {
      authorized: false,
      supabase: null,
      claims: null,
      error: error?.message ?? "Admin authorization is unavailable.",
    };
  }
}

// Every mutation re-checks the signed identity instead of trusting the page
// that rendered the form.
export async function requireAdminClient() {
  const context = await getAdminContext();
  if (!context.authorized) {
    throw new Error(context.error || "Admin authorization is required.");
  }
  return context.supabase;
}
