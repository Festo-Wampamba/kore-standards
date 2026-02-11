"use server"

import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updatedJobListingDb  } from "../db/jobListings";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { getJobListingIdTag } from "../db/cache/jobListings";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";


export async function createJobListing(unsafeData: z.infer<typeof jobListingSchema>) {
    const { orgId } = await getCurrentOrganization();

    if (orgId == null) {
        return {
            error: true,
            message: "You must be logged in to create a job listing.",
        }
    }

    const {success, data} = jobListingSchema.safeParse(unsafeData);
    
    if (!success) {
        return {
            error: true,
            message: "Invalid data provided.",
        }
    }

    const jobListing = await insertJobListing({
        ...data,
        organizationId: orgId,
        status: "draft",
    });

    redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(id: string, unsafeData: z.infer<typeof jobListingSchema>) {
    const { orgId } = await getCurrentOrganization();

    if (orgId == null) {
        return {
            error: true,
            message: "You must be logged in to create a job listing.",
        }
    }

    const {success, data} = jobListingSchema.safeParse(unsafeData);
    
    if (!success) {
        // ... error handling
        return {
            error: true,
            message: "Invalid data provided.",
        } 
    }
    // [New Logic] Ensure location is cleared if Remote
    if (data.locationRequirement === "remote") {
        data.city = null;
        data.district = null;
    }


    const jobListing = getJobListing(id, orgId)

    if (!jobListing) {
        return {
            error: true,
            message: "Job listing not found.",
        }
    }

    const updatedJobListing = await updatedJobListingDb(id, data);

    redirect(`/employer/job-listings/${updatedJobListing.id}`);
}


async function getJobListing(id: string, orgId: string) {
  "use cache"
  cacheTag(getJobListingIdTag(id))

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  })
}
