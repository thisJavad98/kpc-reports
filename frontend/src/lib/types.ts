export type Role = "ADMIN" | "VIEWER";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
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
  reports: ReportSummary[];
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
