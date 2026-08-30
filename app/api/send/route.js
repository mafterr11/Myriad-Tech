import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";
import * as z from "zod";

const RECAPTCHA_ACTION = "InquirySubmit";
// Google's documented starting threshold is 0.5. The previous 0.1 accepted
// traffic reCAPTCHA already considered very likely automated.
const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_ALLOWED_HOSTNAMES = new Set([
  "myriad-tech.ro",
  "www.myriad-tech.ro",
]);

const contactFormSchema = z.object({
  nume: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(254),
  telefon: z.union([
    z.literal(""),
    z.string().trim().min(10).max(30),
  ]),
  mesaj: z.string().trim().min(10).max(200),
  acceptTerms: z.literal(true),
  gRecaptchaToken: z.string().min(1),
});

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing RECAPTCHA_SECRET_KEY");
  }

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(`Google reCAPTCHA returned ${response.status}`);
  }

  const result = await response.json();
  const valid =
    result.success === true &&
    typeof result.score === "number" &&
    result.score >= RECAPTCHA_MIN_SCORE &&
    result.action === RECAPTCHA_ACTION &&
    RECAPTCHA_ALLOWED_HOSTNAMES.has(result.hostname);

  return { valid, result };
}

export async function POST(request) {
  let requestBody;

  try {
    requestBody = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsedForm = contactFormSchema.safeParse(requestBody);
  if (!parsedForm.success) {
    return Response.json(
      { success: false, message: "Invalid form data" },
      { status: 422 },
    );
  }

  const { gRecaptchaToken, ...formData } = parsedForm.data;

  try {
    const { valid, result } = await verifyRecaptcha(gRecaptchaToken);

    if (!valid) {
      console.warn("reCAPTCHA rejected contact submission", {
        action: result.action,
        hostname: result.hostname,
        score: result.score,
        errorCodes: result["error-codes"],
      });

      return Response.json(
        { success: false, message: "reCAPTCHA verification failed" },
        { status: 403 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Contact email is not configured");
      return Response.json(
        { success: false, message: "Email service is not configured" },
        { status: 503 },
      );
    }

    const resend = new Resend(resendApiKey);

    try {
      const { data, error } = await resend.emails.send({
        from: "Myriad@myriad-tech.ro",
        to: ["alexandrumaftei95@gmail.com"],
        subject: "Myriad - Solicitare noua",
        react: EmailTemplate(formData),
      });

      if (error) {
        console.error("Resend rejected contact email", error);
        return Response.json(
          { success: false, message: "Email could not be sent" },
          { status: 502 },
        );
      }

      return Response.json({ success: true, data });
    } catch (error) {
      console.error("Resend request failed", error);
      return Response.json(
        { success: false, message: "Email service could not be reached" },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Contact submission failed", error);
    return Response.json(
      { success: false, message: "Contact submission failed" },
      { status: 500 },
    );
  }
}
