import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  hasSupabaseConfig,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

// A public page only ever reads rows the anonymous role is allowed to see, so
// it does not need the cookie-bound SSR client. Staying cookie-free keeps the
// queries cacheable and stops an unreachable database from holding a render
// open for the whole platform timeout.
const REQUEST_TIMEOUT_MS = 3500;

let client = null;

function timeoutFetch(input, init = {}) {
  return fetch(input, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export function getPublicClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!client) {
    client = createSupabaseClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { fetch: timeoutFetch },
    });
  }

  return client;
}
