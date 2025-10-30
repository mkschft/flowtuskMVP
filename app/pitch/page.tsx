import { PitchDeck } from "@/components/pitch-deck/PitchDeck";

export const metadata = {
  title: "Flowtusk - Pitch Deck",
  description: "Vibe create your B2B funnel in minutes not weekends",
};

export default function PitchPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <PitchDeck />
    </main>
  );
}

