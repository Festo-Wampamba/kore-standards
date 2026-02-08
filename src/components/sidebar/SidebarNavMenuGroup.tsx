"use client";

import { SignedIn, SignedOut } from "@/services/clerk/components/SignInStatus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";

export function SidebarNavMenuGroup({
  items,
  className,
}: {
  items: {
    href: string;
    icon: ReactNode;
    label: string;
    authStatus?: "signed-in" | "signed-out";
  }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item) => {
          const html = (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (item.authStatus === "signed-out") {
            return <SignedOut key={item.href}>{html}</SignedOut>;
          }

          if (item.authStatus === "signed-in") {
            return <SignedIn key={item.href}>{html}</SignedIn>;
          }

          return html;
        })}

      </SidebarMenu>
    </SidebarGroup>
  );
}
