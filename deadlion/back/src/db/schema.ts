import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email', { length: 256 }).notNull(),
  pushSub: text('push_sub'),
  secret: text('secret')
}, table => [
  uniqueIndex("email_idx").on(table.email)
])

export const mots = sqliteTable('mots', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  descr: text('descr'),
  asi: real('asi').notNull(),
  owner: integer('owner').notNull().references(() => users.id),
  nextSending: integer('next_send', { mode: "timestamp" })
})

