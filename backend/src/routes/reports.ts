import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import {
  requireAuth,
  requireAdmin,
  type AppVariables,
} from "../middleware/auth.js";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1),
});

const updateSchema = createSchema.partial().refine(
  (value) => value.title !== undefined || value.content !== undefined,
  { message: "Provide a title or content to update" },
);

export const reportRoutes = new Hono<{ Variables: AppVariables }>();

reportRoutes.use("*", requireAuth);

reportRoutes.get("/:id", async (c) => {
  const report = await prisma.report.findUnique({
    where: { id: c.req.param("id") },
    include: {
      createdBy: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  return c.json({ report });
});

reportRoutes.post("/project/:projectId", requireAdmin, async (c) => {
  const body = createSchema.parse(await c.req.json());
  const user = c.get("user");
  const projectId = c.req.param("projectId");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return c.json({ error: "Project folder not found" }, 404);
  }

  const report = await prisma.report.create({
    data: {
      title: body.title,
      content: body.content,
      projectId,
      createdById: user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });

  return c.json({ report }, 201);
});

reportRoutes.patch("/:id", requireAdmin, async (c) => {
  const body = updateSchema.parse(await c.req.json());
  const existing = await prisma.report.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!existing) {
    return c.json({ error: "Report not found" }, 404);
  }

  const report = await prisma.report.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  await prisma.project.update({
    where: { id: report.projectId },
    data: { updatedAt: new Date() },
  });

  return c.json({ report });
});

reportRoutes.delete("/:id", requireAdmin, async (c) => {
  const existing = await prisma.report.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!existing) {
    return c.json({ error: "Report not found" }, 404);
  }

  await prisma.report.delete({ where: { id: existing.id } });
  return c.json({ ok: true });
});
