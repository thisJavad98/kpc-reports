import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verifyToken, type AuthUser } from "../lib/auth.js";

export type AppVariables = {
  user: AuthUser;
};

export const requireAuth = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const header = c.req.header("Authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      throw new HTTPException(401, { message: "Sign in required" });
    }
    try {
      const user = await verifyToken(token);
      c.set("user", user);
      await next();
    } catch {
      throw new HTTPException(401, { message: "Session expired. Sign in again." });
    }
  },
);

export const requireAdmin = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const user = c.get("user");
    if (user.role !== "ADMIN") {
      throw new HTTPException(403, { message: "Admin access required" });
    }
    await next();
  },
);
