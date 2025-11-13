"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Mail,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

function getInitials(text: string): string {
  if (!text) return "?"
  const cleaned = text.trim()
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  // Fallback: take first two non-symbol characters (works for names or emails)
  const letters = cleaned.replace(/[^a-zA-Z]/g, "")
  return (letters.slice(0, 2) || cleaned.slice(0, 2)).toUpperCase()
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const initials = getInitials(user?.name || user?.email)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const ICON_SIZE = 16

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/u/invitations")}>
                <Mail />
                Invitations
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {mounted && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value)}
                >
                  <DropdownMenuRadioItem value="light" className="gap-2">
                    <Sun size={ICON_SIZE} className="text-muted-foreground" />
                    <span>Light</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="gap-2">
                    <Moon size={ICON_SIZE} className="text-muted-foreground" />
                    <span>Dark</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="gap-2">
                    <Laptop size={ICON_SIZE} className="text-muted-foreground" />
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
