import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import {
  requireAuth,
  requireAdmin,
  type AppVariables,
} from "../middleware/auth.js";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(""),
});

const updateSchema = createSchema.partial();

const projectTabSchema = z.enum([
  "INFORMATION",
  "TECHNICAL",
  "PROGRESS",
  "FINANCIAL",
]);

const createFieldSchema = z.object({
  tab: projectTabSchema,
  key: z.string().trim().min(1).max(120),
  value: z.string().trim().max(5000).optional().default(""),
});

const updateFieldSchema = z.object({
  key: z.string().trim().min(1).max(120).optional(),
  value: z.string().trim().max(5000).optional(),
});

function serializeField(field: {
  id: string;
  tab: string;
  key: string;
  value: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: field.id,
    tab: field.tab,
    key: field.key,
    value: field.value,
    sortOrder: field.sortOrder,
    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
}

export const projectRoutes = new Hono<{ Variables: AppVariables }>();

projectRoutes.use("*", requireAuth);

projectRoutes.get("/", async (c) => {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { reports: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return c.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      reportCount: project._count.reports,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
    })),
  });
});

projectRoutes.get("/:id", async (c) => {
  const project = await prisma.project.findUnique({
    where: { id: c.req.param("id") },
    include: {
      createdBy: { select: { id: true, name: true } },
      reports: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      },
      fields: {
        orderBy: [{ tab: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
      _count: { select: { reports: true } },
    },
  });

  if (!project) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  return c.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      reportCount: project._count.reports,
      progressLastUpdatedAt: project.progressLastUpdatedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
      reports: project.reports,
      fields: project.fields.map(serializeField),
    },
  });
});

projectRoutes.post("/:id/progress-last-update", requireAdmin, async (c) => {
  const projectId = c.req.param("id");
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  const now = new Date();
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      progressLastUpdatedAt: now,
      updatedAt: now,
    },
  });

  return c.json({
    progressLastUpdatedAt: project.progressLastUpdatedAt,
  });
});

projectRoutes.post("/", requireAdmin, async (c) => {
  const body = createSchema.parse(await c.req.json());
  const user = c.get("user");

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description ?? "",
      createdById: user.id,
    },
  });

  return c.json({ project }, 201);
});

projectRoutes.patch("/:id", requireAdmin, async (c) => {
  const body = updateSchema.parse(await c.req.json());
  const existing = await prisma.project.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!existing) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  const project = await prisma.project.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });

  return c.json({ project });
});

projectRoutes.delete("/:id", requireAdmin, async (c) => {
  const existing = await prisma.project.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!existing) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  await prisma.project.delete({ where: { id: existing.id } });
  return c.json({ ok: true });
});

projectRoutes.post("/:id/fields", requireAdmin, async (c) => {
  const projectId = c.req.param("id");
  const body = createFieldSchema.parse(await c.req.json());

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  const last = await prisma.projectField.findFirst({
    where: { projectId, tab: body.tab },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const field = await prisma.projectField.create({
    data: {
      projectId,
      tab: body.tab,
      key: body.key,
      value: body.value ?? "",
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  return c.json({ field: serializeField(field) }, 201);
});

projectRoutes.patch("/:id/fields/:fieldId", requireAdmin, async (c) => {
  const projectId = c.req.param("id");
  const fieldId = c.req.param("fieldId");
  const body = updateFieldSchema.parse(await c.req.json());

  const existing = await prisma.projectField.findFirst({
    where: { id: fieldId, projectId },
  });
  if (!existing) {
    return c.json({ error: "Field not found" }, 404);
  }

  const field = await prisma.projectField.update({
    where: { id: existing.id },
    data: {
      ...(body.key !== undefined ? { key: body.key } : {}),
      ...(body.value !== undefined ? { value: body.value } : {}),
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  return c.json({ field: serializeField(field) });
});

projectRoutes.delete("/:id/fields/:fieldId", requireAdmin, async (c) => {
  const projectId = c.req.param("id");
  const fieldId = c.req.param("fieldId");

  const existing = await prisma.projectField.findFirst({
    where: { id: fieldId, projectId },
  });
  if (!existing) {
    return c.json({ error: "Field not found" }, 404);
  }

  await prisma.projectField.delete({ where: { id: existing.id } });
  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  return c.json({ ok: true });
});
