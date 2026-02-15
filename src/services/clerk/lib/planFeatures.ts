import { auth } from "@clerk/nextjs/server"

type PlanFeature = 
  | "post_1_job_listing"
  | "post_3_job_listings"
  | "post_15_job_listings"
  | "unlimited_featured_jobs_listings"
  | "1_featured_job_listing"

export async function hasPlanFeature(feature: PlanFeature) {
  const { has } = await auth()
  return has({ feature })
}
