import { check, integer, pgEnum, pgTable, primaryKey, text, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createdAt, updatedAt } from "../schemaHelpers";
import { JobListingTable } from "./jobListing";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";

export const applicationStages = [ "applied", "shortlisted", "interviewing", "offer", "hired", "rejected" ] as const
export type ApplicationStage = (typeof applicationStages )[number]
export const applicationStageEnum = pgEnum("job_listing_applications_stages", applicationStages)

export const JobListingApplicationTable = pgTable("job_listing_applications", {
    jobListingId: uuid().references(() => JobListingTable.id, { onDelete: 'cascade' }).notNull(),
    userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
    coverLetter: text(),
    resumeUrl: text().notNull(),
    rating: integer(),
    stage: applicationStageEnum().notNull().default("applied"),
    createdAt,
    updatedAt,
},
    table => [
        primaryKey({ columns: [table.jobListingId, table.userId] }),
        check("rating_check", sql`${table.rating} >= 0 AND ${table.rating} <= 5`)
    ],
)


export const jobListingApplicationRelations = relations(JobListingApplicationTable, ({ one }) => ({
    jobListing: one(JobListingTable, { 
        fields: [JobListingApplicationTable.jobListingId], 
        references: [JobListingTable.id] 
    }),
    user: one(UserTable, { 
        fields: [JobListingApplicationTable.userId], 
        references: [UserTable.id] 
    }),
}));