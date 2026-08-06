import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

function copyHeaders(target, headers) {
  if (!headers) {
    return;
  }

  if (typeof headers.forEach === "function") {
    headers.forEach((value, key) => {
      target.headers.set(key, value);
    });
    return;
  }

  if (typeof headers.entries === "function") {
    for (const [key, value] of headers.entries()) {
      target.headers.set(key, value);
    }
    return;
  }

  if (typeof headers === "object") {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        target.headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
      }
    });
  }
}

export async function updateSession(request, nextMiddleware) {
  if (!hasSupabaseConfig()) {
    return nextMiddleware(request);
  }

  let supabaseResponse = NextResponse.next({ request });
  let refreshedCookies = [];
  let refreshedHeaders = null;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        refreshedCookies = cookiesToSet;
        refreshedHeaders = headers;
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Public pages should still be localized if Supabase is temporarily unavailable.
  }

  const response = await nextMiddleware(request);

  refreshedCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  copyHeaders(response, refreshedHeaders);

  return response;
}
