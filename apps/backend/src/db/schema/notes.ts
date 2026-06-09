import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.js'

/**
 * EXAMPLE feature table — a per-user "notes" resource demonstrating the
 * conventions for adding a new entity: a UUID primary key, an owner foreign key
 * to `users` with cascade delete, timezone-aware timestamp columns, a supporting
 * index, and inferred select/insert types. Copy this shape for real features, or
 * delete this file together with its router, seed, and tests for a clean start.
 */
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('notes_user_id_created_at_idx').on(table.userId, table.createdAt)],
)

export type NoteRow = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
