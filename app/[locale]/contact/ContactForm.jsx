"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  User,
  MailIcon,
  ArrowRightIcon,
  MessageSquare,
  PhoneIcon,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useRecaptchaV3 } from "@/app/GoogleCaptchaWrapper";

const formSchema = z.object({
  nume: z.string().min(3, { message: "Enter your full name" }),
  email: z.string().email(),
  telefon: z.string().min(10, { message: "Enter a valid phone number" }),
  mesaj: z
    .string()
    .min(10, { message: "Min 10 characters" })
    .max(200, { message: "Max 200 characters." }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the GDPR",
  }),
});

export default function SolicitatiOfertaForm() {
  const { toast } = useToast();
  const t = useTranslations("Contact");
  const { ready, getToken } = useRecaptchaV3();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nume: "",
      email: "",
      telefon: "",
      mesaj: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (formData) => {
    try {
      if (!ready) throw new Error("ReCAPTCHA not ready");
      const gRecaptchaToken = await getToken("InquirySubmit");

      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, gRecaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Network response was not ok");
      }

      toast({
        title: "Mulțumim pentru interesul acordat!",
        description: "Vă vom contacta cât mai curând!",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Ceva nu a mers bine!",
        description: error?.message || "Vă rugăm să încercați mai târziu!",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="mt-0 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="nume"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="nume">{t("form.name.label")}</Label>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder={t("form.name.input")}
                    type="text"
                    id="nume"
                    autoComplete="name"
                    className="contact-input pr-12"
                    {...field}
                  />
                </FormControl>
                <User className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-black/40" size={18} aria-hidden="true" />
              </div>
              <FormMessage className="ml-0 mt-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">{t("form.email.label")}</Label>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder={t("form.email.input")}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="contact-input pr-12"
                    {...field}
                  />
                </FormControl>
                <MailIcon className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-black/40" size={18} aria-hidden="true" />
              </div>
              <FormMessage className="ml-0 mt-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefon"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="telefon">{t("form.tel.label")}</Label>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder={t("form.tel.input")}
                    type="tel"
                    id="telefon"
                    autoComplete="tel"
                    className="contact-input pr-12"
                    {...field}
                  />
                </FormControl>
                <PhoneIcon className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-black/40" size={18} aria-hidden="true" />
              </div>
              <FormMessage className="ml-0 mt-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mesaj"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="mesaj">{t("form.msg.label")}</Label>
              <div className="relative">
                <FormControl>
                  <Textarea
                    placeholder={t("form.msg.input")}
                    id="mesaj"
                    className="contact-input min-h-[10rem] pr-12"
                    {...field}
                  />
                </FormControl>
                <MessageSquare className="pointer-events-none absolute top-4 right-4 text-black/40" size={18} aria-hidden="true" />
              </div>
              <FormMessage className="ml-0 mt-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="pt-1">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Input
                    type="checkbox"
                    id="acceptTerms"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="mt-1 h-4 w-4 shrink-0 rounded-none border-line accent-accent"
                  />
                </FormControl>
                <Label htmlFor="acceptTerms" className="mb-0 text-sm font-normal leading-6 tracking-normal">
                  {t("form.gdpr")}
                </Label>
              </div>
              <FormMessage className="ml-0 mt-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <div className="recaptcha-branding flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-start">
          <Button
            type="submit"
            className="flex w-full items-center gap-x-2 sm:w-auto"
            disabled={!ready || form.formState.isSubmitting}
            title={!ready ? "reCAPTCHA loading…" : undefined}
          >
            {t("form.btn")}
            <ArrowRightIcon size={18} aria-hidden="true" />
          </Button>

          <p className="max-w-md text-xs leading-5 text-black/55">
            {t("form.reCaptcha.1")} {" "}
            <a href="https://policies.google.com/privacy" className="text-accent underline underline-offset-2">
              {t("form.reCaptcha.2")}
            </a>{" "}
            {t("form.reCaptcha.3")} {" "}
            <a href="https://policies.google.com/terms" className="text-accent underline underline-offset-2">
              {t("form.reCaptcha.4")}
            </a>{" "}
            {t("form.reCaptcha.5")}
          </p>
        </div>
      </form>
    </Form>
  );
}
