# EnhancedPersonaShowcase Component

## Overview

The `EnhancedPersonaShowcase` is a production-ready, interactive persona display component featuring personality sliders, motivation adjustments, behavioral insights, and a comprehensive insights grid. It's designed as the core component for the redesigned pivot.

## Structure

### Three-Layer Architecture

1. **Hero Card** (Always Visible)
   - Clean, minimal design
   - Avatar with status indicator
   - Name, role, company, tagline
   - Expandable toggle button

2. **Expandable Details** (Click "Show More")
   - **Personality Profile**: Interactive sliders (0-100) for personality traits
   - **Primary Motivations**: Weight adjustments with visual bars (%)
   - **Behavioral Patterns**: Organized by Research, Decision-Making, Communication
   - **Demographics**: Grid of demographic information
   - **Regenerate Button**: Re-run AI with updated personality/motivation values

3. **Insights Grid** (Always Visible)
   - 4-column responsive layout:
     - Pain Points (Red theme)
     - Growth Opportunities (Green theme)
     - Value Proposition (Purple theme)
     - Content Suggestions (Amber theme)
   - Each card has:
     - Priority badges (high/medium/low)
     - Expandable items (show more/less)
     - Copy to clipboard on hover

## TypeScript Interface

```typescript
type EnhancedPersona = {
  id: string;
  name: string;
  role: string;
  company: string;
  tagline: string;
  avatar?: string;
  
  // Personality & Psychology
  personalityTraits: PersonalityTrait[];
  motivations: Motivation[];
  behaviors: Behavior[];
  demographics: Demographic[];
  
  // Insights Grid
  painPoints: InsightItem[];
  growthOpportunities: InsightItem[];
  valueProp: InsightItem[];
  contentSuggestions: InsightItem[];
};

type PersonalityTrait = {
  id: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100
  description: string;
};

type Motivation = {
  id: string;
  label: string;
  weight: number; // 0-100 (percentage)
  description: string;
};
```

## Usage

### Basic Usage

```tsx
import { EnhancedPersonaShowcase } from "@/components/EnhancedPersonaShowcase";

export default function MyPage() {
  return (
    <EnhancedPersonaShowcase
      persona={myPersonaData}
      onPersonalityChange={(traitId, value) => {
        console.log(`Trait ${traitId} changed to ${value}`);
      }}
      onMotivationChange={(motivationId, weight) => {
        console.log(`Motivation ${motivationId} weight: ${weight}%`);
      }}
      onRegenerate={async (persona) => {
        // Call your API to regenerate insights based on updated persona
        const updatedInsights = await regenerateInsights(persona);
        // Update your state
      }}
    />
  );
}
```

### Read-Only Mode

```tsx
<EnhancedPersonaShowcase
  persona={myPersonaData}
  readOnly={true}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `persona` | `EnhancedPersona` | No* | Persona data (defaults to mock accounting firm owner) |
| `onPersonalityChange` | `(traitId: string, value: number) => void` | No | Callback when personality slider changes |
| `onMotivationChange` | `(motivationId: string, weight: number) => void` | No | Callback when motivation weight changes |
| `onRegenerate` | `(persona: EnhancedPersona) => Promise<void>` | No | Callback to regenerate insights with updated values |
| `readOnly` | `boolean` | No | Disable all interactions (default: false) |

*Defaults to mock data if not provided

## Features

### Interactive Elements

- ✅ **Personality Sliders**: Drag 0-100 on each personality scale
- ✅ **Motivation Bars**: Adjust weight percentage with sliders
- ✅ **Copy to Clipboard**: Hover over any insight to copy
- ✅ **Expandable Sections**: Show more/less for long lists
- ✅ **Regenerate Button**: Re-run AI with new personality/motivation settings

### Visual Design

- ✅ **Gradient Backgrounds**: Purple-pink theme
- ✅ **Priority Badges**: Visual indicators (high/medium/low)
- ✅ **Color-Coded Cards**: Red, Green, Purple, Amber themes
- ✅ **Responsive Layout**: Mobile-first design
- ✅ **Smooth Animations**: Transitions and hover effects
- ✅ **Dark Mode Support**: Full theme compatibility

### Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader labels
- ✅ Focus indicators
- ✅ Disabled state handling

## Mock Data

The component includes complete mock data for an **Accounting Firm Owner** persona (Sarah Chen) with:

- 4 personality traits (Risk Tolerance, Decision Speed, Tech Adoption, Collaboration)
- 4 primary motivations (Efficiency 40%, Growth 30%, Quality 20%, Compliance 10%)
- 6 behavioral patterns across 3 categories
- 6 demographic fields
- 4 pain points, 4 growth opportunities, 3 value props, 4 content suggestions

## Demo

Visit `/demo-enhanced-persona` to see the component in action.

## Integration Points

### API Integration Example

```tsx
const handleRegenerate = async (persona: EnhancedPersona) => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/regenerate-persona-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: persona.id,
        personalityTraits: persona.personalityTraits,
        motivations: persona.motivations,
      }),
    });
    
    const updatedInsights = await response.json();
    
    // Update persona with new insights
    setPersona({
      ...persona,
      painPoints: updatedInsights.painPoints,
      growthOpportunities: updatedInsights.growthOpportunities,
      valueProp: updatedInsights.valueProp,
      contentSuggestions: updatedInsights.contentSuggestions,
    });
  } catch (error) {
    console.error('Regeneration failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Styling

Uses Tailwind CSS with shadcn/ui components:
- `Card`, `Badge`, `Button` from shadcn/ui
- `Slider` component (Radix UI)
- Custom gradient themes
- Responsive breakpoints (sm, md, lg)

## Dependencies

- `@radix-ui/react-slider`: Interactive slider component
- `lucide-react`: Icons
- `tailwindcss`: Styling
- `shadcn/ui`: Base components

## Notes

- The component is fully self-contained with mock data
- All interactions are optional (callbacks)
- Personality and motivation changes update local state immediately
- The "Regenerate" button shows loading state during API calls
- Copy functionality uses the Clipboard API
- Expandable sections maintain independent state

## Future Enhancements

- [ ] Export persona as PDF/image
- [ ] Compare multiple personas side-by-side
- [ ] Historical tracking of personality adjustments
- [ ] AI-suggested optimal personality configurations
- [ ] Webhook integrations for real-time updates

