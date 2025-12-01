import { CheckCircle2 } from "lucide-react";

interface SystemUpdateCardProps {
  updates?: string[];
  message?: string;
}

export function SystemUpdateCard({ updates = [], message = "Applied your changes" }: SystemUpdateCardProps) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-3 text-sm max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="font-medium text-green-900">{message}</span>
      </div>
      {updates.length > 0 && (
        <ul className="space-y-1 text-green-800 ml-6">
          {updates.map((update, i) => (
            <li key={i} className="text-xs">• {update}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
