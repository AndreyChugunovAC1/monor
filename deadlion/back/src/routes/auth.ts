import { Hono } from "hono";
import { Resend } from "resend";
import { genCode, genSecret } from "../auth/codegen";
import { db } from "../db";
import { users } from "../db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { sign } from "hono/jwt";

export const authRoutes = new Hono()

const resend = new Resend(process.env.RESEND_API_KEY!)
const emailToCode = new Map<string, { code: string, exp: number, attempt: number }>()
const jwtSecret = process.env.JWT_SECRET!

authRoutes.post('/email', async (c) => {
  const req = await c.req.json()
  if (!req?.email) {
    return c.json({ ok: false, error: 'email did not provided' }, 400)
  }

  const emailRegex = /^.+@.+$/i
  const email = req.email
  if (!emailRegex.test(email)) {
    return c.json({ ok: false, error: 'invalid email' }, 400)
  }

  if (emailToCode.has(email)) {
    return c.json({ ok: false, error: 'code already send, please, do not DDOS' }, 429)
  }

  const secret = genSecret()
  const findUser = await db.select().from(users).where(eq(users.email, req.email)).limit(1)
  if (findUser.length < 1) {
    await db.insert(users).values({ email: req.email, secret: secret })
  } else {
    await db.update(users).set({ secret: secret }).where(eq(users.email, req.email))
  }

  // create and remember code:
  const code = genCode()

  // send email:
  const { data, error } = await resend.emails.send({
    from: 'Deadlion <deadlion@inversedca.ru>',
    to: [email],
    subject: 'Verification Code',
    html: `
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family: monospace; font-size: 18px;">
            <strong>${code}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 10px;">
            Your secret:
          </td>
        </tr>
        <tr>
          <td style="font-family: monospace;">
            <strong>${secret}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 10px; color: #666;">
            Do not reply to this email
          </td>
        </tr>
      </table>
    `
  });

  if (error) {
    console.error({ error });
    return c.json({ ok: false, error: 'could not send email' }, 500)
  }

  emailToCode.set(email, { code, exp: Date.now() + 15 * 60 * 1000, attempt: 0 })
  return c.json({ ok: true })
})

authRoutes.post('/code', async (c) => {
  const req = await c.req.json()

  if (!req?.email) {
    return c.json({ ok: false, error: 'email did not provided' }, 400)
  }
  if (!req?.code) {
    return c.json({ ok: false, error: 'code did not provided' }, 400)
  }

  const emailExp = emailToCode.get(req.email)
  if (!emailExp) {
    return c.json({ ok: false, error: 'verification code might not be send' }, 403)
  }

  const dateNow = Date.now()
  if (emailExp.exp < dateNow || emailExp.attempt >= 3) {
    emailToCode.delete(req.email)
    return c.json({ ok: false, error: 'verification code expired' }, 410)
  }

  if (emailExp.code !== req.code) {
    emailExp.attempt++;
    return c.json({ ok: false, error: 'incorrect verification code' }, 400)
  }

  emailToCode.delete(req.email)

  let id: number
  {
    const findUser = await db.select().from(users).where(eq(users.email, req.email)).limit(1)
    if (findUser.length == 0) {
      const res = await db.insert(users).values({ email: req.email }).returning({ id: users.id })
      id = res[0].id
    } else {
      id = findUser[0].id
    }
  }

  const jwt = await sign({ id }, jwtSecret, "HS256")

  // cleanup extra codes:
  emailToCode.entries()
    .filter(([_, val]) => dateNow > val.exp + 45 * 60 * 1000)
    .map(([key]) => key)
    .toArray()
    .forEach(k => emailToCode.delete(k))
  return c.json({ ok: true, token: jwt })
})

authRoutes.post('/secret', async (c) => {
  const req = await c.req.json()

  if (!req?.secret) {
    return c.json({ ok: false, error: 'secret did not provided' }, 400)
  }

  const secret = req.secret

  let id: number
  {
    const findUser = await db.select()
      .from(users)
      .where(and(
        isNotNull(users.secret),
        eq(users.secret, secret)
      ))
      .limit(1)
    if (findUser.length < 1) {
      return c.json({ ok: false, error: "user with given secret not found" })
    }
    id = findUser[0].id
  }

  const jwt = await sign({ id }, jwtSecret, "HS256")
  return c.json({ ok: true, token: jwt })
})