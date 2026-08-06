// components/GoogleCaptchaWrapper.jsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const RecaptchaCtx = createContext({ ready: false });
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

export default function GoogleCaptchaWrapper({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    if (!siteKey) {
      return () => {
        mounted = false;
      };
    }

    // Wait for the global grecaptcha to be ready
    function check() {
      if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.execute) {
        window.grecaptcha.ready(() => mounted && setReady(true));
      } else {
        // Try again shortly until the script is loaded
        timeoutId = setTimeout(check, 50);
      }
    }
    check();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const value = useMemo(() => ({ ready }), [ready]);
  return <RecaptchaCtx.Provider value={value}>{children}</RecaptchaCtx.Provider>;
}

// Optional helper hook to get a token for any action
export function useRecaptchaV3() {
  const { ready } = useContext(RecaptchaCtx);

  async function getToken(action = "submit") {
    if (!ready) throw new Error("reCAPTCHA not ready yet.");
    if (!siteKey) throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_KEY.");
    const token = await window.grecaptcha.execute(siteKey, { action });
    return token;
  }

  return { ready, getToken };
}
