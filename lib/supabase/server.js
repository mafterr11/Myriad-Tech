import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  hasSupabaseConfig,
  supabaseConfigError,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export async function createClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(supabaseConfigError);
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies. The proxy refreshes them.
        }
      },
    },
  });
}
