import { JobListingStatus } from "@/drizzle/schema"

export function getNextJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "draft":
    case "delisted":
      return "published"
    case "published":
      return "delisted"
    default:
      throw new Error(`Unknown job listing status: ${status satisfies never}`)
  }
}


export function sortJobListingsByStatus(
  a: JobListingStatus,
  b: JobListingStatus
) {
  return JOB_LISTING_STATUS_SORT_ORDER[a] - JOB_LISTING_STATUS_SORT_ORDER[b]
}

const JOB_LISTING_STATUS_SORT_ORDER: Record<JobListingStatus, number> = {
  published: 0,
  draft: 1,
  delisted: 2,
}
