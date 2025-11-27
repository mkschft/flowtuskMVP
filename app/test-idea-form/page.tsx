"use client";

import { useState } from "react";
import { IdeaInputForm } from "@/components/IdeaInputForm";
import { type IdeaInput } from "@/lib/prompt-templates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export default function TestIdeaFormPage() {
  const [submittedData, setSubmittedData] = useState<IdeaInput | null>(null);
  const [validationStatus, setValidationStatus] = useState<{
    ideaLength: boolean;
    hasTargetMarket: boolean;
    hasOptionalFields: boolean;
  } | null>(null);

  const handleSubmit = (data: IdeaInput) => {
    setSubmittedData(data);

    // Validate submission
    const ideaLength = data.idea.length;
    setValidationStatus({
      ideaLength: ideaLength >= 50 && ideaLength <= 500,
      hasTargetMarket: data.targetMarket.length > 0,
      hasOptionalFields: !!(data.problemStatement || data.solutionHypothesis || data.brandVibe),
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">IdeaInputForm Component Test</h1>
          <p className="text-muted-foreground">
            Test the IdeaInputForm component in isolation. Submit the form to see validation results.
          </p>
        </div>

        {/* Component Under Test */}
        <Card className="p-6">
          <IdeaInputForm onSubmit={handleSubmit} />
        </Card>

        {/* Validation Results */}
        {submittedData && validationStatus && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Validation Results</h2>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {validationStatus.ideaLength ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Idea length: {submittedData.idea.length} characters (50-500 required)</span>
              </div>

              <div className="flex items-center gap-2">
                {validationStatus.hasTargetMarket ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Target market: {submittedData.targetMarket ? "Provided" : "Missing"}</span>
              </div>

              <div className="flex items-center gap-2">
                {validationStatus.hasOptionalFields ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Badge variant="secondary">Optional fields not provided</Badge>
                )}
                <span>Optional fields: {validationStatus.hasOptionalFields ? "Provided" : "Not provided"}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Submitted Data:</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Test Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">Test Checklist:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Try submitting with less than 50 characters (should be disabled)</li>
            <li>Try submitting with more than 500 characters (should be disabled)</li>
            <li>Try submitting without target market (should be disabled)</li>
            <li>Verify character counter updates in real-time</li>
            <li>Verify border colors change (yellow → green → red)</li>
            <li>Toggle optional fields and verify they appear/disappear</li>
            <li>Submit with all fields filled and verify JSON output</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
