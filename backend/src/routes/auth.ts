import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { signToken, verifyPassword } from "../lib/auth.js";
import { requireAuth, type AppVariables } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = new Hono<{ Variables: AppVariables }>();

authRoutes.post("/login", async (c) => {
  const body = loginSchema.parse(await c.req.json());
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = await signToken(authUser);

  return c.json({
    token,
    user: authUser,
  });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const auth = c.get("user");
  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ user });
});
