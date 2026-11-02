import type { MessageKey } from "@/lib/i18n/dictionaries";
import type { ProjectTab } from "@/lib/types";

export type ProjectTabSlug =
  | "information"
  | "technical"
  | "progress"
  | "financial";

export const DEFAULT_TAB_SLUG: ProjectTabSlug = "information";

export const PROJECT_TABS: {
  id: ProjectTab;
  slug: ProjectTabSlug;
  labelKey: MessageKey;
}[] = [
  { id: "INFORMATION", slug: "information", labelKey: "tabInformation" },
  { id: "TECHNICAL", slug: "technical", labelKey: "tabTechnical" },
  { id: "PROGRESS", slug: "progress", labelKey: "tabProgress" },
  { id: "FINANCIAL", slug: "financial", labelKey: "tabFinancial" },
];

const SLUG_TO_TAB: Record<ProjectTabSlug, ProjectTab> = {
  information: "INFORMATION",
  technical: "TECHNICAL",
  progress: "PROGRESS",
  financial: "FINANCIAL",
};

export function isProjectTabSlug(value: string): value is ProjectTabSlug {
  return value in SLUG_TO_TAB;
}

export function tabFromSlug(slug: string): ProjectTab | null {
  if (!isProjectTabSlug(slug)) return null;
  return SLUG_TO_TAB[slug];
}

export function slugFromTab(tab: ProjectTab): ProjectTabSlug {
  const match = PROJECT_TABS.find((item) => item.id === tab);
  return match?.slug ?? DEFAULT_TAB_SLUG;
}

export function projectTabHref(projectId: string, slug: ProjectTabSlug = DEFAULT_TAB_SLUG) {
  return `/projects/${projectId}/${slug}`;
}
