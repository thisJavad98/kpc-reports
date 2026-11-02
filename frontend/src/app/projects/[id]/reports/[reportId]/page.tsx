"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PencilSimple, Trash } from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  ErrorBanner,
  GhostButton,
  IconButton,
  PageHeader,
  Panel,
  PrimaryButton,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useConfirm } from "@/lib/confirm";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/dictionaries";
import { useSetMobileChrome } from "@/lib/mobile-chrome";
import type { ReportDetail } from "@/lib/types";

export default function ReportDetailPage() {
  const params = useParams<{ id: string; reportId: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { confirm } = useConfirm();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const mobileAction = useMemo(() => {
    if (!isAdmin || !report) return null;
    return (
      <IconButton
        type="button"
        aria-label={t("edit")}
        onClick={() =>
          router.push(`/projects/${params.id}/reports/${report.id}/edit`)
        }
      >
        <PencilSimple size={20} weight="bold" />
      </IconButton>
    );
  }, [isAdmin, report, router, params.id]);

  useSetMobileChrome(
    loading ? t("openingReport") : report?.title ?? t("reportSingular"),
    mobileAction,
  );

  const load = useCallback(async () => {
    if (!token || !params.reportId) return;
    setLoading(true);
    setError("");
    try {
      const { report: next } = await api.getReport(token, params.reportId);
      setReport(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadReportFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, params.reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete() {
    if (!token || !report) return;
    const ok = await confirm({
      title: t("deleteReportTitle"),
      message: t("deleteReportConfirm", { name: report.title }),
      confirmLabel: t("delete"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteReport(token, report.id);
      router.replace(`/projects/${params.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("deleteReportFailed"));
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 md:mb-4">
        <Link
          href={`/projects/${params.id}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--text)] md:min-h-0 md:text-[13px]"
        >
          <ArrowLeft size={14} />
          {t("backToProject")}
        </Link>
      </div>

      <PageHeader
        title={
          loading ? t("openingReport") : report?.title ?? t("reportSingular")
        }
        finding={
          report
            ? t("writtenBy", {
                name: report.createdBy.name,
                date: formatDateTime(report.updatedAt),
              })
            : undefined
        }
        action={
          isAdmin && report ? (
            <>
              <PrimaryButton
                type="button"
                className="hidden md:inline-flex"
                onClick={() =>
                  router.push(
                    `/projects/${params.id}/reports/${report.id}/edit`,
                  )
                }
              >
                <PencilSimple size={16} className="me-1.5" />
                {t("edit")}
              </PrimaryButton>
              <GhostButton
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="border-[var(--negative)]/40 text-[var(--negative)]"
              >
                <Trash size={16} className="me-1.5" />
                {deleting ? t("deleting") : t("delete")}
              </GhostButton>
            </>
          ) : null
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      <Panel className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--raised)]" />
            <div className="h-4 w-full animate-pulse rounded bg-[var(--raised)]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--raised)]" />
          </div>
        ) : !report ? (
          <EmptyState title={t("reportNotFound")} body={t("reportRemoved")} />
        ) : (
          <article className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text)] md:text-[15px]">
            {report.content}
          </article>
        )}
      </Panel>
    </AppShell>
  );
}
