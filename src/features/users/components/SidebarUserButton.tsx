import { SidebarMenuButton } from "@/components/ui/sidebar";
import { SignOutButton } from "@/services/clerk/components/AuthButton";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { LogOutIcon } from "lucide-react";
import { Suspense } from "react";
import { SidebarUserButtonClient } from "./_SidebarUserButtonClient";

export function SidebarUserButton() {
    return <Suspense>
        <SidebarUserSuspense />
    </Suspense>
}

async function SidebarUserSuspense() {
    const { user } = await getCurrentUser({ allData: true });

    if (user == null) {
        return (
            <SignOutButton>
                <SidebarMenuButton>
                    <LogOutIcon />
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SignOutButton>
        )
    }

    return <SidebarUserButtonClient user = {user} />
}