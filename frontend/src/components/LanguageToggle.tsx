"use client";

import { useLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-1 ${className}`}
      role="group"
      aria-label={t("language")}
    >
      {([
        { id: "en", label: t("english") },
        { id: "fa", label: t("persian") },
      ] as const).map((option) => {
        const active = locale === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => select(option.id)}
            className={`relative h-7 rounded-[4px] px-2.5 text-[12px] transition-colors active:scale-[0.98] ${
              active
                ? "text-[var(--text)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 bottom-0 h-px bg-[var(--orange)]"
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
