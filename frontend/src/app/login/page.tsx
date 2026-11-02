"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useLocale } from "@/lib/i18n/locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LogoLockup } from "@/components/Mark";
import { ErrorBanner, Field, PrimaryButton } from "@/components/ui";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("admin@kpc.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/projects");
    }
  }, [loading, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/projects");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("signInFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--ground)] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-10">
      <div className="mx-auto mb-6 flex w-full max-w-[420px] justify-end">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[420px]"
      >
        <div className="mb-6 sm:mb-8">
          <LogoLockup />
          <p className="mt-3 text-[14px] leading-5 text-[var(--muted)] md:text-[13px]">
            {t("appTagline")}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
        >
          <Field
            label={t("email")}
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label={t("password")}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <ErrorBanner message={error} /> : null}
          <PrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? t("signingIn") : t("signIn")}
          </PrimaryButton>
        </form>

        <div className="mt-4 space-y-1 text-[12px] leading-5 text-[var(--muted)]">
          <p>{t("demoAdmin")}</p>
          <p>{t("demoViewer")}</p>
        </div>
      </motion.div>
    </div>
  );
}
