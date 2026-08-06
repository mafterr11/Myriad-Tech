"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm({ locale, nextPath, error }) {
  const t = useTranslations("AdminLogin");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(error ? t("invalid") : "");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsPending(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setMessage(t("unavailable"));
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setMessage(t("invalid"));
        return;
      }

      router.push(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : `/${locale}/admin`);
      router.refresh();
    } catch {
      setMessage(t("unavailable"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg border border-line bg-white/70 p-6 sm:p-8"
    >
      <span className="section-kicker">Myriad Tech / Admin</span>
      <h1 className="mt-4 text-3xl">{t("title")}</h1>
      <p className="mt-4 text-black/65">{t("subtitle")}</p>
      <div className="mt-8 grid gap-5">
        <div>
          <Label htmlFor="admin-email">{t("email")}</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="admin-password">{t("password")}</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {message ? <p className="text-sm text-red-700" role="alert">{message}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? t("working") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
