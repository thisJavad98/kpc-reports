export type Role = "ADMIN" | "VIEWER";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type ProjectTab =
  | "INFORMATION"
  | "TECHNICAL"
  | "PROGRESS"
  | "FINANCIAL";

export type ProjectField = {
  id: string;
  tab: ProjectTab;
  key: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
};

export type ReportSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
};

export type ProjectDetail = ProjectSummary & {
  progressLastUpdatedAt: string | null;
  reports: ReportSummary[];
  fields: ProjectField[];
};

export type ReportDetail = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  createdBy: { id: string; name: string };
  project: { id: string; name: string };
};
