"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Trash } from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  ErrorBanner,
  GhostButton,
  IconButton,
  ListRowLink,
  PageHeader,
  Panel,
  PrimaryButton,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useConfirm } from "@/lib/confirm";
import { formatDate } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale";
import { useSetMobileChrome } from "@/lib/mobile-chrome";
import type { ProjectDetail } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { t, locale } = useLocale();
  const { confirm } = useConfirm();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const mobileAction = useMemo(() => {
    if (!isAdmin || !project) return null;
    return (
      <IconButton
        type="button"
        aria-label={t("writeReport")}
        onClick={() => router.push(`/projects/${project.id}/reports/new`)}
      >
        <Plus size={22} weight="bold" />
      </IconButton>
    );
  }, [isAdmin, project, router, t]);

  useSetMobileChrome(
    loading ? t("openingProject") : project?.name ?? t("project"),
    mobileAction,
  );

  const load = useCallback(async () => {
    if (!token || !params.id) return;
    setLoading(true);
    setError("");
    try {
      const { project: next } = await api.getProject(token, params.id);
      setProject(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadProjectFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, params.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDeleteProject() {
    if (!token || !project) return;
    const ok = await confirm({
      title: t("deleteProjectTitle"),
      message: t("deleteProjectConfirm", { name: project.name }),
      confirmLabel: t("delete"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteProject(token, project.id);
      router.replace("/projects");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("deleteProjectFailed"));
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 md:mb-4">
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--text)] md:min-h-0 md:text-[13px]"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {t("allProjects")}
        </Link>
      </div>

      <PageHeader
        title={loading ? t("openingProject") : project?.name ?? t("project")}
        finding={
          project
            ? project.description ||
              t("reportsInProject", {
                count: project.reportCount,
                plural: project.reportCount === 1 ? "" : "s",
              })
            : undefined
        }
        action={
          isAdmin && project ? (
            <>
              <PrimaryButton
                type="button"
                className="hidden md:inline-flex"
                onClick={() =>
                  router.push(`/projects/${project.id}/reports/new`)
                }
              >
                <Plus size={16} className="me-1.5" />
                {t("writeReport")}
              </PrimaryButton>
              <GhostButton
                type="button"
                onClick={onDeleteProject}
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

      <Panel>
        {loading ? (
          <div className="space-y-0 divide-y divide-[var(--rule)]">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse bg-[var(--surface)] px-5"
              />
            ))}
          </div>
        ) : !project ? (
          <EmptyState
            title={t("projectNotFound")}
            body={t("projectRemoved")}
            action={
              <GhostButton type="button" onClick={() => router.push("/projects")}>
                {t("backToProjects")}
              </GhostButton>
            }
          />
        ) : project.reports.length === 0 ? (
          <EmptyState
            title={t("noReportsTitle")}
            body={isAdmin ? t("noReportsAdmin") : t("noReportsViewer")}
            action={
              isAdmin ? (
                <PrimaryButton
                  type="button"
                  onClick={() =>
                    router.push(`/projects/${project.id}/reports/new`)
                  }
                >
                  {t("writeReport")}
                </PrimaryButton>
              ) : null
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {project.reports.map((report) => (
              <li key={report.id}>
                <ListRowLink
                  href={`/projects/${project.id}/reports/${report.id}`}
                  icon={<FileText size={18} weight="duotone" />}
                  title={report.title}
                  subtitle={t("byAuthor", {
                    name: report.createdBy.name,
                    date: formatDate(report.updatedAt, locale),
                  })}
                  trailing={
                    <span className="hidden shrink-0 font-mono text-[12px] text-[var(--muted)] sm:block">
                      {formatDate(report.createdAt, locale)}
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
