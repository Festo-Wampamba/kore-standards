import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserNotificationSettingsGlobalTag() {
    return getGlobalTag("userNotificationSettings");
}

export function getUserNotificationSettingsIdTag(userId: string) {
    return getIdTag("userNotificationSettings", userId);
}

export function revalidateUserNotificationSettingsCache(id: string) {
    revalidateTag(getUserNotificationSettingsGlobalTag(), "default");
    revalidateTag(getUserNotificationSettingsIdTag(id), "default");
}