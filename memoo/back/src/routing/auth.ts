import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { db } from '../db/db';
import { users } from '../db/schema';

export const authRoutes = new Hono()

authRoutes.get('/', async (c) => {
  const res = await db.insert(users).values({}).returning({ id: users.id });
  return c.json({
    token: await sign({ id: res[0].id }, process.env.JWT_SECRET!, 'HS256')
  }, 200)
})