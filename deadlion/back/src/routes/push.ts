import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const pushRoutes = new Hono<{ Variables: JwtVariables<{ id: number }> }>()

pushRoutes.post('/subscribe', async (c) => {
  const data = await c.req.json()
  const userId = c.get('jwtPayload').id

  const resp = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (resp.length < 1) {
    return c.json({ ok: false, error: 'user not found...' }, 400)
  }
  await db.update(users).set({ pushSub: JSON.stringify(data.sub) }).where(eq(users.id, userId))
  return c.json({ ok: true })
})

