import { Hono } from 'hono'
import { jwt, JwtVariables } from 'hono/jwt';
import { authRoutes } from './routes/auth';
import { motsRoutes } from './routes/mots';
import { checkJwt } from './auth/jwt';
import { backgroundSendPush } from './background';
import { pushRoutes } from './routes/push';

const app = new Hono<{ Variables: JwtVariables<{ id: number }> }>()

backgroundSendPush()

app.route('/auth', authRoutes)

app.use('/mots/*', checkJwt)
app.route('/mots', motsRoutes)

app.use('/push/*', checkJwt)
app.route('/push', pushRoutes)

app.get('/test', async (c) => c.json({ ok: true }))

const port = process.env.PORT || 3000

export default {
  port: port,
  fetch: app.fetch
}
