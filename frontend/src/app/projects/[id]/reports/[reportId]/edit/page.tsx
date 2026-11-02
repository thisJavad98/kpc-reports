"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import {
  ErrorBanner,
  Field,
  GhostButton,
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/locale";
import { useSetMobileChrome } from "@/lib/mobile-chrome";

export default function EditReportPage() {
  const params = useParams<{ id: string; reportId: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useSetMobileChrome(t("editReport"));

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace(`/projects/${params.id}/reports/${params.reportId}`);
    }
  }, [user, router, params.id, params.reportId]);

  useEffect(() => {
    if (!token || !params.reportId) return;
    api
      .getReport(token, params.reportId)
      .then(({ report }) => {
        setTitle(report.title);
        setContent(report.content);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : t("loadReportFailed"));
      })
      .finally(() => setLoading(false));
  }, [token, params.reportId, t]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !params.reportId) return;
    setSaving(true);
    setError("");
    try {
      await api.updateReport(token, params.reportId, {
        title: title.trim(),
        content: content.trim(),
      });
      router.replace(`/projects/${params.id}/reports/${params.reportId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("updateReportFailed"));
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 md:mb-4">
        <Link
          href={`/projects/${params.id}/reports/${params.reportId}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--text)] md:min-h-0 md:text-[13px]"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {t("backToReport")}
        </Link>
      </div>

      <PageHeader title={t("editReport")} finding={t("editReportFinding")} />

      <Panel className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded bg-[var(--raised)]" />
            <div className="h-40 animate-pulse rounded bg-[var(--raised)]" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label={t("title")}
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextArea
              label={t("reportBody")}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {error ? <ErrorBanner message={error} /> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? t("saving") : t("saveChanges")}
              </PrimaryButton>
              <GhostButton
                type="button"
                className="w-full sm:w-auto"
                onClick={() =>
                  router.push(
                    `/projects/${params.id}/reports/${params.reportId}`,
                  )
                }
              >
                {t("cancel")}
              </GhostButton>
            </div>
          </form>
        )}
      </Panel>
    </AppShell>
  );
}
