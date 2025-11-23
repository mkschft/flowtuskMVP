// TypeScript types for positioning_value_props and positioning_design_assets tables

export interface ValuePropSummary {
  mainInsight?: string;
  painPointsAddressed?: string[];
  approachStrategy?: string;
  expectedImpact?: string;
}

export interface ValuePropVariable {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  selectedValue: string;
  placeholder?: string;
}

export interface ValuePropVariation {
  id: string;
  style: string;
  text: string;
  useCase?: string;
  emoji?: string;
  sourceFactIds?: string[];
}

export interface ValuePropGenerationMetadata {
  model?: string;
  prompt_version?: string;
  timestamp?: string;
  regeneration_count?: number;
  cost_estimate?: number;
}

export interface PositioningValueProp {
  id: string;
  icp_id: string;
  parent_flow: string;
  summary: ValuePropSummary;
  variables: ValuePropVariable[];
  variations: ValuePropVariation[];
  generation_metadata: ValuePropGenerationMetadata;
  created_at: string;
  updated_at: string;
}

// Brand Guide Types
export interface ColorScheme {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

export interface Typography {
  category: "heading" | "body" | "code";
  fontFamily: string;
  sizes: { name: string; size: string; weight: string }[] | Record<string, string>;
  weights?: string[]; // Optional array of font weights (e.g., ["400", "600", "700"])
}

export interface LogoVariation {
  name: string;
  description: string;
}

export interface PersonalityTrait {
  id: string;
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}

export interface BrandGuide {
  colors: {
    primary: ColorScheme[];
    secondary: ColorScheme[];
    accent: ColorScheme[];
    neutral: ColorScheme[];
  };
  typography: Typography[];
  logoVariations: LogoVariation[];
  toneOfVoice: string[];
  personalityTraits: PersonalityTrait[];
}

// Style Guide Types
export interface StyleComponent {
  variant: string;
  description: string;
}

export interface SpacingValue {
  name: string;
  value: string;
}

export interface StyleGuide {
  buttons: StyleComponent[];
  cards: StyleComponent[];
  formElements: { element: string; description: string }[];
  spacing: SpacingValue[];
  borderRadius: SpacingValue[];
  shadows: SpacingValue[];
}

// Landing Page Types
export interface LandingNavigation {
  logo: string;
  links: string[];
}

export interface LandingHero {
  headline: string;
  subheadline: string;
  cta: { primary: string; secondary: string };
}

export interface LandingFeature {
  title: string;
  description: string;
  icon: string;
}

export interface LandingSocialProof {
  type: string;
  content: string;
}

export interface LandingPricing {
  tier: string;
  price: string;
  features: string[];
}

export interface LandingFooter {
  sections: { title: string; links: string[] }[];
}

export interface LandingPage {
  navigation: LandingNavigation;
  hero: LandingHero;
  features: LandingFeature[];
  socialProof: LandingSocialProof[];
  pricing?: LandingPricing[];
  footer: LandingFooter;
}

// Generation State
export interface DesignGenerationState {
  brand: boolean;
  style: boolean;
  landing: boolean;
}

export interface DesignGenerationMetadata {
  models?: Record<string, string>;
  prompt_versions?: Record<string, string>;
  timestamps?: Record<string, string>;
  costs?: Record<string, number>;
  chat_updates_count?: number;
}

export interface PositioningDesignAssets {
  id: string;
  icp_id: string;
  parent_flow: string;
  brand_guide: BrandGuide | null;
  style_guide: StyleGuide | null;
  landing_page: LandingPage | null;
  generation_state: DesignGenerationState;
  generation_metadata: DesignGenerationMetadata;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface GenerateDesignAssetRequest {
  icpId: string;
  flowId: string;
  tab: 'brand' | 'style' | 'landing';
}

export interface UpdateDesignAssetRequest {
  designAssetId: string;
  updates: {
    brandGuide?: Partial<BrandGuide>;
    styleGuide?: Partial<StyleGuide>;
    landingPage?: Partial<LandingPage>;
  };
}

// Copilot workspace data structure
export interface CopilotWorkspaceData {
  persona: {
    id: string;
    persona_name: string;
    persona_role: string;
    persona_company: string;
    location: string;
    country: string;
    title: string;
    description: string;
    pain_points: string[];
    goals: string[];
  };
  valueProp: PositioningValueProp | null;
  designAssets: PositioningDesignAssets | null;
}

