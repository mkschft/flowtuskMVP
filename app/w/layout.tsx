import { WorkflowsNavbar } from "@/components/workflows-navbar";
import { WorkflowsChat } from "@/components/WorkflowsChat";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkflowTabProvider } from "./context";

export default async function WLayout({
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
        <WorkflowTabProvider>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Left side: Workspace window - matches sidebar width (385.875px) */}
                <div
                    className="w-[385.875px] h-full border-r bg-background overflow-hidden flex flex-col shrink-0"
                    style={{ width: "385.875px" }}
                >
                    <WorkflowsChat />
                </div>

                {/* Right side: Content area - takes remaining space */}
                <div className="flex-1 h-full overflow-hidden bg-background flex flex-col">
                    <WorkflowsNavbar user={userData} />
                    <div className="flex-1 overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </WorkflowTabProvider>
    );
}

