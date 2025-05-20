CREATE SCHEMA IF NOT EXISTS "kreator";
--> statement-breakpoint
CREATE TYPE "public"."kreator.brief_squads" AS ENUM('blue', 'red');--> statement-breakpoint
CREATE TYPE "public"."kreator.brief_state" AS ENUM('draft', 'live', 'done', 'idea', 'archived');--> statement-breakpoint
CREATE TYPE "public"."kreator.creative_duration" AS ENUM('5-10', '10-15', '15-20', '20-30', '40-50', '60-120');--> statement-breakpoint
CREATE TYPE "public"."kreator.gender" AS ENUM('any', 'male', 'female');--> statement-breakpoint
CREATE TYPE "public"."kreator.video_orientation" AS ENUM('landscape', 'portrait');--> statement-breakpoint
CREATE TYPE "public"."kreator.video_quality" AS ENUM('1080p', '2160p');--> statement-breakpoint
CREATE TYPE "public"."kreator.project_state" AS ENUM('applied', 'application_accepted', 'application_rejected', 'cancelled_by_kovalee', 'cancelled_by_user', 'in_review', 'review_rejected', 'payment_pending', 'paid');--> statement-breakpoint
CREATE TYPE "public"."kreator.submission_type" AS ENUM('raw', 'production');--> statement-breakpoint
CREATE TYPE "public"."kreator.pronouns" AS ENUM('He/Him', 'She/Her', 'They/Them', 'Prefer not to say');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."password_reset_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "password_reset_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."brief_meta_links" (
	"brief_id" uuid NOT NULL,
	"meta_id" uuid NOT NULL,
	CONSTRAINT "brief_meta_links_brief_id_meta_id_pk" PRIMARY KEY("brief_id","meta_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."brief_meta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."briefs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"brief_internal_name" text NOT NULL,
	"squad" "kreator.brief_squads" NOT NULL,
	"created_by" text NOT NULL,
	"reward" integer NOT NULL,
	"app_code" text NOT NULL,
	"app_description" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"publish_at" timestamp,
	"listed_until" timestamp,
	"banner_image" text NOT NULL,
	"state" "kreator.brief_state" NOT NULL,
	"creator_age_min" integer,
	"creator_age_max" integer,
	"creator_language" text,
	"creator_gender" "kreator.gender",
	"deadline_days" smallint NOT NULL,
	"example_video" text,
	"creative_duration" "kreator.creative_duration" NOT NULL,
	"creative_quality" "kreator.video_quality" NOT NULL,
	"creative_orientation" "kreator.video_orientation" NOT NULL,
	"brief_type" text NOT NULL,
	"editing" text NOT NULL,
	"key_message" text NOT NULL,
	"store_url" text NOT NULL,
	"concept" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."shots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sample_script" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."shots_visuals" (
	"shot_id" uuid NOT NULL,
	"visual_id" integer NOT NULL,
	CONSTRAINT "shots_visuals_shot_id_visual_id_pk" PRIMARY KEY("shot_id","visual_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."visuals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"thumbnail_path" text NOT NULL,
	"visual_path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."footage_tags" (
	"footage_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "footage_tags_footage_id_tag_id_pk" PRIMARY KEY("footage_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."footages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"path" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"state" "kreator.project_state" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"kwartz_creative_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"submission_type" "kreator.submission_type" NOT NULL,
	"submission_date" timestamp DEFAULT now() NOT NULL,
	"tags" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."upload_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"total_files" integer NOT NULL,
	"uploaded_files" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kreator"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"avatar" text NOT NULL,
	"phone" text,
	"full_name" text NOT NULL,
	"biography" text,
	"password" text,
	"salt" text,
	"verified" boolean DEFAULT false NOT NULL,
	"birthdate" date,
	"pronouns" "kreator.pronouns",
	"language" text,
	"country" text,
	"tiktok" text,
	"instagram" text,
	"score" integer DEFAULT 0 NOT NULL,
	"paypal" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deactivated" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "kreator"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "kreator"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "kreator"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."brief_meta_links" ADD CONSTRAINT "brief_meta_links_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "kreator"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."brief_meta_links" ADD CONSTRAINT "brief_meta_links_meta_id_brief_meta_id_fk" FOREIGN KEY ("meta_id") REFERENCES "kreator"."brief_meta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."shots" ADD CONSTRAINT "shots_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "kreator"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."shots_visuals" ADD CONSTRAINT "shots_visuals_shot_id_shots_id_fk" FOREIGN KEY ("shot_id") REFERENCES "kreator"."shots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."shots_visuals" ADD CONSTRAINT "shots_visuals_visual_id_visuals_id_fk" FOREIGN KEY ("visual_id") REFERENCES "kreator"."visuals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."footage_tags" ADD CONSTRAINT "footage_tags_footage_id_footages_id_fk" FOREIGN KEY ("footage_id") REFERENCES "kreator"."footages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."footages" ADD CONSTRAINT "footages_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "kreator"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."projects" ADD CONSTRAINT "projects_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "kreator"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "kreator"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."submissions" ADD CONSTRAINT "submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "kreator"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kreator"."upload_sessions" ADD CONSTRAINT "upload_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "kreator"."projects"("id") ON DELETE no action ON UPDATE no action;