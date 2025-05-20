import {
  integer,
  pgEnum,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { kreatorSchema } from "./kreator";

// Enums specific to briefs and related entities
export const genderEnum = pgEnum("kreator.gender", ["any", "male", "female"]);
export const videoOrientationEnum = pgEnum("kreator.video_orientation", [
  "landscape",
  "portrait",
]);
export const videoQualityEnum = pgEnum("kreator.video_quality", [
  "1080p",
  "2160p",
]);
export const briefStateEnum = pgEnum("kreator.brief_state", [
  "draft",
  "live",
  "done",
  "idea",
  "archived",
]);
export const creativeDurationEnum = pgEnum("kreator.creative_duration", [
  "5-10",
  "10-15",
  "15-20",
  "20-30",
  "40-50",
  "60-120",
]);
export const briefSquadsEnum = pgEnum("kreator.brief_squads", ["blue", "red"]);

// Brief Meta Table
export const briefMetaTable = kreatorSchema.table("brief_meta", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Briefs Table
export const briefsTable = kreatorSchema.table("briefs", {
  id: uuid("id").primaryKey(),
  briefInternalName: text("brief_internal_name").notNull(),
  squad: briefSquadsEnum("squad").notNull(),
  createdBy: text("created_by").notNull(),
  reward: integer("reward").notNull(),
  appCode: text("app_code").notNull(),
  appDescription: text("app_description").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishAt: timestamp("publish_at"),
  listedUntil: timestamp("listed_until"),
  bannerImage: text("banner_image").notNull(),
  state: briefStateEnum("state").notNull(),
  creatorAgeMin: integer("creator_age_min"),
  creatorAgeMax: integer("creator_age_max"),
  creatorLanguage: text("creator_language"),
  creatorGender: genderEnum("creator_gender"),
  deadlineDays: smallint("deadline_days").notNull(),
  exampleVideo: text("example_video"),
  creativeDuration: creativeDurationEnum("creative_duration").notNull(),
  creativeQuality: videoQualityEnum("creative_quality").notNull(),
  creativeOrientation: videoOrientationEnum("creative_orientation").notNull(),
  briefType: text("brief_type").notNull(),
  editing: text("editing").notNull(),
  keyMessage: text("key_message").notNull(),
  storeUrl: text("store_url").notNull(),
  concept: text("concept"),
});

// Shots Table
export const shotsTable = kreatorSchema.table("shots", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id").references(() => briefsTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sampleScript: text("sample_script").notNull(),
});

// Visuals Table
export const visualsTable = kreatorSchema.table("visuals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  thumbnailPath: text("thumbnail_path").notNull(),
  visualPath: text("visual_path").notNull(),
});

// Join Table: Shots <-> Visuals
export const shotsVisualsTable = kreatorSchema.table(
  "shots_visuals",
  {
    shotId: uuid("shot_id")
      .notNull()
      .references(() => shotsTable.id),
    visualId: integer("visual_id")
      .notNull()
      .references(() => visualsTable.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.shotId, table.visualId] }),
    };
  }
);

// Join Table: Briefs <-> Brief Meta
export const briefMetaLinksTable = kreatorSchema.table(
  "brief_meta_links",
  {
    briefId: uuid("brief_id")
      .notNull()
      .references(() => briefsTable.id),
    metaId: uuid("meta_id")
      .notNull()
      .references(() => briefMetaTable.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.briefId, table.metaId] }),
    };
  }
);
