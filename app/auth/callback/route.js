import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/ro/admin";
}

function localeFromPath(path) {
  const locale = path.split("/")[1];
  return locale === "en" ? "en" : "ro";
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(nextPath, url.origin));
      }
    } catch {
      // Fall through to the localized login error below.
    }
  }

  const locale = localeFromPath(nextPath);
  const loginUrl = new URL(`/${locale}/admin-login`, url.origin);
  loginUrl.searchParams.set("error", "callback");
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}
