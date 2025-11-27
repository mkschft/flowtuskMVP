"use client";

import { useState } from "react";
import { FactsReviewStep } from "@/components/FactsReviewStep";
import { type FactsJSON } from "@/lib/prompt-templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

// Sample test data - realistic facts_json from an idea
const SAMPLE_FACTS_JSON: FactsJSON = {
  facts: [
    {
      id: "fact-1",
      text: "Automates VAT calculations for UK mid-market accounting firms (10-50 employees), saving 40% time on quarterly filings",
      page: "Idea Description",
      evidence: "From user input: 'AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance'",
      source: "user-prompt"
    },
    {
      id: "fact-2",
      text: "Targets accounting firms serving 100+ SMB clients requiring Making Tax Digital (MTD) compliance",
      page: "Target Market",
      evidence: "From user input: 'UK accounting firms, 10-50 employees, handling 100+ SMB clients'",
      source: "user-prompt"
    },
    {
      id: "fact-3",
      text: "Reduces manual data entry errors in VAT return preparation through AI-powered receipt scanning and categorization",
      page: "Idea Description",
      evidence: "From user input: 'automates MTD VAT compliance and reduces filing time by 40%'",
      source: "user-prompt"
    },
    {
      id: "fact-4",
      text: "Integrates with existing accounting software (Xero, QuickBooks, Sage) via API connections",
      page: "Solution Hypothesis",
      evidence: "From user input: 'integrates with popular accounting platforms'",
      source: "user-prompt"
    },
    {
      id: "fact-5",
      text: "Provides real-time compliance alerts for HMRC regulation changes affecting VAT calculations",
      page: "Idea Description",
      evidence: "From user input: 'keeps firms compliant with latest HMRC regulations'",
      source: "user-prompt"
    }
  ],
  valueProps: [
    {
      id: "vp-1",
      forICP: "all",
      claim: "Save 40% time on VAT filing",
      supportingFactIds: ["fact-1"],
      emotionalHook: "reclaim",
      specificity: 5
    },
    {
      id: "vp-2",
      forICP: "all",
      claim: "Eliminate manual data entry errors",
      supportingFactIds: ["fact-3"],
      emotionalHook: "confidence",
      specificity: 4
    }
  ],
  pains: [
    {
      id: "pain-1",
      description: "Time-consuming manual VAT calculations",
      severity: "critical",
      frequency: "quarterly",
      evidence: "From user input: 'reduces filing time by 40%'",
      affectedICPs: ["all"]
    },
    {
      id: "pain-2",
      description: "Risk of compliance errors and HMRC penalties",
      severity: "high",
      frequency: "quarterly",
      evidence: "From user input: 'ensures MTD compliance'",
      affectedICPs: ["all"]
    }
  ],
  brand: {
    name: "TaxFlow AI",
    mission: "Simplify tax compliance for UK accounting firms",
    vision: "Every accounting firm has access to affordable AI-powered tax automation",
    positioning: "The trusted AI tax assistant for mid-market UK accountants",
    personality: ["professional", "reliable", "efficient"],
    tones: ["professional", "trustworthy", "modern"]
  },
  structure: {
    keyPages: [
      {
        name: "Core Value Prop",
        path: "/value-proposition",
        focus: "Time savings and compliance automation"
      },
      {
        name: "Target Market",
        path: "/for-accountants",
        focus: "UK mid-market accounting firms"
      }
    ]
  },
  targetMarket: {
    primaryRegion: "United Kingdom",
    regions: ["UK"],
    signals: [
      "User specified: UK market",
      "Industry: B2B SaaS for accounting",
      "Firm size: 10-50 employees"
    ]
  }
};

export default function TestFactsReviewPage() {
  const [approvedFacts, setApprovedFacts] = useState<FactsJSON | null>(null);

  const handleApprove = (editedFactsJson: FactsJSON) => {
    setApprovedFacts(editedFactsJson);
  };

  const handleReset = () => {
    setApprovedFacts(null);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">FactsReviewStep Component Test</h1>
          <p className="text-muted-foreground">
            Test the FactsReviewStep component with sample AI-generated facts. Try editing facts and approving.
          </p>
        </div>

        {/* Component Under Test */}
        {!approvedFacts ? (
          <FactsReviewStep
            factsJson={SAMPLE_FACTS_JSON}
            onApprove={handleApprove}
            onEdit={() => alert("Edit button clicked - would navigate back to idea input")}
          />
        ) : (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Facts Approved!</h2>
            </div>

            <p className="text-sm text-muted-foreground">
              The user approved {approvedFacts.facts.length} facts. In the real flow, this would proceed to ICP generation.
            </p>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Approved Facts JSON:</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(approvedFacts, null, 2)}
              </pre>
            </div>

            <Button onClick={handleReset}>Reset Test</Button>
          </Card>
        )}

        {/* Test Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">Test Checklist:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Verify all 5 facts are displayed with proper formatting</li>
            <li>Check that brand summary shows: TaxFlow AI, United Kingdom, professional/reliable/efficient tones</li>
            <li>Verify yellow disclaimer box appears with AlertCircle icon</li>
            <li>Click "Edit" on a fact and verify textarea appears</li>
            <li>Edit a fact's text and verify changes are saved</li>
            <li>Verify "Save Changes & Continue" button text appears after edits</li>
            <li>Click "Approve & Continue to ICPs" and verify approval flow</li>
            <li>Check that source badge shows "user-prompt" for each fact</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
