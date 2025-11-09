"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ICPCard } from "@/components/ICPCard";

interface ICPResponseProps {
  icpData: {
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
  };
  websiteUrl?: string;
  flowId?: string;
  onICPSelect?: (icpData: { personaName: string; title: string; [key: string]: any }) => void;
}

export function ICPResponse({ icpData, websiteUrl, flowId, onICPSelect }: ICPResponseProps) {
  return (
    <ICPCard 
      {...icpData}
      onSelect={() => onICPSelect?.(icpData)}
    />
  );
}

