"use client";

import { useState } from "react";
import { ValuePropBuilder } from "./ValuePropBuilder";

type ICP = {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
  personaName: string;
  personaRole: string;
  personaCompany: string;
  location: string;
  country: string;
};

type ValuePropVariable = {
  key: string;
  label: string;
  type: 'dropdown' | 'input';
  options?: string[];
  selectedValue: string;
  placeholder?: string;
};

type ValuePropVariation = {
  id: string;
  style: string;
  text: string;
  useCase: string;
  emoji: string;
  sourceFactIds?: string[];
};

type ValuePropData = {
  variables: ValuePropVariable[];
  variations: ValuePropVariation[];
  icp: ICP;
  summary?: {
    approachStrategy: string;
    expectedImpact: string;
    mainInsight: string;
    painPointsAddressed: string[];
  };
};

type ValuePropBuilderWrapperProps = {
  valuePropData: ValuePropData;
  websiteUrl: string;
  conversationId?: string;
  onVariationsGenerated?: (data: ValuePropData) => void;
  onConfirmValueProp?: () => void;
  factsJson?: any;
};

export function ValuePropBuilderWrapper({
  valuePropData,
  websiteUrl,
  conversationId,
  onVariationsGenerated,
  onConfirmValueProp,
  factsJson,
}: ValuePropBuilderWrapperProps) {
  const [localVariables, setLocalVariables] = useState(valuePropData.variables);
  const [localVariations, setLocalVariations] = useState(valuePropData.variations);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  const handleVariableChange = (key: string, value: string) => {
    setLocalVariables(prev =>
      prev.map(v => v.key === key ? { ...v, selectedValue: value } : v)
    );
  };

  const handleGenerateVariations = async () => {
    setIsGeneratingVariations(true);
    try {
      // Re-generate variations with updated variables
      const response = await fetch("/api/generate-value-prop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icp: valuePropData.icp,
          websiteUrl,
          factsJson,
          variables: localVariables
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalVariations(data.variations);

        // Call callback with full data including updated variations
        if (onVariationsGenerated) {
          onVariationsGenerated({
            ...valuePropData,
            variables: localVariables,
            variations: data.variations,
            summary: data.summary
          });
        }
      }
    } catch (error) {
      console.error("Error generating variations:", error);
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleConfirmValueProp = () => {
    if (onConfirmValueProp) {
      onConfirmValueProp();
    }
  };

  return (
    <div className="space-y-4">
      <ValuePropBuilder
        personaTitle={valuePropData.icp.title}
        variables={localVariables}
        onVariableChange={handleVariableChange}
        onGenerateVariations={handleGenerateVariations}
        variations={localVariations}
        isGeneratingVariations={isGeneratingVariations}
        conversationId={conversationId}
        onConfirmValueProp={handleConfirmValueProp}
      />
      
    </div>
  );
}

