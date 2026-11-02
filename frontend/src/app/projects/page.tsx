"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Plus } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  ErrorBanner,
  Field,
  GhostButton,
  IconButton,
  ListRowLink,
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale";
import { useSetMobileChrome } from "@/lib/mobile-chrome";
import type { ProjectSummary } from "@/lib/types";

export default function ProjectsPage() {
  const { token, user } = useAuth();
  const { t, locale } = useLocale();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const mobileAction = useMemo(() => {
    if (!isAdmin) return null;
    return (
      <IconButton
        type="button"
        aria-label={creating ? t("cancel") : t("newProject")}
        onClick={() => setCreating((value) => !value)}
      >
        <Plus size={22} weight="bold" />
      </IconButton>
    );
  }, [isAdmin, creating, t]);

  useSetMobileChrome(t("projects"), mobileAction);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const { projects: next } = await api.listProjects(token);
      setProjects(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadProjectsFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await api.createProject(token, {
        name: name.trim(),
        description: description.trim(),
      });
      setName("");
      setDescription("");
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("createProjectFailed"));
    } finally {
      setSaving(false);
    }
  }

  const totalReports = projects.reduce(
    (sum, project) => sum + project.reportCount,
    0,
  );

  return (
    <AppShell>
      <PageHeader
        title={t("projects")}
        finding={
          loading
            ? t("loadingProjects")
            : projects.length === 0
              ? t("noProjectsFinding")
              : t("projectsFinding", {
                  projects: projects.length,
                  projectsPlural: projects.length === 1 ? "" : "s",
                  reports: totalReports,
                  reportsPlural: totalReports === 1 ? "" : "s",
                })
        }
        action={
          isAdmin ? (
            <PrimaryButton
              type="button"
              className="hidden md:inline-flex"
              onClick={() => setCreating((value) => !value)}
            >
              <Plus size={16} className="me-1.5" />
              {creating ? t("cancel") : t("newProject")}
            </PrimaryButton>
          ) : null
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      {creating && isAdmin ? (
        <Panel className="mb-4 p-4 sm:p-5">
          <form onSubmit={onCreate} className="space-y-4">
            <Field
              label={t("projectName")}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              hint={t("projectNameHint")}
            />
            <TextArea
              label={t("description")}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[96px]"
              hint={t("descriptionHint")}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? t("creating") : t("createProject")}
              </PrimaryButton>
              <GhostButton
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setCreating(false)}
              >
                {t("close")}
              </GhostButton>
            </div>
          </form>
        </Panel>
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
        ) : projects.length === 0 ? (
          <EmptyState
            title={t("noProjectsTitle")}
            body={isAdmin ? t("noProjectsAdmin") : t("noProjectsViewer")}
            action={
              isAdmin ? (
                <PrimaryButton type="button" onClick={() => setCreating(true)}>
                  {t("newProject")}
                </PrimaryButton>
              ) : null
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {projects.map((project, index) => (
              <motion.li
                key={project.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <ListRowLink
                  href={`/projects/${project.id}`}
                  icon={<Briefcase size={20} weight="duotone" />}
                  title={project.name}
                  subtitle={`${project.description || t("noDescription")} · ${t("updated", {
                    date: formatDate(project.updatedAt, locale),
                  })}`}
                  trailing={
                    <span className="shrink-0 text-end">
                      <span className="block font-mono text-[14px] text-[var(--orange)]">
                        {project.reportCount}
                      </span>
                      <span className="block text-[12px] text-[var(--muted)]">
                        {project.reportCount === 1 ? t("report") : t("reports")}
                      </span>
                    </span>
                  }
                />
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
