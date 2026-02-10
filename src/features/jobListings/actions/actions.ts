"use server"

import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing } from "../db/jobListing";

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