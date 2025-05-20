import {
  integer,
  pgEnum,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { briefsTable } from "./briefs";
import { kreatorSchema } from "./kreator";
import { usersTable } from "./users";

// Enums
export const projectStateEnum = pgEnum("kreator.project_state", [
  "applied",
  "application_accepted",
  "application_rejected",
  "cancelled_by_kovalee",
  "cancelled_by_user",
  "in_review",
  "review_rejected",
  "payment_pending",
  "paid",
]);

export const submissionTypeEnum = pgEnum("kreator.submission_type", [
  "raw",
  "production",
]);

// Projects Table
export const projectsTable = kreatorSchema.table("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id")
    .notNull()
    .references(() => briefsTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  state: projectStateEnum("state").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  kwartzCreativeId: integer("kwartz_creative_id"),
});

// Submissions Table
export const submissionsTable = kreatorSchema.table("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  submissionType: submissionTypeEnum("submission_type").notNull(),
  submissionDate: timestamp("submission_date").notNull().defaultNow(),
  tags: text("tags").array().notNull(),
});

// Footages Table
export const footagesTable = kreatorSchema.table("footages", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissionsTable.id),
  path: text("path").notNull(),
  type: text("type").notNull(),
});

// Join Table: Footages <-> Tags
export const footageTagsTable = kreatorSchema.table(
  "footage_tags",
  {
    footageId: uuid("footage_id")
      .notNull()
      .references(() => footagesTable.id),
    tagId: integer("tag_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.footageId, table.tagId] }),
    };
  }
);

// Upload Sessions Table
export const uploadSessionsTable = kreatorSchema.table("upload_sessions", {
  id: serial("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull(),
  totalFiles: integer("total_files").notNull(),
  uploadedFiles: integer("uploaded_files").notNull(),
});

// Note: Missing 'user_metrics'
// Views are not directly representable in Drizzle ORM schema definitions.
// You would query the relevant tables (users, projects) and compute metrics
