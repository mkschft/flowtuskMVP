import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
