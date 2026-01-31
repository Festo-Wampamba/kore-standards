import { AppSidebar } from "@/components/sidebar/AppSiderbar";
import { SidebarNavMenuGroup } from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel } from "@/components/ui/sidebar";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebar
      content={
        <>
        <SidebarGroup>
          <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
          <SidebarGroupAction title="Add Job Listing" asChild>
            <Link href="/employer/job-listings/new">
            <PlusIcon /> <span className="sr-only">Add Job Listing</span>
            </Link>
          </SidebarGroupAction>
        </SidebarGroup>
        <SidebarNavMenuGroup className="mt-auto" items = {[ 
                    { href: "/", icon: <ClipboardListIcon/>, label: "Job Board" },
                ]}
                />
                </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
     {children}
    </AppSidebar>
  );
}
