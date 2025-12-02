/**
 * Brand Rationale Panel
 *
 * Shows transparent reasoning for why each brand decision was made.
 * This is FlowTusk's unique moat - evidence-based, transparent AI.
 */

'use client';

import { Info, Palette, Type, MessageSquare, Sparkles } from 'lucide-react';
import type { BrandManifest } from '@/lib/types/brand-manifest';

interface BrandRationalePanelProps {
  manifest: BrandManifest;
  className?: string;
}

export function BrandRationalePanel({ manifest, className = '' }: BrandRationalePanelProps) {
  const rationale = manifest.identity?.rationale;

  if (!rationale) {
    return null; // Don't show if no rationale generated
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Info className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Why We Chose This Brand Direction
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Evidence-based design decisions grounded in your business context
          </p>
        </div>
      </div>

      {/* Rationale Items */}
      <div className="space-y-4">
        {/* Colors Rationale */}
        {rationale.colors && (
          <RationaleItem
            icon={<Palette className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            title="Color Palette"
            content={rationale.colors}
            colors={manifest.identity.colors.primary}
          />
        )}

        {/* Typography Rationale */}
        {rationale.typography && (
          <RationaleItem
            icon={<Type className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="Typography"
            content={rationale.typography}
            fontFamily={manifest.identity.typography.heading.family}
          />
        )}

        {/* Tone Rationale */}
        {rationale.tone && (
          <RationaleItem
            icon={<MessageSquare className="w-5 h-5" />}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            title="Tone of Voice"
            content={rationale.tone}
            keywords={manifest.identity.tone.keywords}
          />
        )}

        {/* Overall Direction */}
        {rationale.overall && (
          <RationaleItem
            icon={<Sparkles className="w-5 h-5" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            title="Overall Brand Direction"
            content={rationale.overall}
            isHighlight
          />
        )}
      </div>

      {/* Evidence Badge */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm font-medium text-gray-700">
            Evidence-Based Design
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          All decisions are grounded in your business context, industry standards, and target persona insights.
        </p>
      </div>
    </div>
  );
}

interface RationaleItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  content: string;
  colors?: Array<{ name: string; hex: string; usage?: string }>;
  fontFamily?: string;
  keywords?: string[];
  isHighlight?: boolean;
}

function RationaleItem({
  icon,
  iconBg,
  iconColor,
  title,
  content,
  colors,
  fontFamily,
  keywords,
  isHighlight = false
}: RationaleItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        isHighlight
          ? 'bg-purple-50 border-purple-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 ${iconBg} rounded-lg flex-shrink-0`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>

          {/* Visual Examples */}
          {colors && colors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.slice(0, 3).map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                  <span className="text-xs text-gray-600">{color.name}</span>
                </div>
              ))}
            </div>
          )}

          {fontFamily && (
            <div className="mt-3">
              <p
                className="text-xl font-semibold text-gray-900"
                style={{ fontFamily }}
              >
                {fontFamily}
              </p>
            </div>
          )}

          {keywords && keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.slice(0, 4).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for sidebars or collapsed states
 */
export function BrandRationalePanelCompact({ manifest }: BrandRationalePanelProps) {
  const rationale = manifest.identity?.rationale;

  if (!rationale || !rationale.overall) {
    return null;
  }

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-purple-900 mb-1">
            Why this brand direction?
          </p>
          <p className="text-xs text-purple-700 leading-relaxed">
            {rationale.overall}
          </p>
        </div>
      </div>
    </div>
  );
}
