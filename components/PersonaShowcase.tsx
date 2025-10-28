"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Target,
  TrendingUp,
  FileText,
  Presentation,
  Share2,
  Download,
  FileImage
} from "lucide-react";

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
};

type ValuePropData = {
  variables: ValuePropVariable[];
  variations: ValuePropVariation[];
  icp: ICP;
};

type PersonaShowcaseProps = {
  personas: ICP[];
  selectedPersonaId: string;
  valuePropData: Record<string, ValuePropData>;
  onPersonaChange?: (personaId: string) => void;
  onExport?: (format: string, data: { personas: ICP[]; valuePropData: Record<string, ValuePropData> }) => void;
  onContinue?: (persona: ICP) => void;
  readOnly?: boolean;
};

export function PersonaShowcase({
  personas,
  selectedPersonaId,
  valuePropData,
  onPersonaChange,
  onExport,
  onContinue,
  readOnly = false
}: PersonaShowcaseProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPersonaId, setExpandedPersonaId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedIndex = personas.findIndex(p => p.id === selectedPersonaId);
  
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = async (format: string) => {
    // Handle image export client-side
    if (format === 'image') {
      if (!cardRef.current) return;

      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(cardRef.current, {
          background: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true
        });

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const selectedPersona = personas.find(p => p.id === selectedPersonaId);
          link.download = `${selectedPersona?.personaName || 'persona'}-positioning.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        });

        return;
      } catch (error) {
        console.error('Image export failed:', error);
        return;
      }
    }

    // Existing export logic for other formats
    if (!onExport) return;

    const selectedPersona = personas.find(p => p.id === selectedPersonaId);
    if (!selectedPersona) return;

    const data = {
      personas: [selectedPersona],
      valuePropData: {
        [selectedPersonaId]: valuePropData[selectedPersonaId]
      },
      websiteUrl: '' // Add if needed
    };

    onExport(format, data);
  };

  const getPersonaColor = (idx: number) => {
    const colors = [
      { 
        gradient: "from-pink-500/10 to-purple-500/10",
        border: "border-pink-200 dark:border-pink-800",
        badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
        avatar: "ring-pink-200 dark:ring-pink-800",
        button: "bg-pink-600 hover:bg-pink-700"
      },
      { 
        gradient: "from-purple-500/10 to-blue-500/10",
        border: "border-purple-200 dark:border-purple-800",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        avatar: "ring-purple-200 dark:ring-purple-800",
        button: "bg-purple-600 hover:bg-purple-700"
      },
      { 
        gradient: "from-blue-500/10 to-cyan-500/10",
        border: "border-blue-200 dark:border-blue-800",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        avatar: "ring-blue-200 dark:ring-blue-800",
        button: "bg-blue-600 hover:bg-blue-700"
      }
    ];
    return colors[idx % colors.length];
  };

  const getValuePropText = (personaId: string): string => {
    const data = valuePropData[personaId];
    if (!data?.variations?.[0]) return "Value proposition coming soon...";
    return data.variations[0].text;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <h3 className="text-2xl font-bold mb-2">Your Customer Positioning</h3>
        <p className="text-muted-foreground">
          {personas.length} ideal customer profiles with tailored value propositions
        </p>
      </div>

      {/* Persona Cards Stack */}
      <div className="relative min-h-[500px] flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {personas.map((persona, idx) => {
            const isSelected = persona.id === selectedPersonaId;
            const color = getPersonaColor(idx);
            const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(persona.personaName)}`;
            const valueProp = getValuePropText(persona.id);
            const isExpanded = expandedPersonaId === persona.id;
            
            // Calculate card positioning
            const offset = idx - selectedIndex;
            const isBackground = !isSelected;
            
            return (
              <Card
                key={persona.id}
                className={`
                  relative overflow-hidden border-2 ${color.border} 
                  transition-all duration-500 ease-out
                  ${isSelected 
                    ? 'scale-100 opacity-100 z-20 shadow-2xl' 
                    : 'scale-95 opacity-60 z-10 hover:opacity-80'
                  }
                  ${!readOnly && !isSelected ? 'cursor-pointer' : ''}
                  ${isBackground ? 'blur-[1px] hover:blur-[0.5px]' : ''}
                `}
                style={{
                  transform: isBackground 
                    ? `translateY(${offset * -20}px) scale(${isSelected ? 1 : 0.95})` 
                    : 'translateY(0)',
                }}
                onClick={() => {
                  if (!readOnly && !isSelected && onPersonaChange) {
                    onPersonaChange(persona.id);
                  }
                }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient}`} />

                <div
                  ref={isSelected ? cardRef : null}
                  className="relative p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={avatarUrl}
                        alt={persona.personaName}
                        className={`w-16 h-16 rounded-xl ring-2 ${color.avatar} ring-offset-2 ring-offset-background transition-transform ${isSelected ? 'scale-110' : ''}`}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">
                        {persona.personaName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-0.5">
                        {persona.personaRole}
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        {persona.personaCompany}
                      </p>
                      {persona.location && persona.country && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground/60">
                            {persona.location}, {persona.country}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ICP Badge */}
                    <Badge className={`${color.badge} text-xs shrink-0`}>
                      {persona.title}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {persona.description}
                  </p>

                  {isSelected && (
                    <>
                      {/* Value Proposition - Always Visible */}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            ⭐
                          </div>
                          <h4 className="font-semibold text-base">Value Proposition</h4>
                        </div>
                        
                        <div className="relative group">
                          <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm leading-relaxed font-medium">
                              &quot;{valueProp}&quot;
                            </p>
                          </div>
                          
                          {/* Copy button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(valueProp, `vp-${persona.id}`);
                            }}
                          >
                            {copiedId === `vp-${persona.id}` ? (
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

                        {/* Export Options - Dropdown Menu */}
                        <div className="pt-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs w-full hover:bg-purple-50 dark:hover:bg-purple-950"
                              >
                                <Download className="h-3 w-3 mr-2" />
                                Export
                                <ChevronDown className="h-3 w-3 ml-auto" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                              <DropdownMenuLabel className="text-xs">Export Format</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport('image');
                                }}
                                className="cursor-pointer"
                              >
                                <FileImage className="h-3.5 w-3.5 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">PNG Image</span>
                                  <span className="text-[10px] text-muted-foreground">High-res card image</span>
                                </div>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport('google-slides');
                                }}
                                className="cursor-pointer"
                              >
                                <Presentation className="h-3.5 w-3.5 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">Google Slides</span>
                                  <span className="text-[10px] text-muted-foreground">Presentation template</span>
                                </div>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport('linkedin');
                                }}
                                className="cursor-pointer"
                              >
                                <Share2 className="h-3.5 w-3.5 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">LinkedIn Post</span>
                                  <span className="text-[10px] text-muted-foreground">Copy to clipboard</span>
                                </div>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport('plain-text');
                                }}
                                className="cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">Plain Text</span>
                                  <span className="text-[10px] text-muted-foreground">Copy all details</span>
                                </div>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem disabled className="opacity-50">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">PDF</span>
                                  <span className="text-[10px] text-muted-foreground">Coming soon</span>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Collapsible Details */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPersonaId(isExpanded ? null : persona.id);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {isExpanded ? 'Hide' : 'Show'} detailed profile
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-4 animate-in slide-in-from-top-2">
                            {/* Pain Points */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-red-500" />
                                <h5 className="font-semibold text-sm">Pain Points</h5>
                              </div>
                              <ul className="space-y-2">
                                {persona.painPoints.map((point, pidx) => (
                                  <li key={pidx} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span className="text-muted-foreground">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Goals */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <h5 className="font-semibold text-sm">Goals</h5>
                              </div>
                              <ul className="space-y-2">
                                {persona.goals.map((goal, gidx) => (
                                  <li key={gidx} className="flex items-start gap-2 text-sm">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span className="text-muted-foreground">{goal}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Demographics */}
                            {persona.demographics && (
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Demographics</h5>
                                <p className="text-sm text-muted-foreground">
                                  {persona.demographics}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Navigation hint for non-selected cards */}
                  {!isSelected && !readOnly && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        Click to view details
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Continue to Email Button */}
      {onContinue && !readOnly && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => {
              const selectedPersona = personas.find(p => p.id === selectedPersonaId);
              if (selectedPersona) {
                onContinue(selectedPersona);
              }
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Continue to Email Sequence →
          </Button>
        </div>
      )}

      {/* Navigation dots */}
      {personas.length > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {personas.map((persona, idx) => {
            const isSelected = persona.id === selectedPersonaId;
            const color = getPersonaColor(idx);
            return (
              <button
                key={persona.id}
                onClick={() => !readOnly && onPersonaChange?.(persona.id)}
                disabled={readOnly}
                className={`
                  h-2 rounded-full transition-all
                  ${isSelected ? 'w-8' : 'w-2'}
                  ${isSelected ? color.button : 'bg-muted-foreground/30'}
                  ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                `}
                aria-label={`View ${persona.personaName}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

