import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { db } from "../db";
import { mots } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { computeNextSend } from "../utils/next-sending";

export const motsRoutes = new Hono<{ Variables: JwtVariables<{ id: number }> }>()

motsRoutes.get('/', async (c) => {
  const userId = c.get('jwtPayload').id
  const usersMots = await db.select().from(mots).where(eq(mots.owner, userId))

  return c.json({ mots: usersMots })
})

motsRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const userId = c.get('jwtPayload').id

  const res = await db.select()
    .from(mots)
    .where(and(eq(mots.id, id), eq(mots.owner, userId)))
    .limit(1)
  if (res.length < 1) {
    return c.json({ ok: false, error: 'mot not found or you have no access to it' })
  }
  return c.json({ ok: true, mot: res[0] })
})


// TODO: add validation
motsRoutes.post('/', async (c) => {
  const userId = c.get('jwtPayload').id
  const data = await c.req.json()

  const res = await db.insert(mots).values({
    title: data?.title,
    descr: data?.descr,
    asi: data?.asi,
    owner: userId,
    nextSending: computeNextSend(data?.asi!)
  }).returning({ id: mots.id })
  return c.json({ ok: true, id: res[0].id })
})

// TODO: add validation
motsRoutes.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const userId = c.get('jwtPayload').id
  const data = await c.req.json()

  if (Object.keys(data).length === 0) {
    return c.json({ error: 'no data to update' }, 400)
  }

  const existing = await db.select()
    .from(mots)
    .where(and(eq(mots.id, id), eq(mots.owner, userId)))
    .limit(1)

  if (existing.length === 0) {
    return c.json({ ok: false, error: 'mot does not found or you can not access it' }, 404)
  }

  const updateData: Partial<typeof mots.$inferInsert> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.descr !== undefined) updateData.descr = data.descr
  if (data.asi !== undefined) {
    updateData.asi = data.asi
    updateData.nextSending = computeNextSend(data.asi)
  }

  await db.update(mots)
    .set(updateData)
    .where(and(eq(mots.id, id), eq(mots.owner, userId)))

  return c.json({ ok: true })
})

// ok
motsRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const userId = c.get('jwtPayload').id

  const res = await db.select()
    .from(mots)
    .where(and(eq(mots.owner, userId), eq(mots.id, id)))
    .limit(1)

  if (res.length === 0) {
    return c.json({ ok: false, error: 'can not find mot with given id or you have no access' })
  }

  await db.delete(mots).where(and(eq(mots.owner, userId), eq(mots.id, id)))
  return c.json({ ok: true })
})
