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
import { t } from "@/lib/i18n/dictionaries";
import { useSetMobileChrome } from "@/lib/mobile-chrome";
import { projectTabHref } from "@/lib/project-tabs";

export default function NewReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useSetMobileChrome(t("writeReportTitle"));

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace(projectTabHref(params.id));
    }
  }, [user, router, params.id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !params.id) return;
    setSaving(true);
    setError("");
    try {
      const { report } = await api.createReport(token, params.id, {
        title: title.trim(),
        content: content.trim(),
      });
      router.replace(`/projects/${params.id}/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveReportFailed"));
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 md:mb-4">
        <Link
          href={projectTabHref(params.id)}
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--text)] md:min-h-0 md:text-[13px]"
        >
          <ArrowLeft size={14} />
          {t("backToProject")}
        </Link>
      </div>

      <PageHeader title={t("writeReportTitle")} finding={t("writeReportFinding")} />

      <Panel className="p-4 sm:p-5">
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
            hint={t("reportBodyHint")}
          />
          {error ? <ErrorBanner message={error} /> : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <PrimaryButton type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? t("saving") : t("saveReport")}
            </PrimaryButton>
            <GhostButton
              type="button"
              className="w-full sm:w-auto"
              onClick={() => router.push(projectTabHref(params.id))}
            >
              {t("cancel")}
            </GhostButton>
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
