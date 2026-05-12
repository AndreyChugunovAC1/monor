import { jwt } from 'hono/jwt'

export const checkJwt = jwt({
  secret: process.env.JWT_SECRET!,
  headerName: "Authorization",
  alg: "HS256"
})
