import Link from "next/link";
import { forwardRef } from "react";

export function PageHeader({
  title,
  finding,
  action,
  hideTitleOnMobile = true,
}: {
  title: string;
  finding?: string;
  action?: React.ReactNode;
  /** Title already shown in the 48px mobile top bar */
  hideTitleOnMobile?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1
          className={`text-[20px] font-medium leading-tight tracking-tight text-[var(--text)] md:text-[26px] ${
            hideTitleOnMobile ? "hidden md:block" : ""
          }`}
        >
          {title}
        </h1>
        {finding ? (
          <p
            className={`max-w-[65ch] text-[13px] leading-5 text-[var(--muted)] ${
              hideTitleOnMobile ? "mt-0 md:mt-1" : "mt-1"
            }`}
          >
            {finding}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto [&>a]:w-full sm:[&>a]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[6px] border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </section>
  );
}

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function PrimaryButton({ children, className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-[6px] bg-[var(--orange)] px-3 text-[14px] font-semibold text-black transition-transform enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:min-h-0 md:text-[13px] ${className}`}
    >
      {children}
    </button>
  );
});

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[var(--control)] bg-[var(--surface)] px-3 text-[14px] text-[var(--text)] transition-transform enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:min-h-0 md:text-[13px] ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[var(--orange)] transition-transform active:scale-[0.98] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export const Field = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }
>(function Field({ label, hint, id, className = "", ...props }, ref) {
  const fieldId = id ?? props.name;
  return (
    <label className="block space-y-2">
      <span className="block text-[14px] font-medium text-[var(--text)] md:text-[13px]">
        {label}
      </span>
      <input
        ref={ref}
        id={fieldId}
        className={`h-11 w-full rounded-[6px] border border-[var(--control)] bg-[var(--ground)] px-3 text-[16px] text-[var(--text)] outline-none transition-shadow placeholder:text-[var(--muted)] focus:border-[var(--orange)] focus:ring-1 focus:ring-[var(--orange)] md:h-10 md:text-[13px] ${className}`}
        {...props}
      />
      {hint ? (
        <span className="block text-[12px] text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    hint?: string;
  }
>(function TextArea({ label, hint, id, className = "", ...props }, ref) {
  const fieldId = id ?? props.name;
  return (
    <label className="block space-y-2">
      <span className="block text-[14px] font-medium text-[var(--text)] md:text-[13px]">
        {label}
      </span>
      <textarea
        ref={ref}
        id={fieldId}
        className={`min-h-[180px] w-full rounded-[6px] border border-[var(--control)] bg-[var(--ground)] px-3 py-3 text-[16px] leading-relaxed text-[var(--text)] outline-none transition-shadow placeholder:text-[var(--muted)] focus:border-[var(--orange)] focus:ring-1 focus:ring-[var(--orange)] md:min-h-[220px] md:text-[13px] ${className}`}
        {...props}
      />
      {hint ? (
        <span className="block text-[12px] text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
});

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-8 sm:px-5 sm:py-10">
      <h2 className="text-[16px] font-medium text-[var(--text)]">{title}</h2>
      <p className="max-w-[48ch] text-[14px] leading-5 text-[var(--muted)] md:text-[13px]">
        {body}
      </p>
      {action ? (
        <div className="w-full [&>button]:w-full sm:w-auto sm:[&>button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[6px] border border-[#4a2430] bg-[#2c1a20] px-3 py-2.5 text-[14px] text-[#e5566f] md:text-[13px]">
      {message}
    </div>
  );
}

export function ListRowLink({
  href,
  icon,
  title,
  subtitle,
  trailing,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-3 py-3 transition-colors active:bg-[var(--raised)]/80 sm:px-5"
    >
      <span className="shrink-0 text-[var(--orange)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="truncate text-[14px] font-medium text-[var(--text)]">
            {title}
          </span>
          {trailing}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-[var(--muted)]">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
