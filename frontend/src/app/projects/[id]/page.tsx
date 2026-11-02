"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowsClockwise,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { FieldModal } from "@/components/FieldModal";
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
import { t, type MessageKey } from "@/lib/i18n/dictionaries";
import { useSetMobileChrome } from "@/lib/mobile-chrome";
import type { ProjectDetail, ProjectField, ProjectTab } from "@/lib/types";

const TABS: { id: ProjectTab; labelKey: MessageKey }[] = [
  { id: "INFORMATION", labelKey: "tabInformation" },
  { id: "TECHNICAL", labelKey: "tabTechnical" },
  { id: "PROGRESS", labelKey: "tabProgress" },
  { id: "FINANCIAL", labelKey: "tabFinancial" },
];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const { confirm } = useConfirm();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectTab>("INFORMATION");
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ProjectField | null>(null);
  const [fieldSaving, setFieldSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [updatingLastUpdate, setUpdatingLastUpdate] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isProgressTab = activeTab === "PROGRESS";

  function openCreateFieldModal() {
    setEditingField(null);
    setFieldError("");
    setFieldModalOpen(true);
  }

  function openEditFieldModal(field: ProjectField) {
    setEditingField(field);
    setFieldError("");
    setFieldModalOpen(true);
  }

  const mobileAction = useMemo(() => {
    if (!isAdmin || !project) return null;
    return (
      <IconButton
        type="button"
        aria-label={t("addField")}
        onClick={openCreateFieldModal}
      >
        <Plus size={22} weight="bold" />
      </IconButton>
    );
  }, [isAdmin, project]);

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
  }, [token, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabFields = useMemo(() => {
    if (!project) return [];
    return project.fields.filter((field) => field.tab === activeTab);
  }, [project, activeTab]);

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

  async function onSaveField(payload: { key: string; value: string }) {
    if (!token || !project) return;
    setFieldSaving(true);
    setFieldError("");
    try {
      if (editingField) {
        await api.updateProjectField(token, project.id, editingField.id, {
          key: payload.key,
          value: payload.value,
        });
      } else {
        await api.createProjectField(token, project.id, {
          tab: activeTab,
          key: payload.key,
          value: payload.value,
        });
      }
      setFieldModalOpen(false);
      setEditingField(null);
      await load();
    } catch (err) {
      setFieldError(
        err instanceof ApiError
          ? err.message
          : editingField
            ? t("updateFieldFailed")
            : t("saveFieldFailed"),
      );
    } finally {
      setFieldSaving(false);
    }
  }

  async function onDeleteField(fieldId: string, fieldKey: string) {
    if (!token || !project) return;
    const ok = await confirm({
      title: t("deleteFieldTitle"),
      message: t("deleteFieldConfirm", { name: fieldKey }),
      confirmLabel: t("delete"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (!ok) return;
    setDeletingFieldId(fieldId);
    try {
      await api.deleteProjectField(token, project.id, fieldId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("deleteFieldFailed"));
    } finally {
      setDeletingFieldId(null);
    }
  }

  async function onUpdateProgressLastUpdate() {
    if (!token || !project) return;
    setUpdatingLastUpdate(true);
    setError("");
    try {
      const { progressLastUpdatedAt } = await api.updateProgressLastUpdate(
        token,
        project.id,
      );
      setProject((current) =>
        current ? { ...current, progressLastUpdatedAt } : current,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("updateLastUpdateFailed"),
      );
    } finally {
      setUpdatingLastUpdate(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 md:mb-4">
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--text)] md:min-h-0 md:text-[13px]"
        >
          <ArrowLeft size={14} />
          {t("allProjects")}
        </Link>
      </div>

      <PageHeader
        title={loading ? t("openingProject") : project?.name ?? t("project")}
        finding={project?.description || undefined}
        action={
          isAdmin && project ? (
            <>
              <PrimaryButton
                type="button"
                className="hidden md:inline-flex"
                onClick={openCreateFieldModal}
              >
                <Plus size={16} className="me-1.5" />
                {t("addField")}
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

      {!loading && project ? (
        <div
          role="tablist"
          aria-label={t("project")}
          className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-px"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 px-3 py-2.5 text-[13px] transition-colors md:text-[14px] ${
                  active
                    ? "text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {t(tab.labelKey)}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-px bg-[var(--orange)]"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {project && isProgressTab ? (
        <div
          role="status"
          className="mb-3 flex flex-col gap-3 rounded-[6px] border border-[var(--orange)]/35 bg-[var(--orange-soft)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
        >
          <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--orange)]">
            {t("lastUpdate")}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="text-end text-[14px] text-[var(--text)] md:text-[13px]">
              {project.progressLastUpdatedAt
                ? formatDateTime(project.progressLastUpdatedAt)
                : t("lastUpdateNever")}
            </div>
            {isAdmin ? (
              <PrimaryButton
                type="button"
                disabled={updatingLastUpdate}
                onClick={() => void onUpdateProgressLastUpdate()}
                className="w-full sm:w-auto"
              >
                <ArrowsClockwise
                  size={14}
                  className={`me-1.5 ${updatingLastUpdate ? "animate-spin" : ""}`}
                />
                {updatingLastUpdate
                  ? t("updatingLastUpdate")
                  : t("updateLastUpdate")}
              </PrimaryButton>
            ) : null}
          </div>
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
        ) : tabFields.length === 0 ? (
          <EmptyState
            title={t("noFieldsTitle")}
            body={isAdmin ? t("noFieldsAdmin") : t("noFieldsViewer")}
            action={
              isAdmin ? (
                <PrimaryButton type="button" onClick={openCreateFieldModal}>
                  {t("addField")}
                </PrimaryButton>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-start">
              <tbody>
                {tabFields.map((field) => (
                  <tr
                    key={field.id}
                    className="border-b border-[var(--rule)] last:border-b-0"
                  >
                    <td className="w-[40%] align-middle px-3 py-3 text-start text-[14px] font-medium text-[var(--muted)] sm:px-5 md:text-[13px]">
                      {field.key}
                    </td>
                    <td className="align-middle px-3 py-3 text-end whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--text)] sm:px-5 md:text-[13px]">
                      {field.value || "—"}
                    </td>
                    {isAdmin ? (
                      <td className="w-[5.5rem] align-middle whitespace-nowrap px-2 py-2.5 text-end sm:px-4">
                        <div className="inline-flex items-center justify-end gap-1">
                          <GhostButton
                            type="button"
                            aria-label={t("editField")}
                            onClick={() => openEditFieldModal(field)}
                            className="px-2 text-[var(--orange)]"
                          >
                            <PencilSimple size={14} />
                          </GhostButton>
                          <GhostButton
                            type="button"
                            aria-label={t("delete")}
                            disabled={deletingFieldId === field.id}
                            onClick={() => void onDeleteField(field.id, field.key)}
                            className="border-[var(--negative)]/30 px-2 text-[var(--negative)]"
                          >
                            <Trash size={14} />
                          </GhostButton>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <FieldModal
        open={fieldModalOpen}
        title={editingField ? t("editFieldTitle") : t("addFieldTitle")}
        body={editingField ? t("editFieldBody") : t("addFieldBody")}
        keyLabel={t("fieldKey")}
        keyHint={t("fieldKeyHint")}
        valueLabel={t("fieldValue")}
        valueHint={t("fieldValueHint")}
        cancelLabel={t("cancel")}
        saveLabel={t("saveField")}
        savingLabel={t("saving")}
        initialKey={editingField?.key ?? ""}
        initialValue={editingField?.value ?? ""}
        busy={fieldSaving}
        error={fieldError}
        onClose={() => {
          if (fieldSaving) return;
          setFieldModalOpen(false);
          setEditingField(null);
        }}
        onSave={onSaveField}
      />
    </AppShell>
  );
}
