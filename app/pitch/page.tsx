import { PitchDeck } from "@/components/pitch-deck/PitchDeck";
import { Varela_Round } from "next/font/google";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Flowtusk - Pitch Deck",
  description: "Vibe create your B2B funnel in minutes not weekends",
};

export default function PitchPage() {
  return (
    <main className={`w-full h-screen overflow-hidden ${varelaRound.className}`}>
      <PitchDeck />
    </main>
  );
}

