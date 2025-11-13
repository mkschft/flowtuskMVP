import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AutoAcceptInvitations } from "@/components/AutoAcceptInvitations";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ULayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user flows
    const { data: flowsRows } = await supabase
        .from("flows")
        .select("id,title")
        .order("created_at", { ascending: false });

    // Build user display name from user metadata
    const firstName = user?.user_metadata?.first_name || "";
    const lastName = user?.user_metadata?.last_name || "";
    const fullName = firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || user?.email?.split("@")[0] || "User";

    const userData = {
        name: fullName,
        email: user?.email || "",
        avatar: user?.user_metadata?.avatar_url || "",
    };

    return (
        <SidebarProvider>
            <AutoAcceptInvitations />
            <AppSidebar user={userData} flows={(flowsRows || []) as { id: string; title: string }[]} />
            <main className="flex-1 h-screen overflow-hidden flex flex-col">
                <AppNavbar />
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}

