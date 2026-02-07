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

   export function getIdTag(tag: CacheTag, id: string) {
    return `id:${tag}-${id}` as const;
  }