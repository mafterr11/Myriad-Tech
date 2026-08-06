"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const supportedLocales = new Set(["ro", "en"]);

export async function signOut(formData) {
  const localeValue = formData?.get("locale");
  const locale = supportedLocales.has(localeValue) ? localeValue : "ro";

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } finally {
    redirect(`/${locale}/admin-login`);
  }
}
