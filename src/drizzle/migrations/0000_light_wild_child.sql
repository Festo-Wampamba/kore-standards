CREATE TYPE "public"."job_listing_experience_level" AS ENUM('junior', 'mid-level', 'senior');--> statement-breakpoint
CREATE TYPE "public"."job_listing_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."job_listing_type" AS ENUM('internship', 'part-time', 'full-time', 'contract');--> statement-breakpoint
CREATE TYPE "public"."job_listing_location_requirement" AS ENUM('in-office', 'hybrid', 'remote');--> statement-breakpoint
CREATE TYPE "public"."job_listing_wage_interval" AS ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."job_listing_applications_stages" AS ENUM('applied', 'shortlisted', 'interviewing', 'offer', 'hired', 'rejected');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"imageUrl" varchar NOT NULL,
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
	"wageInterval" "job_listing_wage_interval",
	"district" varchar,
	"city" varchar,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"locationRequirements" "job_listing_location_requirement" NOT NULL,
	"experienceLevel" "job_listing_experience_level" NOT NULL,
	"status" "job_listing_status" DEFAULT 'draft' NOT NULL,
	"type" "job_listing_type" NOT NULL,
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
	"resumeUrl" text NOT NULL,
	"rating" integer,
	"stage" "job_listing_applications_stages" DEFAULT 'applied' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_listing_applications_jobListingId_userId_pk" PRIMARY KEY("jobListingId","userId"),
	CONSTRAINT "rating_check" CHECK ("job_listing_applications"."rating" >= 0 AND "job_listing_applications"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "organization_user_settings" (
	"userId" varchar NOT NULL,
	"organizationId" varchar NOT NULL,
	"newApplicationEmailNotifications" boolean DEFAULT false NOT NULL,
	"minimumRating" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_user_settings_userId_organizationId_pk" PRIMARY KEY("userId","organizationId")
);
--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_jobListingId_job_listings_id_fk" FOREIGN KEY ("jobListingId") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_listings_district_index" ON "job_listings" USING btree ("district");--> statement-breakpoint
CREATE INDEX "job_listings_status_index" ON "job_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_listings_organizationId_index" ON "job_listings" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "job_listings_postedAt_index" ON "job_listings" USING btree ("postedAt");