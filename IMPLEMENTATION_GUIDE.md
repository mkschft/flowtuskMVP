# Implementation Guide: Export Features
## Tactical Roadmap with Code Examples

Based on STRATEGIC_ANALYSIS.md - This guide provides concrete implementation steps.

---

## Week 1: Quick Wins (Design Tokens + v0 Prompts)

### Day 1-2: Design Tokens Export

#### Step 1: Create Export API Route

```typescript
// app/api/export/design-tokens/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { flowId, icpId, format } = await req.json();

  // Fetch design assets
  const { data: designAssets } = await supabase
    .from('positioning_design_assets')
    .select('*')
    .eq('icp_id', icpId)
    .eq('parent_flow', flowId)
    .single();

  if (!designAssets) {
    return NextResponse.json({ error: "Design assets not found" }, { status: 404 });
  }

  // Generate format-specific exports
  const exports = {
    tailwind: generateTailwindConfig(designAssets),
    css: generateCSSVariables(designAssets),
    shadcn: generateShadcnTheme(designAssets),
    figmaTokens: generateFigmaTokens(designAssets)
  };

  return NextResponse.json({
    format: format || 'all',
    exports: format ? { [format]: exports[format] } : exports
  });
}

function generateTailwindConfig(assets: any) {
  const { brand_guide, style_guide } = assets;
  
  return {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: brand_guide?.colors?.primary || {},
          secondary: brand_guide?.colors?.secondary || {},
          accent: brand_guide?.colors?.accent || {},
          neutral: brand_guide?.colors?.neutral || {}
        },
        fontFamily: {
          heading: brand_guide?.typography?.heading || 'sans-serif',
          body: brand_guide?.typography?.body || 'sans-serif'
        },
        borderRadius: style_guide?.borderRadius || {},
        spacing: style_guide?.spacing || {}
      }
    }
  };
}

function generateCSSVariables(assets: any) {
  const { brand_guide } = assets;
  const colors = brand_guide?.colors || {};
  
  let css = ':root {\n';
  
  // Colors
  Object.entries(colors).forEach(([category, shades]: [string, any]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      css += `  --color-${category}-${shade}: ${value};\n`;
    });
  });
  
  // Typography
  if (brand_guide?.typography) {
    css += `  --font-heading: ${brand_guide.typography.heading};\n`;
    css += `  --font-body: ${brand_guide.typography.body};\n`;
  }
  
  css += '}\n';
  return css;
}

function generateShadcnTheme(assets: any) {
  const { brand_guide } = assets;
  
  return {
    name: "flowtusk-generated",
    type: "theme",
    cssVars: {
      light: {
        primary: brand_guide?.colors?.primary?.['500'] || '#000',
        secondary: brand_guide?.colors?.secondary?.['500'] || '#666',
        accent: brand_guide?.colors?.accent?.['500'] || '#0066cc'
      },
      dark: {
        primary: brand_guide?.colors?.primary?.['400'] || '#fff',
        secondary: brand_guide?.colors?.secondary?.['400'] || '#999',
        accent: brand_guide?.colors?.accent?.['400'] || '#3399ff'
      }
    }
  };
}

function generateFigmaTokens(assets: any) {
  const { brand_guide } = assets;
  
  return {
    color: Object.entries(brand_guide?.colors || {}).reduce((acc, [category, shades]: [string, any]) => {
      acc[category] = Object.entries(shades).reduce((shadeAcc, [shade, value]) => {
        shadeAcc[shade] = {
          value: value,
          type: "color"
        };
        return shadeAcc;
      }, {} as any);
      return acc;
    }, {} as any),
    typography: {
      heading: {
        value: brand_guide?.typography?.heading || "Inter",
        type: "fontFamily"
      },
      body: {
        value: brand_guide?.typography?.body || "Inter",
        type: "fontFamily"
      }
    }
  };
}
```

#### Step 2: Create UI Component

```typescript
// components/DesignTokensExport.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function DesignTokensExport({ flowId, icpId }: { flowId: string; icpId: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: string) => {
    const response = await fetch('/api/export/design-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, icpId, format })
    });

    const data = await response.json();
    const content = format === 'tailwind' 
      ? JSON.stringify(data.exports[format], null, 2)
      : data.exports[format];

    // Copy to clipboard
    await navigator.clipboard.writeText(
      typeof content === 'object' ? JSON.stringify(content, null, 2) : content
    );

    setCopied(format);
    setTimeout(() => setCopied(null), 2000);

    toast({
      title: "Copied to clipboard!",
      description: `${format} config is ready to paste into your project.`
    });
  };

  const handleDownload = async (format: string) => {
    const response = await fetch('/api/export/design-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, icpId, format })
    });

    const data = await response.json();
    const content = typeof data.exports[format] === 'object'
      ? JSON.stringify(data.exports[format], null, 2)
      : data.exports[format];

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-tokens-${format}.${format === 'css' ? 'css' : 'json'}`;
    a.click();
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Design Tokens
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('tailwind')}>
            {copied === 'tailwind' ? <Check className="mr-2 h-4 w-4" /> : null}
            Tailwind Config
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('css')}>
            {copied === 'css' ? <Check className="mr-2 h-4 w-4" /> : null}
            CSS Variables
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('shadcn')}>
            {copied === 'shadcn' ? <Check className="mr-2 h-4 w-4" /> : null}
            shadcn/ui Theme
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('figmaTokens')}>
            {copied === 'figmaTokens' ? <Check className="mr-2 h-4 w-4" /> : null}
            Figma Design Tokens
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleDownload('tailwind')}>
            tailwind.config.js
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('css')}>
            variables.css
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('shadcn')}>
            theme.json
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('figmaTokens')}>
            tokens.json
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

#### Step 3: Integrate into DesignStudioWorkspace

```typescript
// components/DesignStudioWorkspace.tsx
import { DesignTokensExport } from './DesignTokensExport';

// Add to Design Assets tab header:
<div className="flex justify-between items-center mb-4">
  <h2>Design Assets</h2>
  <DesignTokensExport flowId={flowId} icpId={selectedIcpId} />
</div>
```

---

### Day 3-5: v0/Cursor Prompt Generator

#### Step 1: Create Prompt Generation Logic

```typescript
// lib/prompt-generators.ts

export function generateV0Prompt(data: {
  icp: any;
  valueProp: any;
  brandGuide: any;
  styleGuide: any;
  landingPage: any;
}) {
  const { icp, valueProp, brandGuide, styleGuide, landingPage } = data;

  return `Create a modern, conversion-optimized landing page for a B2B SaaS product.

TARGET AUDIENCE:
- Role: ${icp.personaRole}
- Company: ${icp.personaCompany}
- Key Pain Points: ${icp.painPoints.join(', ')}
- Goals: ${icp.goals.join(', ')}

VALUE PROPOSITION:
"${valueProp.text}"

DESIGN SYSTEM:
Colors:
- Primary: ${brandGuide.colors.primary['500']}
- Secondary: ${brandGuide.colors.secondary['500']}
- Accent: ${brandGuide.colors.accent['500']}

Typography:
- Headings: ${brandGuide.typography.heading}
- Body: ${brandGuide.typography.body}

Button Styles:
- Border radius: ${styleGuide.buttons[0].borderRadius}
- Padding: ${styleGuide.buttons[0].padding}
- Hover effect: ${styleGuide.buttons[0].hoverEffect}

SECTIONS:
1. Hero:
   - Headline: ${landingPage.hero.headline}
   - Subheadline: ${landingPage.hero.subheadline}
   - CTA: ${landingPage.hero.cta}

2. Problem/Solution:
   ${landingPage.problemSolution}

3. Features:
   ${landingPage.features.map((f: any) => `- ${f.title}: ${f.description}`).join('\n   ')}

4. Social Proof:
   ${landingPage.socialProof.map((s: any) => `- ${s}`).join('\n   ')}

5. CTA:
   ${landingPage.finalCta}

BRAND VOICE:
${brandGuide.toneOfVoice.join(', ')}

TECHNICAL REQUIREMENTS:
- Responsive design (mobile-first)
- Smooth scroll animations
- Fast loading (optimize images)
- Accessibility (WCAG AA)
- SEO optimized

Please create a complete, production-ready landing page using Next.js, Tailwind CSS, and shadcn/ui components.`;
}

export function generateCursorPrompt(data: any) {
  // Cursor-specific format (more focused on code generation)
  return `// Landing Page Implementation

// Target: ${data.icp.personaRole} at ${data.icp.personaCompany}
// Value Prop: "${data.valueProp.text}"

// Design tokens
const theme = ${JSON.stringify(data.brandGuide.colors, null, 2)};

// Component structure:
// 1. Hero section with headline + CTA
// 2. Features grid (3 columns)
// 3. Social proof carousel
// 4. Final CTA section

// Use Next.js 14, Tailwind CSS, Framer Motion for animations
// Implement responsive design (mobile-first)
// Add smooth scroll to sections

// Start with the Hero component:`;
}

export function generateLovablePrompt(data: any) {
  // Lovable-specific format (more visual/conversational)
  return `I want to build a landing page for ${data.icp.personaCompany} targeting ${data.icp.personaRole}.

The value proposition is: "${data.valueProp.text}"

Use these colors:
- Primary: ${data.brandGuide.colors.primary['500']}
- Secondary: ${data.brandGuide.colors.secondary['500']}

Make it modern, clean, with smooth animations. Include:
1. A hero section with a compelling headline
2. Feature cards showing key benefits
3. Social proof section
4. Strong call-to-action

Keep the design minimal but impactful. Use the brand voice: ${data.brandGuide.toneOfVoice.join(', ')}.`;
}
```

#### Step 2: Create API Route

```typescript
// app/api/export/ai-prompts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateV0Prompt, generateCursorPrompt, generateLovablePrompt } from "@/lib/prompt-generators";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { flowId, icpId, tool } = await req.json();

  // Fetch all necessary data
  const { data: flow } = await supabase
    .from('positioning_flows')
    .select('*')
    .eq('id', flowId)
    .single();

  const { data: icp } = await supabase
    .from('positioning_icps')
    .select('*')
    .eq('id', icpId)
    .single();

  const { data: valueProp } = await supabase
    .from('positioning_value_props')
    .select('*')
    .eq('icp_id', icpId)
    .single();

  const { data: designAssets } = await supabase
    .from('positioning_design_assets')
    .select('*')
    .eq('icp_id', icpId)
    .single();

  const promptData = {
    icp: icp.persona_json,
    valueProp: valueProp.value_prop_json.variations[0],
    brandGuide: designAssets.brand_guide,
    styleGuide: designAssets.style_guide,
    landingPage: designAssets.landing_page
  };

  const prompts = {
    v0: generateV0Prompt(promptData),
    cursor: generateCursorPrompt(promptData),
    lovable: generateLovablePrompt(promptData)
  };

  return NextResponse.json({
    prompts: tool ? { [tool]: prompts[tool as keyof typeof prompts] } : prompts,
    instructions: {
      v0: "Open v0.dev, paste this prompt, and click Generate",
      cursor: "Open Cursor AI, start a new chat, paste this prompt",
      lovable: "Open Lovable.dev, describe your project, paste this prompt"
    }
  });
}
```

#### Step 3: Create UI Component

```typescript
// components/AIPromptGenerator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function AIPromptGenerator({ flowId, icpId }: { flowId: string; icpId: string }) {
  const [prompts, setPrompts] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    const response = await fetch('/api/export/ai-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, icpId })
    });
    const data = await response.json();
    setPrompts(data);
  };

  const handleCopy = async (tool: string, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopied(tool);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied to clipboard!",
      description: `Paste this into ${tool} to generate your landing page.`
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleGenerate}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Landing Page with AI Tools</DialogTitle>
        </DialogHeader>
        {prompts && (
          <Tabs defaultValue="v0" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="v0">v0.dev</TabsTrigger>
              <TabsTrigger value="cursor">Cursor AI</TabsTrigger>
              <TabsTrigger value="lovable">Lovable</TabsTrigger>
            </TabsList>
            {['v0', 'cursor', 'lovable'].map((tool) => (
              <TabsContent key={tool} value={tool} className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {prompts.instructions[tool]}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(tool, prompts.prompts[tool])}
                  >
                    {copied === tool ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto">
                  {prompts.prompts[tool]}
                </pre>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Week 2-3: Figma Integration

### Architecture Overview

```
FlowtuskMVP                           Figma
┌────────────────┐                   ┌────────────────┐
│ User clicks    │                   │ Figma API      │
│ "Export Figma" │ ─────1. OAuth───► │                │
└────────────────┘                   └────────────────┘
        │                                     │
        2. Fetch                              │
        design assets                         │
        │                                     │
        ▼                                     │
┌────────────────┐                           │
│ API generates  │ ───3. Create File─────────┤
│ Figma nodes    │      with REST API        │
└────────────────┘                           │
                                              ▼
                                   ┌────────────────┐
                                   │ Figma File     │
                                   │ - Color Styles │
                                   │ - Text Styles  │
                                   │ - Components   │
                                   │ - Frames       │
                                   └────────────────┘
```

### Implementation Steps

#### Step 1: Figma OAuth Setup

```typescript
// app/api/auth/figma/route.ts
import { NextRequest, NextResponse } from "next/server";

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID!;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL + '/api/auth/figma/callback';

export async function GET(req: NextRequest) {
  const authUrl = `https://www.figma.com/oauth?client_id=${FIGMA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=files:write&state=${crypto.randomUUID()}&response_type=code`;
  
  return NextResponse.redirect(authUrl);
}
```

```typescript
// app/api/auth/figma/callback/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.figma.com/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code!,
      grant_type: 'authorization_code'
    })
  });

  const { access_token } = await tokenResponse.json();

  // Store token in database (user-specific)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase
    .from('user_integrations')
    .upsert({
      user_id: user!.id,
      platform: 'figma',
      access_token: access_token,
      updated_at: new Date().toISOString()
    });

  return NextResponse.redirect('/app?figma=connected');
}
```

#### Step 2: Figma File Generation

```typescript
// lib/figma-generator.ts

export async function createFigmaFile(
  accessToken: string,
  designAssets: any,
  flowTitle: string
) {
  // 1. Create a new file
  const createFileResponse = await fetch('https://api.figma.com/v1/files', {
    method: 'POST',
    headers: {
      'X-Figma-Token': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `${flowTitle} - Brand System`
    })
  });

  const { key: fileKey } = await createFileResponse.json();

  // 2. Create color styles
  await createColorStyles(accessToken, fileKey, designAssets.brand_guide.colors);

  // 3. Create text styles
  await createTextStyles(accessToken, fileKey, designAssets.brand_guide.typography);

  // 4. Create component library
  await createComponents(accessToken, fileKey, designAssets.style_guide);

  // 5. Create persona frames
  await createPersonaFrames(accessToken, fileKey, designAssets);

  return {
    fileKey,
    url: `https://www.figma.com/file/${fileKey}`
  };
}

async function createColorStyles(token: string, fileKey: string, colors: any) {
  const styles = Object.entries(colors).flatMap(([category, shades]: [string, any]) =>
    Object.entries(shades).map(([shade, value]) => ({
      name: `${category}/${shade}`,
      styleType: 'FILL',
      fills: [{
        type: 'SOLID',
        color: hexToRgb(value as string)
      }]
    }))
  );

  // Batch create styles using Figma REST API
  for (const style of styles) {
    await fetch(`https://api.figma.com/v1/files/${fileKey}/styles`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(style)
    });
  }
}

// Similar functions for text styles, components, and frames...
```

#### Step 3: Create Export UI

```typescript
// components/FigmaExport.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';

export function FigmaExport({ flowId, icpId }: { flowId: string; icpId: string }) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);

    // Check if Figma is connected
    const checkResponse = await fetch('/api/integrations/figma/check');
    const { connected } = await checkResponse.json();

    if (!connected) {
      // Redirect to OAuth
      window.location.href = '/api/auth/figma';
      return;
    }

    // Generate Figma file
    const response = await fetch('/api/export/figma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, icpId })
    });

    const { fileUrl: url } = await response.json();
    setFileUrl(url);
    setLoading(false);

    // Open in new tab
    window.open(url, '_blank');
  };

  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Figma file...
        </>
      ) : fileUrl ? (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Figma
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Export to Figma
        </>
      )}
    </Button>
  );
}
```

---

## Testing Checklist

### Design Tokens Export
- [ ] Tailwind config generates valid JSON
- [ ] CSS variables use correct naming convention
- [ ] shadcn theme includes both light/dark modes
- [ ] Figma tokens follow W3C spec
- [ ] Copy-to-clipboard works in all browsers
- [ ] Download creates proper file format

### AI Prompt Generator
- [ ] v0 prompt includes all design system details
- [ ] Cursor prompt is code-focused
- [ ] Lovable prompt is conversational
- [ ] Prompts generate usable landing pages (test with actual tools)
- [ ] Copy functionality works
- [ ] Modal UI is responsive

### Figma Integration
- [ ] OAuth flow completes successfully
- [ ] Access tokens are stored securely
- [ ] File creation succeeds
- [ ] Color styles match design system
- [ ] Text styles are properly named
- [ ] Components are reusable
- [ ] Frames are properly structured
- [ ] Error handling for rate limits
- [ ] Loading states are clear

---

## Deployment Notes

### Environment Variables

```env
# Figma OAuth
FIGMA_CLIENT_ID=your_figma_client_id
FIGMA_CLIENT_SECRET=your_figma_client_secret

# Add to existing .env.local
```

### Database Migration

```sql
-- Create user_integrations table for Figma OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations"
  ON public.user_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Success Metrics to Track

### Week 1
- [ ] 50%+ users click "Export Design Tokens"
- [ ] 30%+ users copy at least one format
- [ ] 20%+ users generate AI prompts
- [ ] 10%+ users report successful implementation

### Week 2-3
- [ ] 40%+ users connect Figma
- [ ] 25%+ users export to Figma
- [ ] 15%+ users open generated Figma file
- [ ] User feedback: "saved X hours"

### Week 4
- [ ] 5+ user testimonials mentioning implementation
- [ ] NPS score increase
- [ ] Conversion rate to paid tier increase
- [ ] Feature adoption dashboard shows growth

---

This implementation guide should be executed alongside STRATEGIC_ANALYSIS.md recommendations. Prioritize Quick Wins (Week 1) to validate demand before investing in Figma integration (Week 2-3).
