import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getUserResumeGlobalTag() {
  return getGlobalTag("userResumes")
}

export function getUserResumeIdTag(userId: string) {
  return getIdTag("userResumes", userId)
}


export function revalidateUserResumeCache(userId: string) {
  revalidateTag(getUserResumeGlobalTag(), "max")
  revalidateTag(getUserResumeIdTag(userId), "max")
}
