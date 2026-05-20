import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { db } from '../db/db';
import { users } from '../db/schema';
import { genCode, genSecret } from '../auth/code';
import { Resend } from 'resend';

export const authRoutes = new Hono()

const resend = new Resend(process.env.RESEND_API_KEY!)
const emailToCode = new Map<string, string>();
const jwtSecret = process.env.JWT_SECRET!

authRoutes.post('/email', async (c) => {
  const req = await c.req.json();
  if (!req?.email || typeof req.email !== 'string') {
    return c.json({ err: "Email did not provided" }, 400);
  }
  const code = genSecret();
  
})