import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true })
  // TODO
});

export const notes = sqliteTable('notes', {
  id: int().primaryKey({ autoIncrement: true }),
  photos: text(),
  text: text().notNull(),
  date: int({ mode: 'timestamp' }).notNull(),
  isArchived: int().notNull().default(0),
  owner: int().notNull().references(() => users.id)
});