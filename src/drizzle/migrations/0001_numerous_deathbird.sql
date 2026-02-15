ALTER TABLE "job_listings" RENAME COLUMN "region" TO "city";--> statement-breakpoint
DROP INDEX "idx_job_listings_region";--> statement-breakpoint
CREATE INDEX "idx_job_listings_region" ON "job_listings" USING btree ("city");