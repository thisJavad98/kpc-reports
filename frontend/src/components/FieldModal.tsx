"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { Field, GhostButton, PrimaryButton, TextArea } from "./ui";

type FieldModalProps = {
  open: boolean;
  title: string;
  body: string;
  keyLabel: string;
  keyHint: string;
  valueLabel: string;
  valueHint: string;
  cancelLabel: string;
  saveLabel: string;
  savingLabel: string;
  initialKey?: string;
  initialValue?: string;
  busy?: boolean;
  error?: string;
  onClose: () => void;
  onSave: (payload: { key: string; value: string }) => Promise<void> | void;
};

export function FieldModal({
  open,
  title,
  body,
  keyLabel,
  keyHint,
  valueLabel,
  valueHint,
  cancelLabel,
  saveLabel,
  savingLabel,
  initialKey = "",
  initialValue = "",
  busy = false,
  error,
  onClose,
  onSave,
}: FieldModalProps) {
  const titleId = useId();
  const descId = useId();
  const keyRef = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!open) return;
    setKey(initialKey);
    setValue(initialValue);
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => keyRef.current?.focus(), 30);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, busy, onClose, initialKey, initialValue]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!key.trim() || busy) return;
    await onSave({ key: key.trim(), value: value.trim() });
  }

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
            aria-label={cancelLabel}
            className="absolute inset-0 bg-black/70"
            onClick={() => {
              if (!busy) onClose();
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative w-full max-w-[440px] rounded-t-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[8px] sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
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
                  {body}
                </p>
              </div>
              <button
                type="button"
                aria-label={cancelLabel}
                disabled={busy}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-[6px] text-[var(--muted)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)] disabled:opacity-50 sm:h-8 sm:w-8"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Field
                ref={keyRef}
                label={keyLabel}
                name="fieldKey"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                required
                hint={keyHint}
                disabled={busy}
              />
              <TextArea
                label={valueLabel}
                name="fieldValue"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                hint={valueHint}
                disabled={busy}
                className="min-h-[110px]"
              />
              {error ? (
                <p className="text-[13px] text-[var(--negative)]">{error}</p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <GhostButton
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="w-full sm:w-auto"
                >
                  {cancelLabel}
                </GhostButton>
                <PrimaryButton
                  type="submit"
                  disabled={busy || !key.trim()}
                  className="w-full sm:w-auto"
                >
                  {busy ? savingLabel : saveLabel}
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
