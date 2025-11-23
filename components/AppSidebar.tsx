"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface Conversation {
    id: string;
    title: string;
}

interface AppSidebarProps {
    user?: {
        email?: string;
        user_metadata?: {
            full_name?: string;
        };
    };
    conversations?: Conversation[];
    activeConversationId?: string;
    onNewConversation?: () => void;
    onSelectConversation?: (id: string) => void;
    onDeleteConversation?: (id: string) => void;
    onCloseMobileDrawer?: () => void;
    className?: string;
}

export function AppSidebar({
    user,
    conversations = [],
    activeConversationId,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    onCloseMobileDrawer,
    className
}: AppSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isProfilePage = pathname === '/profile';

    return (
        <div className={cn("flex flex-col h-full bg-background border-r overflow-hidden", className)}>
            <div className="p-4 border-b shrink-0">
                <div className="flex items-center gap-2 font-semibold mb-4">
                    <Image src="/logo.svg" alt="Flowtusk" width={20} height={20} className="shrink-0" />
                    <span>Flowtusk</span>
                </div>
                <Button
                    onClick={() => {
                        if (onNewConversation) {
                            onNewConversation();
                        } else {
                            router.push('/app');
                        }
                        onCloseMobileDrawer?.();
                    }}
                    className="w-full"
                    variant="outline"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New conversation
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                    {conversations.map((conv, index) => (
                        <div
                            key={`${conv.id}-${index}`}
                            className={cn(
                                "group relative w-full rounded-lg text-sm transition-colors",
                                conv.id === activeConversationId ? "bg-muted" : "hover:bg-muted/50"
                            )}
                        >
                            <button
                                onClick={() => {
                                    if (onSelectConversation) {
                                        onSelectConversation(conv.id);
                                    } else {
                                        // If we are on profile page, go back to app with this conversation
                                        // This might need query param support if we want to open specific conv
                                        router.push('/app');
                                    }
                                    onCloseMobileDrawer?.();
                                }}
                                className="w-full text-left px-3 py-2 pr-12"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{conv.title}</span>
                                </div>
                            </button>
                            {onDeleteConversation && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete "${conv.title}"?`)) {
                                            onDeleteConversation(conv.id);
                                        }
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all pointer-events-none group-hover:pointer-events-auto"
                                    title="Delete conversation"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ))}

                    {conversations.length === 0 && !onNewConversation && (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            <p>Return to chat to see your conversations</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Profile Section */}
            <div className="p-3 border-t shrink-0">
                <button
                    onClick={() => {
                        router.push('/profile');
                        onCloseMobileDrawer?.();
                    }}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                        isProfilePage ? "bg-muted" : "hover:bg-muted"
                    )}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <div className="font-medium truncate text-sm">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                            {user?.email || 'user@example.com'}
                        </div>
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
            </div>
        </div>
    );
}
