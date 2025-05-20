import {
  boolean,
  date,
  integer,
  pgEnum,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { kreatorSchema } from "./kreator";

export const pronounsEnum = pgEnum("kreator.pronouns", [
  "He/Him",
  "She/Her",
  "They/Them",
  "Prefer not to say",
]);

export const usersTable = kreatorSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  image: text("avatar").notNull(),
  phone: text("phone"),
  name: text("full_name").notNull(),
  biography: text("biography"),
  password: text("password"),
  salt: text("salt"),
  verified: boolean("verified").notNull().default(false),
  birthdate: date("birthdate"),
  pronouns: pronounsEnum("pronouns"),
  language: text("language"),
  country: text("country"),
  tiktok: text("tiktok"),
  instagram: text("instagram"),
  score: integer("score").notNull().default(0),
  paypal: text("paypal"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDeactivated: boolean("is_deactivated").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

// Note: Missing 'users_login_type' and 'users_profile_completed'
// Views are not directly representable in Drizzle ORM schema definitions.
// You would typically query the 'usersTable' directly and compute these derived values
// or use raw SQL queries through Drizzle if needed.
