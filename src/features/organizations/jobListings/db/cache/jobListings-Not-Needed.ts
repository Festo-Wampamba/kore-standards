import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingsGlobalTag() {
  return getGlobalTag("jobListings");
}

export function getJobListingOrganizationTag(organizationId: string) {
  return getOrganizationTag("jobListings", organizationId);
}

export function getJobListingIdTag(id: string) {
  return getIdTag("jobListings", id);
}

export function revalidateJobListingCache({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  revalidateTag(getJobListingsGlobalTag(), "default");
  revalidateTag(getJobListingOrganizationTag(organizationId), "default");
  revalidateTag(getJobListingIdTag(id), "default");
}


{ /* This file is currently not used, but it contains the same cache tag functions as the main jobListings cache file. This is to avoid circular dependencies between the employer page and the jobListings cache functions. Once we have a better caching strategy in place, we can remove this file and use the main cache functions directly. */ }