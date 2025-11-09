"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Search,
  Trash2,
  Waypoints,
  FilePlus,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavFlows } from "@/components/nav-flows"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    { title: "New Flow", url: "/u/", icon: FilePlus, isActive: true },
    { title: "Search Flow", url: "#", icon: Search },
    { title: "Prospects", url: "/u/prospects", icon: Users },
    { title: "Connectors", url: "#", icon: Waypoints },
    { title: "Trash", url: "#", icon: Trash2 },
  ],
  projects: [
    { name: "Chat database model", url: "#", icon: SquareTerminal },
    { name: "Crypto market decline reasons", url: "#", icon: SquareTerminal },
    { name: "GA layout design", url: "#", icon: SquareTerminal },
    { name: "Intraday price prediction", url: "#", icon: SquareTerminal },
    { name: "Solve assignment questions", url: "#", icon: SquareTerminal },
  ],
}

export function AppSidebar({
  user,
  flows,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
  }
  flows: { id: string; title: string }[]
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Expanded state: show logo left and trigger right */}
            <div className="hidden items-center justify-between group-data-[collapsible=icon]:hidden md:flex">
              <Image src={"/logo.svg"} width={20} height={20} alt="Flowtusk" />
              <SidebarTrigger aria-label="Collapse sidebar" />
            </div>

            {/* Collapsed state: overlay to avoid layout shifts, hover to reveal trigger */}
            <div className="group/header relative hidden items-center justify-center group-data-[collapsible=icon]:flex">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-100 group-data-[collapsible=icon]:group-hover/header:opacity-0">
                  <Image src={"/logo.svg"} width={20} height={20} alt="Flowtusk" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-data-[collapsible=icon]:group-hover/header:opacity-100">
                  <SidebarTrigger aria-label="Expand sidebar" className="size-8" />
                </div>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavFlows flows={flows} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
