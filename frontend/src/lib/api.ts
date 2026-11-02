import type { ProjectDetail, ProjectSummary, ReportDetail, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "Request failed",
      response.status,
    );
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token: string) => request<{ user: User }>("/auth/me", { token }),

  listProjects: (token: string) =>
    request<{ projects: ProjectSummary[] }>("/projects", { token }),

  getProject: (token: string, id: string) =>
    request<{ project: ProjectDetail }>(`/projects/${id}`, { token }),

  createProject: (
    token: string,
    body: { name: string; description?: string },
  ) =>
    request<{ project: ProjectSummary }>("/projects", {
      method: "POST",
      token,
      body,
    }),

  deleteProject: (token: string, id: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, {
      method: "DELETE",
      token,
    }),

  getReport: (token: string, id: string) =>
    request<{ report: ReportDetail }>(`/reports/${id}`, { token }),

  createReport: (
    token: string,
    projectId: string,
    body: { title: string; content: string },
  ) =>
    request<{ report: ReportDetail }>(`/reports/project/${projectId}`, {
      method: "POST",
      token,
      body,
    }),

  updateReport: (
    token: string,
    id: string,
    body: { title?: string; content?: string },
  ) =>
    request<{ report: ReportDetail }>(`/reports/${id}`, {
      method: "PATCH",
      token,
      body,
    }),

  deleteReport: (token: string, id: string) =>
    request<{ ok: boolean }>(`/reports/${id}`, {
      method: "DELETE",
      token,
    }),
};
