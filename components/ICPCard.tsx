"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, AlertTriangle, Clock, DollarSign } from "lucide-react";

interface ICPCardProps {
  personaName: string;
  personaRole: string;
  personaCompany: string;
  location: string;
  country: string;
  title: string;
  description: string;
  painPoints: string[];
  fitScore?: number;
  profilesFound?: number;
  onSelect?: () => void;
}

// Icon mapping for pain points
const painPointIcons: Record<string, React.ReactNode> = {
  "compliance": <AlertTriangle className="size-4 text-yellow-500" />,
  "compliance stress": <AlertTriangle className="size-4 text-yellow-500" />,
  "manual": <Clock className="size-4 text-blue-500" />,
  "manual tax": <Clock className="size-4 text-blue-500" />,
  "deadline": <DollarSign className="size-4 text-green-500" />,
  "deadline management": <DollarSign className="size-4 text-green-500" />,
};

// Get icon for pain point (case-insensitive match)
function getPainPointIcon(painPoint: string): React.ReactNode {
  const lower = painPoint.toLowerCase();
  for (const [key, icon] of Object.entries(painPointIcons)) {
    if (lower.includes(key)) {
      return icon;
    }
  }
  // Default icon
  return <AlertTriangle className="size-4 text-muted-foreground" />;
}

// Generate initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ICPCard({
  personaName,
  personaRole,
  personaCompany,
  location,
  country,
  title,
  description,
  painPoints,
  fitScore = 90,
  profilesFound = 12,
  onSelect,
}: ICPCardProps) {
  return (
    <div className="rounded-lg border bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/20 dark:to-pink-900/10 p-4 space-y-3">
      {/* Category Tag at Top */}
      <div>
        <span className="px-2.5 py-1 rounded-full bg-pink-200 dark:bg-pink-900/50 text-pink-900 dark:text-pink-100 text-xs font-semibold">
          {title}
        </span>
      </div>

      {/* First Row: Avatar + User Info */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-14 border-2 border-white dark:border-gray-800">
            <AvatarFallback className="bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-800 dark:to-pink-900 text-pink-900 dark:text-pink-100 text-base font-semibold">
              {getInitials(personaName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {personaName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {personaRole}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {personaCompany}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="size-3" />
            <span className="truncate">{location}, {country}</span>
          </div>
        </div>
      </div>

      {/* Second Row: Key Challenges (Vertical) + Profiles Found */}
      <div className="space-y-2">
        {/* Key Challenges - Vertical */}
        {painPoints && painPoints.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Key Challenges
            </h4>
            <div className="flex flex-col gap-2">
              {painPoints.map((pain, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {getPainPointIcon(pain)}
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {pain}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profiles Found */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{profilesFound}+</span>{" "}
              <span className="text-gray-600 dark:text-gray-400">LinkedIn profiles found</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-100 hover:bg-pink-100 dark:hover:bg-pink-900/30 h-8 text-xs cursor-pointer"
            onClick={() => onSelect?.()}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}

