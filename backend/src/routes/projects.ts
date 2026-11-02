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
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
      reports: project.reports,
    },
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
