"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Share2,
  Loader2,
  Check,
  Presentation,
  Copy,
  Linkedin,
  FileDown
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

export type ExportFormat = 'google-slides' | 'linkedin' | 'plain-text' | 'pdf' | 'share-link' | 'image';

type ExportOptionsProps = {
  personas: ICP[];
  valuePropData: Record<string, ValuePropData>;
  websiteUrl: string;
  onExport: (format: ExportFormat) => Promise<void>;
};

type ExportOption = {
  id: ExportFormat;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  available: boolean;
};

export function ExportOptions({
  personas,
  valuePropData,
  onExport
}: ExportOptionsProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [completedFormats, setCompletedFormats] = useState<Set<ExportFormat>>(new Set());

  const exportOptions: ExportOption[] = [
    {
      id: 'google-slides',
      title: 'Google Slides',
      description: 'Professional pitch deck with all personas',
      icon: <Presentation className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
      badge: 'Recommended',
      available: true
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Post',
      description: 'Formatted post ready to share',
      icon: <Linkedin className="h-6 w-6" />,
      color: 'from-blue-600 to-blue-700',
      available: true
    },
    {
      id: 'plain-text',
      title: 'Plain Text',
      description: 'Simple copy-paste format',
      icon: <Copy className="h-6 w-6" />,
      color: 'from-gray-600 to-gray-700',
      available: true
    },
    {
      id: 'pdf',
      title: 'PDF Report',
      description: 'Downloadable document',
      icon: <FileDown className="h-6 w-6" />,
      color: 'from-red-600 to-red-700',
      badge: 'Coming Soon',
      available: false
    },
    {
      id: 'share-link',
      title: 'Share Link',
      description: 'Public URL to share your positioning',
      icon: <Share2 className="h-6 w-6" />,
      color: 'from-purple-600 to-pink-600',
      badge: 'Coming Soon',
      available: false
    }
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!exportOptions.find(opt => opt.id === format)?.available) {
      return;
    }

    setLoadingFormat(format);
    try {
      await onExport(format);
      setCompletedFormats(prev => new Set(prev).add(format));
      
      // Reset completed state after 3 seconds
      setTimeout(() => {
        setCompletedFormats(prev => {
          const next = new Set(prev);
          next.delete(format);
          return next;
        });
      }, 3000);
    } catch (error) {
      console.error(`Export ${format} failed:`, error);
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <h3 className="text-2xl font-bold mb-2">Export Your Positioning</h3>
        <p className="text-muted-foreground">
          Choose your format and start using your positioning materials
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const isLoading = loadingFormat === option.id;
          const isCompleted = completedFormats.has(option.id);
          const isDisabled = !option.available || isLoading;

          return (
            <Card
              key={option.id}
              className={`
                relative overflow-hidden border-2 transition-all duration-300
                ${option.available 
                  ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border' 
                  : 'opacity-60 cursor-not-allowed border-muted'
                }
                ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
              `}
              onClick={() => !isDisabled && handleExport(option.id)}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color}`} />
              
              {/* Badge */}
              {option.badge && (
                <div className="absolute top-3 right-3">
                  <span className={`
                    text-xs font-semibold px-2 py-1 rounded-full
                    ${option.available 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {option.badge}
                  </span>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-white
                  bg-gradient-to-br ${option.color}
                  ${!option.available && 'opacity-50'}
                `}>
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    option.icon
                  )}
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    {option.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  className={`
                    w-full bg-gradient-to-r ${option.color} text-white
                    ${!option.available && 'opacity-50'}
                  `}
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) handleExport(option.id);
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : isCompleted ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Ready!
                    </>
                  ) : option.available ? (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Export
                    </>
                  ) : (
                    'Coming Soon'
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {personas.length}
            </div>
            <div className="text-xs text-muted-foreground">Personas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {Object.keys(valuePropData).length}
            </div>
            <div className="text-xs text-muted-foreground">Value Props</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {exportOptions.filter(o => o.available).length}
            </div>
            <div className="text-xs text-muted-foreground">Export Formats</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground py-2">
        <p>
          💡 Tip: Start with Google Slides for a complete pitch deck, or LinkedIn for quick social posts
        </p>
      </div>
    </div>
  );
}

