"use client"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function NavFlows({
    flows,
    label = "Flows",
}: {
    flows: { id: string; title: string }[]
    label?: string
}) {
    const router = useRouter()
    const supabase = createClient()

    async function handleRename(flowId: string, currentTitle: string) {
        const title = window.prompt("Rename flow", currentTitle)?.trim()
        if (!title) return
        const { error } = await supabase.from("flows").update({ title }).eq("id", flowId)
        if (!error) router.refresh()
    }

    async function handleDelete(flowId: string) {
        const ok = window.confirm("Delete this flow? This cannot be undone.")
        if (!ok) return
        const { error } = await supabase.from("flows").delete().eq("id", flowId)
        if (!error) {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            {flows && flows.length > 0 ? (
                <SidebarMenu>
                    {flows.map((flow) => (
                        <SidebarMenuItem key={flow.id}>
                            <SidebarMenuButton asChild>
                                <Link href={`/flow/${flow.id}`} prefetch>
                                    <span className="truncate">{flow.title}</span>
                                </Link>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction aria-label="Flow actions" showOnHover>
                                        <MoreHorizontal />
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={6}>
                                    <DropdownMenuItem onClick={() => handleRename(flow.id, flow.title)}>
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(flow.id)}>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            ) : (
                <Empty className="mt-2">
                    <EmptyMedia variant="icon">
                        {/* dotted chat bubble icon replacement via CSS box */}
                        <div className="size-5 rounded-md border border-dashed" />
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyTitle>Nothing here yet</EmptyTitle>
                        <EmptyDescription>
                            Create a new flow to get started
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </SidebarGroup>
    )
}


