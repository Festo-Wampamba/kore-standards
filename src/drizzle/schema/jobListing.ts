import { boolean, index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { OrganizationTable } from "./organization";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./jobListingApplication";

export const wageIntervals = ["daily", "monthly", "yearly"] as const 
export type WageInterval = (typeof wageIntervals)[number]
export const wageIntervalEnum = pgEnum("job_listings_wage_interval", wageIntervals)

export const locationRequirements = ["in-office", "hybrid", "remote"] as const 
export type LocationRequirement = (typeof locationRequirements)[number]
export const locationRequirementEnum = pgEnum("job_listings_location_requirement", locationRequirements)

export const experienceLevels = ["junior", "mid-level", "senior"] as const 
export type ExperienceLevel = (typeof experienceLevels)[number]
export const experienceLevelEnum = pgEnum("job_listings_experience_level", experienceLevels)

export const jobListingStatuses = ["draft", "published", "delisted"] as const 
export type JobListingStatus = (typeof jobListingStatuses)[number]
export const jobListingStatusEnum = pgEnum("job_listings_status", jobListingStatuses)

export const jobListingTypes = ["internship", "part-time", "full-time", "contract"] as const 
export type JobListingType = (typeof jobListingTypes)[number]
export const jobListingTypeEnum = pgEnum("job_listings_type", jobListingTypes)

export const JobListingTable = pgTable("job_listings", {
    id,
    // CASCADE DELETE: When an organization is deleted, all its job listings are automatically deleted
    organizationId: varchar().references(() => OrganizationTable.id, { onDelete: "cascade" }).notNull(),
    title: varchar().notNull(),
    description: text().notNull(),
    wage: integer(),
    wageInterval: wageIntervalEnum(),
    city: varchar(),
    district: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default("draft"),
    type: jobListingTypeEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
},
table => [
  // Geographic filtering indexes
  index('idx_job_listings_district').on(table.district),
  index('idx_job_listings_region').on(table.city),
  
  // Status filtering (most common query pattern)
  index('idx_job_listings_status').on(table.status),
  
  // Organization-specific queries
  index('idx_job_listings_org_id').on(table.organizationId),
  
  // Date-based sorting and filtering
  index('idx_job_listings_posted_at').on(table.postedAt),
  
  // Composite indexes for common query combinations
  // Example: "Show all published jobs in X district, sorted by posted date"
  index('idx_job_listings_status_district').on(table.status, table.district),
  index('idx_job_listings_status_posted').on(table.status, table.postedAt),
]
)

export const jobListingReferences = relations(JobListingTable, ({ one, many }) => ({ 
    organization: one(OrganizationTable, {
        fields: [JobListingTable.organizationId], references: [OrganizationTable.id]
    }),
    applications: many(JobListingApplicationTable)
}))