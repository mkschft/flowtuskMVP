# CompactPersonaCard Component

## Overview

The `CompactPersonaCard` is a visually stunning, compact summary card that displays ICP (Ideal Customer Profile) data at-a-glance. It features animated glowing borders, segment match scores, and expandable detailed insights. This component is designed to be shown **after** the 3 persona cards are created, condensing the entire conversation/flow into one polished asset.

## Visual Features

### 🌟 Glowing Border Effect
- Multi-layer animated gradient border (pink → purple → pink)
- Strong pulsing glow effect with multiple blur layers
- Light pink/purple gradient background matching PersonaShowcase
- Matches fonts and colors from main persona cards
- Works beautifully in both light and dark mode

### 📊 Compact At-a-Glance View
- **Title & Subtitle**: Clear ICP identification
- **3 Segment Cards**: Match scores with animated progress bars
- **ICP Score**: Prominent percentage display
- **Action Buttons**: Copy & Expand details

### 📖 Expandable Details (Hidden by Default)
All details are collapsed by default for maximum compactness:
- **Key Insights Grid**: 4 categories (Pain Points, Growth Opportunities, Value Props, Content)
- **Behavioral Patterns**: 3-column layout (Research, Decision Making, Communication)
- **Demographics**: Compact grid of demographic data

## TypeScript Interface

```typescript
type CompactPersonaSummary = {
  title: string;
  subtitle: string;
  icpScore: number;
  segments: PersonaSegment[];
  keyInsights: CompactInsight[];
  behaviors: {
    research: string[];
    decisionMaking: string[];
    communication: string[];
  };
  demographics: { label: string; value: string }[];
};

type PersonaSegment = {
  label: string;
  matchScore: number; // 0-100
};

type CompactInsight = {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: "red" | "green" | "purple" | "amber";
};
```

## Usage

### Basic Usage (with mock data)

```tsx
import { CompactPersonaCard } from "@/components/CompactPersonaCard";

export default function MyPage() {
  return <CompactPersonaCard />;
}
```

### With Custom Data

```tsx
import { CompactPersonaCard } from "@/components/CompactPersonaCard";

const mySummary = {
  title: "Ideal Customer Profile",
  subtitle: "SaaS Founders",
  icpScore: 88,
  segments: [
    { label: "B2B SaaS", matchScore: 88 },
    { label: "Marketplaces", matchScore: 72 },
    { label: "E-commerce", matchScore: 56 },
  ],
  // ... rest of the data
};

export default function MyPage() {
  return <CompactPersonaCard summary={mySummary} />;
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `summary` | `CompactPersonaSummary` | No | Mock data | ICP summary data to display |

## Mock Data

Includes complete mock data for **Mid-Sized Accounting Firm Owners**:
- ICP Score: 92%
- 3 segments with match scores (92%, 68%, 45%)
- 4 key insight categories with 3 items each
- 6 behavioral patterns across 3 categories
- 4 demographic fields

## Interactive Features

### Copy Functionality
- Click "Copy" button to copy title, subtitle, and ICP score
- Shows "Copied" confirmation for 2 seconds
- Uses Clipboard API

### Expandable Details
- Click "Expand Details" to reveal full insights
- Smooth slide-in animation
- Toggle button rotates on expand/collapse
- All details hidden by default for maximum compactness

### Segment Progress Bars
- Animated width transition
- Gradient fill (purple to pink)
- Updates on data change

## Design Specifications

### Color Scheme
- **Border Glow**: Pink → Purple → Pink gradient with multiple blur layers
- **Background**: Light pink/purple gradient (`from-pink-50 via-purple-50 to-pink-50`)
- **Segment Cards**: Semi-transparent white with purple borders and shadow
- **Text**: 
  - Headers: `text-foreground` (matches system theme)
  - Scores: Gradient text (`from-purple-600 to-pink-600`)
  - Body: `text-muted-foreground`
- **Buttons**: Purple borders with purple hover states
- Matches color palette from PersonaShowcase component

### Animations
- Border glow pulse effect
- Progress bar width transitions (500ms)
- Expand/collapse slide-in animation (300ms)
- Button hover effects

### Responsive Breakpoints
- **Mobile**: Stacked layout
- **Tablet (md)**: 2-column insights grid
- **Desktop**: 3-column behavioral patterns

## Integration Example

```tsx
// After generating 3 persona cards in your flow:
const [showSummary, setShowSummary] = useState(false);
const [icpSummary, setIcpSummary] = useState(null);

// After persona generation completes:
useEffect(() => {
  if (personasGenerated.length === 3) {
    const summary = generateSummaryFromPersonas(personasGenerated);
    setIcpSummary(summary);
    setShowSummary(true);
  }
}, [personasGenerated]);

return (
  <>
    {/* Your 3 persona cards */}
    <PersonaCard persona={persona1} />
    <PersonaCard persona={persona2} />
    <PersonaCard persona={persona3} />
    
    {/* Compact summary appears after */}
    {showSummary && <CompactPersonaCard summary={icpSummary} />}
  </>
);
```

## Behavioral Patterns Section

The behavioral patterns section is organized into 3 categories:

1. **Research**: How the persona discovers solutions
2. **Decision Making**: How they evaluate and choose
3. **Communication**: Preferred communication styles

Each behavior is displayed in a small card with muted background for easy scanning.

## Key Insights Grid

Four categories with color-coding:
- **Pain Points** (Red): Current challenges
- **Growth Opportunities** (Green): Potential for improvement
- **Value Props** (Purple): Key selling points
- **Content Suggestions** (Amber): Recommended content to create

## Styling

Uses Tailwind CSS with:
- Custom gradient backgrounds
- Backdrop blur effects
- Border animations
- Responsive grid layouts
- Dark mode support

## Dependencies

- `lucide-react`: Icons
- `tailwindcss`: Styling
- `shadcn/ui`: Card, Button components
- `@/lib/utils`: cn() utility

## Demo

Visit `/demo-compact-persona` to see the component in action with full mock data.

## Notes

- Designed to be shown **after** the main persona cards
- All details are collapsed by default for compactness
- The glowing border effect uses multiple layers with blur and pulse
- Works seamlessly in both light and dark modes
- Fully responsive with mobile-first approach
- Copy functionality uses the modern Clipboard API (requires HTTPS in production)

## Future Enhancements

- [ ] Export as image/PDF
- [ ] Share to social media
- [ ] Print-friendly version
- [ ] Animated score counter on mount
- [ ] Comparison mode for multiple ICPs
- [ ] Custom color themes

