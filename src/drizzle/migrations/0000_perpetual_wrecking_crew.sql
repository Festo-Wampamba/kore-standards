CREATE TYPE "public"."job_listings_experience_level" AS ENUM('junior', 'mid-level', 'senior');--> statement-breakpoint
CREATE TYPE "public"."job_listings_status" AS ENUM('draft', 'published', 'delisted');--> statement-breakpoint
CREATE TYPE "public"."job_listings_type" AS ENUM('internship', 'part-time', 'full-time', 'contract');--> statement-breakpoint
CREATE TYPE "public"."job_listings_location_requirement" AS ENUM('in-office', 'hybrid', 'remote');--> statement-breakpoint
CREATE TYPE "public"."job_listings_wage_interval" AS ENUM('daily', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."job_listings_applications_stage" AS ENUM('denied', 'applied', 'interested', 'interviewed', 'hired');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"imageUrl" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"wage" integer,
	"wageInterval" "job_listings_wage_interval",
	"region" varchar,
	"district" varchar,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"locationRequirement" "job_listings_location_requirement" NOT NULL,
	"experienceLevel" "job_listings_experience_level" NOT NULL,
	"status" "job_listings_status" DEFAULT 'draft' NOT NULL,
	"type" "job_listings_type" NOT NULL,
	"postedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_resumes" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"resumeFileUrl" varchar NOT NULL,
	"resumeFileKey" varchar NOT NULL,
	"aiSummary" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_settings" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"newJobEmailNotifications" boolean DEFAULT false NOT NULL,
	"aiPrompt" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listing_applications" (
	"jobListingId" uuid NOT NULL,
	"userId" varchar NOT NULL,
	"coverLetter" text,
	"rating" integer,
	"stage" "job_listings_applications_stage" DEFAULT 'applied' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_listing_applications_jobListingId_userId_pk" PRIMARY KEY("jobListingId","userId")
);
--> statement-breakpoint
CREATE TABLE "organization_user_settings" (
	"userId" varchar NOT NULL,
	"organizationId" varchar NOT NULL,
	"newApplicationEmailNotification" boolean DEFAULT false NOT NULL,
	"minimumRating" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_user_settings_userId_organizationId_pk" PRIMARY KEY("userId","organizationId")
);
--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_jobListingId_job_listings_id_fk" FOREIGN KEY ("jobListingId") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_listings_district" ON "job_listings" USING btree ("district");--> statement-breakpoint
CREATE INDEX "idx_job_listings_region" ON "job_listings" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_job_listings_status" ON "job_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_listings_org_id" ON "job_listings" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "idx_job_listings_posted_at" ON "job_listings" USING btree ("postedAt");--> statement-breakpoint
CREATE INDEX "idx_job_listings_status_district" ON "job_listings" USING btree ("status","district");--> statement-breakpoint
CREATE INDEX "idx_job_listings_status_posted" ON "job_listings" USING btree ("status","postedAt");