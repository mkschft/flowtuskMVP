import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Flowtusk - Find Who You're Selling To in Minutes Not Weeks",
  description: "Paste your website URL. Get customer clarity. Export ready-to-use templates—emails, landing pages, LinkedIn, pitch decks—rooted in real customer insights. All in 15 minutes.",
  keywords: "customer personas, ideal customer profile, B2B marketing, landing page generator, email templates, LinkedIn content, pitch deck, customer insights",
  openGraph: {
    title: "Flowtusk - Find Who You're Selling To in Minutes Not Weeks",
    description: "Get customer clarity and ready-to-use marketing templates in 15 minutes. No credit card required.",
    type: "website",
  },
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar user={userData} flows={(flowsRows || []) as { id: string; title: string }[]} />
            <main className="flex-1 h-screen overflow-hidden flex flex-col">
              <AppNavbar />
              <div className="flex-1 overflow-hidden">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
