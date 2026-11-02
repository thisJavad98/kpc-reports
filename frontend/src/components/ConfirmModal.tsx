"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WarningCircle, X } from "@phosphor-icons/react";
import { GhostButton, PrimaryButton } from "./ui";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70"
            onClick={() => {
              if (!busy) onCancel();
            }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative w-full max-w-[420px] rounded-t-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[8px] sm:p-5"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[var(--orange-soft)] text-[var(--orange)] sm:h-9 sm:w-9">
                <WarningCircle size={20} weight="fill" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className="text-[16px] font-medium text-[var(--text)]"
                >
                  {title}
                </h2>
                <p
                  id={descId}
                  className="mt-1 text-[14px] leading-relaxed text-[var(--muted)] sm:text-[13px]"
                >
                  {message}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={busy}
                onClick={onCancel}
                className="flex h-11 w-11 items-center justify-center rounded-[6px] text-[var(--muted)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)] disabled:opacity-50 sm:h-8 sm:w-8"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <GhostButton
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="w-full sm:w-auto"
              >
                {cancelLabel}
              </GhostButton>
              <PrimaryButton
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`w-full sm:w-auto ${
                  danger ? "bg-[#ff5c6c] text-black hover:bg-[#ff5c6c]" : ""
                }`}
              >
                {busy ? "…" : confirmLabel}
              </PrimaryButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
