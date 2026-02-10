import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema"
import { revalidateJobListingCache } from "./cache/jobListings"

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert
) {
  const [newListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    })

  revalidateJobListingCache(newListing)

  return newListing
}