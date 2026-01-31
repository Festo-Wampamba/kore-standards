import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SignedIn } from "@/services/clerk/components/SignInStatus";
import { ReactNode, Suspense } from "react";
import { AppSidebarClient } from "./_AppSiderbarClient";

export function AppSidebar({ children, content, footerButton }: { children: ReactNode,  content: ReactNode, footerButton: ReactNode }) {
    return <SidebarProvider className="overflow-y-hidden">
    <AppSidebarClient>
    <Sidebar collapsible="icon" className="overflow-hidden">
      <SidebarHeader className="flex-row">
        <SidebarTrigger />
        <span className="text-xl text-nowrap"> KORE </span>
      </SidebarHeader>
      <SidebarContent>{ content }</SidebarContent>
      <Suspense fallback={null}>
        <SignedIn>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                { footerButton }
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </SignedIn>
      </Suspense>
    </Sidebar>
    <main className="flex-1">{ children }</main>
    </AppSidebarClient>
  </SidebarProvider>;
}