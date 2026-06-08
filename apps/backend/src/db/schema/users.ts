import { sql } from 'drizzle-orm'
import { check, customType, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const citext = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'citext'
  },
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: citext('email').notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash'),
    googleSub: text('google_sub').unique(),
    role: text('role').notNull().default('user'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [check('users_role_check', sql`${table.role} IN ('user', 'admin')`)],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
