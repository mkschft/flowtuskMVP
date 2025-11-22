import type { Metadata } from "next";
import { Varela_Round } from "next/font/google";
import "./landing.css";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-varela",
});

export const metadata: Metadata = {
  title: "Flowtusk - AI Brand Agent | Build Your Brand in Minutes",
  description:
    "Get agency-quality brand strategy in 10 minutes. From personas to messaging to launch-ready content. AI-powered brand agent that understands your market.",
  keywords:
    "AI brand strategy, brand agent, customer personas, brand positioning, marketing content, brand messaging",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${varelaRound.variable} bg-white flex flex-col min-h-screen`}>
      {children}
    </div>
  );
}
