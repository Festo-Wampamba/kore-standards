"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { SignOutButton } from "@/services/clerk/components/AuthButton"
import { useClerk } from "@clerk/nextjs"
import { ArrowLeftRightIcon, Building2Icon, ChevronsUpDown, CreditCardIcon, LogOutIcon, UserRoundCog } from "lucide-react"
import Link from "next/link"

type User = {
        email: string

    }

type Organization = {
        name: string
        imageUrl: string | null
    }

export function SidebarOrganizationButtonClient({
    user,
    organization,
}: {
    user: User
    organization: Organization
}) {

    const { isMobile, setOpenMobile } = useSidebar()
    const { openOrganizationProfile } = useClerk()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                    size="lg" 
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <OrganizationInfo user={user} organization={organization}/>
                    <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
            sideOffset={4}
            align="end"
            side={isMobile ? "bottom" : "right"}
            className="min-w-64 max-w-80">
                <DropdownMenuLabel className="font-normal p-1">
                    <OrganizationInfo user={user} organization={organization}/>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    openOrganizationProfile()
                    setOpenMobile(false)
                }}>
                    <Building2Icon className="mr-1" /> Manage Organization
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/employer/user-settings">
                    <UserRoundCog className="mr-1" /> User Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/employer/pricing">
                    <CreditCardIcon className="mr-1" /> Change Plan
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/organization/select">
                    <ArrowLeftRightIcon className="mr-1" /> Switch Organizations
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton>
                <DropdownMenuItem>
                    <LogOutIcon className="mr-1" /> Sign Out
                </DropdownMenuItem>
                </SignOutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function OrganizationInfo({ organization, user  }: { organization: Organization, user: User })
{
    const nameInitials = organization.name
        .split(" ")
        .slice(0, 2)
        .map(str => str[0] ?? "")
        .filter(Boolean)
        .join("")
        .toUpperCase();

    return (
    <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="rounded-lg size-8">
            <AvatarImage src={organization.imageUrl ?? undefined} alt={organization.name} />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">{nameInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
            <span className="truncate text-sm font-semibold">{organization.name}</span>
            <span className="truncate text-xs">{user.email}</span>
        </div>
    </div>
    )
}