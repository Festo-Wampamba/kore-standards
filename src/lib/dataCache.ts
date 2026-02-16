type CacheTag =
  | "users"
  | "organizations"
  | "jobListings"
  | "userNotifications"
  | "userResumes"
  | "jobListingApplications"
  | "organizationUserSettings"
  | "userNotificationSettings";

export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const;
}

export function getJobListingTag(tag: CacheTag, jobListingId: string) {
  return `jobListing:${jobListingId}-${tag}` as const
}

export function getOrganizationTag(tag: CacheTag, organizationId: string) {
  return `organization:${tag}-${organizationId}` as const;
}

export function getIdTag(tag: CacheTag, id: string) {
  return `id:${tag}-${id}` as const;
}
