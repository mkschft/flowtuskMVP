import { AIComposer } from "@/components/AIComposer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">

      </ScrollArea>
      {/* AI prompt composer */}
      <AIComposer />
    </div>
  );
}


