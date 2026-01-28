import { getGlobalTag, getIdTag } from "@/services/clerk/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserGlobalTag(): string {
    return getGlobalTag("users") 
}

export function getUserIdTag(id: string): string {
    return getIdTag("users", id) 
}

export function revalidateUserCache(id: string): void {
    revalidateTag( getUserGlobalTag() );
    revalidateTag( getUserIdTag(id) );
}
