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
}

export function ICPResponse({ icpData, websiteUrl, flowId }: ICPResponseProps) {
  return (
    <ICPCard 
      {...icpData} 
    />
  );
}

