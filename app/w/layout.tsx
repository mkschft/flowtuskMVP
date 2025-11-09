import { WorkflowsNavbar } from "@/components/workflows-navbar";
import { WorkflowsChat } from "@/components/WorkflowsChat";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

    return (
        <div className="flex h-screen w-full overflow-hidden flex-col">
            <WorkflowsNavbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Left side: Chat window - matches sidebar width (350px) */}
                <div
                    className="w-[350px] h-full border-r bg-background overflow-hidden flex flex-col shrink-0"
                    style={{ width: "350px" }}
                >
                    <WorkflowsChat />
                </div>

                {/* Right side: Content area - takes remaining space */}
                <div className="flex-1 h-full overflow-hidden bg-background">
                    {children}
                </div>
            </div>
        </div>
    );
}

