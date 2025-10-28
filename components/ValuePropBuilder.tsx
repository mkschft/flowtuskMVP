"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Copy, 
  Download, 
  Sparkles, 
  Check, 
  RefreshCw
} from "lucide-react";
import { SmartButton } from "@/app/app/page";

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
};

type ValuePropBuilderProps = {
  personaTitle: string;
  variables: ValuePropVariable[];
  onVariableChange: (key: string, value: string) => void;
  onGenerateVariations: () => void;
  variations?: ValuePropVariation[];
  isGeneratingVariations?: boolean;
  conversationId?: string;
};

export function ValuePropBuilder({
  personaTitle,
  variables,
  onVariableChange,
  onGenerateVariations,
  variations = [],
  // isGeneratingVariations = false,
  conversationId
}: ValuePropBuilderProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showVariations, setShowVariations] = useState(false);

  // Build preview text
  const buildPreview = () => {
    let text = "I help ";
    
    const role = variables.find(v => v.key === 'role')?.selectedValue;
    const industry = variables.find(v => v.key === 'industry')?.selectedValue;
    const region = variables.find(v => v.key === 'region')?.selectedValue;
    const pain = variables.find(v => v.key === 'pain')?.selectedValue;
    const metric = variables.find(v => v.key === 'metric')?.selectedValue;
    const method = variables.find(v => v.key === 'method')?.selectedValue;
    const solution = variables.find(v => v.key === 'solution')?.selectedValue;

    text += `${role} at ${industry}`;
    if (region) text += ` in ${region}`;
    text += ` reduce ${pain} by ${metric} using ${method} ${solution}.`;

    return text;
  };

  const handleCopy = async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id || 'preview');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateVariations = () => {
    setShowVariations(true);
    onGenerateVariations();
  };

  return (
    <div className="space-y-4">
      {/* Main Value Prop Builder Card */}
      <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
        
        <div className="relative">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-pink-500/10 to-purple-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg">Value Proposition Builder</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              For: <span className="font-semibold text-foreground">{personaTitle}</span>
            </p>
          </div>

          {/* Interactive Template */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Build Your Perfect One-Liner:
              </p>
              
              <div className="flex flex-wrap items-center gap-2 text-base leading-relaxed">
                <span>I help</span>
                
                {/* Role dropdown */}
                {variables.map((variable) => (
                  <div key={variable.key} className="inline-flex">
                    {variable.type === 'dropdown' ? (
                      <Select
                        value={variable.selectedValue}
                        onValueChange={(value) => onVariableChange(variable.key, value)}
                      >
                        <SelectTrigger className="h-8 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors">
                          <SelectValue placeholder={variable.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={variable.selectedValue}
                        onChange={(e) => onVariableChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder}
                        className="h-8 w-20 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30"
                      />
                    )}
                    {variable.key === 'role' && <span className="ml-2">at</span>}
                    {variable.key === 'industry' && <span className="ml-2">in</span>}
                    {variable.key === 'region' && <span className="ml-2">reduce</span>}
                    {variable.key === 'pain' && <span className="ml-2">by</span>}
                    {variable.key === 'metric' && <span className="ml-2">using</span>}
                    {variable.key === 'method' && null}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              
              <div className="relative group">
                <div className="p-4 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/20">
                  <p className="text-sm leading-relaxed font-medium">
                    {buildPreview()}
                  </p>
                </div>
                
                {/* Copy button on hover */}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(buildPreview())}
                >
                  {copiedId === 'preview' ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Use Cases */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: '💼', label: 'LinkedIn headline' },
                  { icon: '✉️', label: 'Email signature' },
                  { icon: '🌐', label: 'Website hero' },
                  { icon: '📊', label: 'Pitch deck' }
                ].map((useCase) => (
                  <Badge 
                    key={useCase.label}
                    variant="secondary" 
                    className="text-xs bg-muted/50"
                  >
                    <span className="mr-1">{useCase.icon}</span>
                    {useCase.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <SmartButton
                action="generate-variations"
                onClick={handleGenerateVariations}
                conversationId={conversationId}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                loadingText="Generating variations..."
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Variations
              </SmartButton>
              <Button
                variant="outline"
                onClick={() => handleCopy(buildPreview())}
              >
                {copiedId === 'preview' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Export functionality
                  const data = {
                    valueProp: buildPreview(),
                    variations: variations.map(v => v.text),
                    persona: personaTitle
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'value-prop.json';
                  a.click();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Variations Section */}
      {showVariations && variations.length > 0 && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <div className="p-4 border-b bg-gradient-to-r from-pink-500/10 to-purple-500/10">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {variations.length} Variations Ready
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Different styles to match your communication needs
            </p>
          </div>

          <div className="p-4 space-y-3">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="group relative p-4 rounded-lg border border-border hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{variation.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">{variation.style}</p>
                      <p className="text-xs text-muted-foreground">
                        Use for: {variation.useCase}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(variation.text, variation.id)}
                  >
                    {copiedId === variation.id ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-sm leading-relaxed">
                  &ldquo;{variation.text}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const allVariations = variations.map(v => v.text).join('\n\n');
                  handleCopy(allVariations, 'all');
                }}
              >
                {copiedId === 'all' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied All
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const csv = [
                    'Style,Text,Use Case',
                    ...variations.map(v => `"${v.style}","${v.text}","${v.useCase}"`)
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'value-prop-variations.csv';
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

