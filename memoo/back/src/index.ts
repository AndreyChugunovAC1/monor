import { Hono } from 'hono'
import { JwtVariables } from 'hono/jwt'
import { notesRoutes } from './routing/notes';
import { checkJwt } from './auth/jwt';
import { authRoutes } from './routing/auth';
import { serveStatic } from 'hono/bun';

const app = new Hono<{ Variables: JwtVariables<{ id: number }> }>();

app.route('/auth', authRoutes);

app.use('/notes/*', checkJwt);
app.route('/notes', notesRoutes);

app.get('/test', (c) => {
  return c.json({ ok: true, msg: 'server works' })
});

export default app
