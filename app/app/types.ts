/**
 * Type definitions for the app workspace
 */

export type ICP = {
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

export type LinkedInPost = {
  id: string;
  content: string;
  timestamp: string;
  engagement: number;
};

export type LinkedInProfile = {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  photoUrl: string;
  matchScore: number;
  matchReasons: string[];
  recentPosts: LinkedInPost[];
  experience: {
    title: string;
    company: string;
    duration: string;
  }[];
};

export type ThinkingStep = {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  duration?: number;
  substeps?: string[];
};

export type ValuePropVariable = {
  key: string;
  label: string;
  type: 'dropdown' | 'input';
  options?: string[];
  selectedValue: string;
  placeholder?: string;
};

export type ValuePropVariation = {
  id: string;
  style: string;
  text: string;
  useCase: string;
  emoji: string;
};

export type ValuePropData = {
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

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  component?: "icps" | "value-prop" | "persona-showcase" | "export-options" | "value-prop-summary" | "positioning-summary" | "landing-preview";
  data?: ICP[] | ValuePropData | Record<string, unknown>;
  thinking?: ThinkingStep[];
};

export type GenerationStep = 'analysis' | 'icp-selection' | 'value-prop' | 'one-time-email' | 'email-sequence' | 'linkedin-outreach' | 'export' | 'complete';

export type GeneratedContent = {
  icps?: ICP[];
  valueProp?: ValuePropData;
  funnelSummary?: Record<string, unknown>;
};

export type GenerationState = {
  currentStep: GenerationStep;
  completedSteps: string[];
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  generationId?: string;
  lastGenerationTime?: Date;
};

export type UserJourney = {
  websiteAnalyzed: boolean;
  icpSelected: boolean;
  valuePropGenerated: boolean;
  exported: boolean;
};

export type ConversationMemory = {
  id: string;
  websiteUrl: string;
  websiteContent?: string; // Raw content fallback
  factsJson?: Record<string, unknown>; // NEW: Structured facts for evidence-based generation
  selectedIcp: ICP | null;
  generationHistory: Array<{
    timestamp: Date;
    action: string;
    result: Record<string, unknown>;
    success: boolean;
  }>;
  userPreferences: {
    preferredContentType: string;
    lastAction: string;
  };
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  generationState: GenerationState;
  userJourney: UserJourney;
  memory: ConversationMemory;
};
