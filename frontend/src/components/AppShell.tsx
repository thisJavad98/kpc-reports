"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, List, SignOut, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n/dictionaries";
import { useMobileChrome } from "@/lib/mobile-chrome";
import { Mark } from "./Mark";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { title, action } = useMobileChrome();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] bg-[var(--ground)] px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="h-8 w-40 animate-pulse rounded bg-[var(--raised)]" />
          <div className="h-40 animate-pulse rounded-[6px] bg-[var(--surface)]" />
          <div className="h-40 animate-pulse rounded-[6px] bg-[var(--surface)]" />
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/projects", label: t("projects"), icon: Briefcase },
  ];

  const NavBody = (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-6 pt-2 md:px-3 md:pt-5">
        <Link
          href="/projects"
          className="flex min-h-11 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Mark size={34} />
          <div>
            <div className="text-[14px] font-semibold tracking-tight text-[var(--text)]">
              KPC
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[12px] text-[var(--muted)]">Reports</span>
              <span aria-hidden="true" className="h-px w-6 bg-[var(--orange)]" />
            </div>
            <div className="mt-1 text-[12px] text-[var(--muted)]">
              {user.role === "ADMIN" ? t("adminWorkspace") : t("viewerWorkspace")}
            </div>
          </div>
        </Link>
      </div>

      <div className="px-4 md:px-3">
        <div className="mb-2 px-2 text-[12px] text-[var(--muted)]">
          {t("browse")}
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`relative flex min-h-11 items-center gap-2 rounded-[6px] px-3 text-[14px] transition-colors md:h-8 md:min-h-0 md:px-2 md:text-[13px] ${
                  active
                    ? "bg-[var(--orange-soft)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 start-0 w-[2px] rounded-full bg-[var(--orange)] md:inset-y-1"
                  />
                ) : null}
                <Icon size={18} weight="regular" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[var(--border)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-3">
        <div className="mb-3 px-2">
          <div className="truncate text-[14px] text-[var(--text)] md:text-[13px]">
            {user.name}
          </div>
          <div className="truncate text-[12px] text-[var(--muted)]">
            {user.email}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="flex min-h-11 w-full items-center gap-2 rounded-[6px] px-2 text-[14px] text-[var(--muted)] transition-transform active:scale-[0.98] hover:bg-[var(--raised)] hover:text-[var(--text)] md:h-9 md:min-h-0 md:text-[13px]"
        >
          <SignOut size={16} />
          {t("signOut")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--ground)] text-[var(--text)]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px]">
        <aside className="hidden w-[240px] shrink-0 border-e border-[var(--border)] md:block">
          {NavBody}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Phone top bar: 48px, screen name, menu, ≤1 action */}
          <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-[var(--border)] bg-[var(--ground)]/95 px-3 backdrop-blur-sm pt-[env(safe-area-inset-top)] md:hidden">
            <button
              type="button"
              aria-label={t("openMenu")}
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-[var(--text)] active:scale-[0.98]"
            >
              <List size={22} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-[14px] font-medium text-[var(--text)]">
                {title}
              </div>
            </div>

            <div className="flex h-11 min-w-11 shrink-0 items-center justify-end">
              {action}
            </div>
          </header>

          <main className="flex-1 px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label={t("closeMenu")}
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 flex w-[min(100%,360px)] flex-col bg-[var(--ground)]"
            >
              <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3 pt-[env(safe-area-inset-top)]">
                <div className="flex items-center gap-2">
                  <Mark size={26} />
                  <span className="text-[14px] font-semibold">KPC</span>
                </div>
                <button
                  type="button"
                  aria-label={t("closeMenu")}
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-[6px] active:scale-[0.98]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{NavBody}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
