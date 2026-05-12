import { Hono } from 'hono';
import { JwtVariables } from 'hono/jwt';
import { db } from '../db/db';
import { and, eq } from 'drizzle-orm';
import { notes } from '../db/schema';
import { join } from 'path';
import { tmpdir } from 'os';
import { createHash } from 'crypto';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { rename, unlink } from 'fs/promises';
import { serveStatic } from 'hono/bun';

export const notesRoutes = new Hono<{ Variables: JwtVariables<{ id: number }> }>()

notesRoutes.get('/', async (c) => {
  const id = c.get('jwtPayload').id;
  const dbBaseReq = db.select().from(notes)
    .where(eq(notes.owner, id))
    .orderBy(notes.date)

  if ('page' in c.req.queries()) {
    const { page } = c.req.query();

    const usersNotes = await dbBaseReq
      .offset(parseInt(page) * 5)
      .limit(5);
    return c.json({ notes: usersNotes }, 200)
  }

  const usersNotes = await dbBaseReq;
  return c.json({ notes: usersNotes }, 200)
});

type Note = {
  text: string,
  date: number
}

const checkNote = (note: any): string | Note => {
  if (!note.date) {
    return 'expected date'
  }

  const date = parseInt(note.date)
  if (isNaN(date)) {
    return 'date: bad number'
  }
  if (!note.text) {
    return 'expected non-empty text'
  }
  return { date, text: note.text }
}

notesRoutes.post('/', async (c) => {
  const id = c.get('jwtPayload').id;
  const note = checkNote(await c.req.json());
  if (typeof note === 'string') {
    return c.json({ err: note }, 400);
  }

  const noteId = await db.insert(notes)
    .values({
      date: new Date(note.date),
      owner: id,
      text: note.text
    })
    .returning({ id: notes.id });
  return c.json({ id: noteId[0].id }, 200);
});

notesRoutes.post('/:id/photos', async (c) => {
  const id = c.get('jwtPayload').id;
  const noteId = parseInt(c.req.param('id'));

  const body = await c.req.parseBody();
  const file = body['file'];
  if (!(file instanceof File)) {
    return c.json({ err: 'recieved not a file' }, 400);
  }

  const ext = file.name.split('.').pop() ?? ''

  const photosRaw = await db.select({ photos: notes.photos })
    .from(notes)
    .where(and(eq(notes.owner, id), eq(notes.id, noteId)));
  if (photosRaw.length < 1) {
    return c.json({ err: "note with given id not found or not accessable" }, 400);
  }

  const tempPath = join(tmpdir(), `temp_${Date.now()}`);
  const hash = createHash('sha256');
  const writeStream = createWriteStream(tempPath);

  try {
    await pipeline(
      file.stream(),
      async function* (source) {
        for await (const chunk of source) {
          hash.update(Buffer.from(chunk));
          yield chunk;
        }
      },
      writeStream
    );

    const finalName = `${hash.digest('hex')}.${ext}`;
    console.log(finalName);
    await rename(tempPath, `./files/${finalName}`);

    const photos = JSON.parse(photosRaw[0].photos ?? '[]') as string[];
    if (!photos.includes(finalName)) {
      photos.push(finalName);
    }

    await db.update(notes)
      .set({ photos: JSON.stringify(photos) })
      .where(and(eq(notes.owner, id), eq(notes.id, noteId)));

    return c.json({ ok: true }, 200);
  } catch (err) {
    await unlink(tempPath).catch(() => { });
    return c.json({ err }, 500);
  }
})

notesRoutes.get('/', async (c) => {
  const id = c.get('jwtPayload').id;

  const res = await db.select().from(notes)
    .where(and(eq(notes.owner, id), eq(notes.isArchived, 0)));
  return c.json({ notes: res }, 200);
})

notesRoutes.get('/:id/photos', async (c) => {
  const id = c.get('jwtPayload').id;
  const noteId = parseInt(c.req.param('id'));

  const res = await db.select({ names: notes.photos })
    .from(notes)
    .where(and(eq(notes.owner, id), eq(notes.id, noteId)));
  const names = JSON.parse(res[0].names ?? '[]');
  return c.json({ names }, 200);
})

notesRoutes.get('/photos/:name', serveStatic({
  root: './files',
  rewriteRequestPath: (path) => {
    console.log(path);
    return path.split('/').pop() ?? '';
  }
}));

notesRoutes.put('/:id', async (c) => {
  const id = c.get('jwtPayload').id;
  const noteId = parseInt(c.req.param('id'));

  const note = checkNote(await c.req.json());
  if (typeof note === 'string') {
    return c.json({ err: note }, 400);
  }

  await db.update(notes).set({
    text: note.text,
    date: new Date(note.date)
  }).where(and(eq(notes.owner, id), eq(notes.id, noteId)));
  return c.json({ ok: true }, 200);
})

notesRoutes.delete('/:id', async (c) => {
  const id = c.get('jwtPayload').id;
  const noteId = parseInt(c.req.param('id'));

  await db.update(notes)
    .set({ isArchived: 1 })
    .where(and(eq(notes.owner, id), eq(notes.id, noteId)));
  return c.json({ ok: true }, 200);
})