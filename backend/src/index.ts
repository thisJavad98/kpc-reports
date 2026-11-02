import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { ZodError } from "zod";
import { authRoutes } from "./routes/auth.js";
import { projectRoutes } from "./routes/projects.js";
import { reportRoutes } from "./routes/reports.js";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] ?? "*";
      return allowedOrigins.includes(origin) || allowedOrigins.includes("*")
        ? origin
        : allowedOrigins[0] ?? "";
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "kpc-reports-api" }));

app.route("/auth", authRoutes);
app.route("/projects", projectRoutes);
app.route("/reports", reportRoutes);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json(
      { error: err.issues[0]?.message ?? "Invalid request" },
      400,
    );
  }
  console.error(err);
  return c.json({ error: "Something went wrong" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export const runtime = "nodejs";

const handler = handle(app);

export const fetch = handler;
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
