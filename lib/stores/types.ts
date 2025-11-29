/**
 * Shared types for Zustand stores
 * Centralized to avoid duplication and maintain consistency
 */

// ICP Types
export interface ICP {
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
}

// Value Prop Types
export interface ValuePropVariable {
  key: string;
  label: string;
  type: 'dropdown' | 'input';
  options?: string[];
  selectedValue: string;
  placeholder?: string;
}

export interface ValuePropVariation {
  id: string;
  style: string;
  text: string;
  useCase: string;
  emoji: string;
}

export interface ValuePropData {
  variables: ValuePropVariable[];
  variations: ValuePropVariation[];
  icp: ICP;
  summary?: {
    approachStrategy: string;
    expectedImpact: string;
    mainInsight: string;
    painPointsAddressed: string[];
  };
}

// Email Types
export interface EmailMessage {
  id: string;
  step: number;
  type: 'intro' | 'value' | 'social-proof' | 'urgency' | 'breakup' | 'nurture' | 'final-ask';
  dayNumber: number;
  subjectLines: string[];
  body: string;
  cta: string;
  openRateBenchmark: string;
  replyRateBenchmark: string;
  tips: string[];
}

export interface EmailSequenceData {
  emails: EmailMessage[];
  sequenceGoal: string;
  bestPractices: string[];
  expectedOutcome: string;
  summary?: {
    sequenceGoal: string;
    timeline: string;
    expectedResults: string;
  };
}

export interface OneTimeEmailData {
  subjectLines: {
    A: string;
    B: string;
    C: string;
  };
  emailBody: string;
  cta: string;
  benchmarks: {
    openRate: string;
    replyRate: string;
    conversionRate: string;
  };
  tips: string[];
}

// LinkedIn Types
export interface LinkedInMessage {
  id: string;
  step: number;
  type: 'connection' | 'follow-up-1' | 'follow-up-2';
  title: string;
  timing: string;
  characterCount: number;
  message: string;
  personalizationTips: string[];
  expectedResponse: string;
}

export interface LinkedInOutreachData {
  overallStrategy: string;
  messages: LinkedInMessage[];
  keyTakeaways: string[];
}

// Thinking Steps
export interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  duration?: number;
  substeps?: string[];
}

// Chat Message Types
export type ChatComponent = 
  | "icps" 
  | "value-prop" 
  | "persona-showcase" 
  | "export-options" 
  | "value-prop-summary" 
  | "positioning-summary" 
  | "landing-preview" 
  | "email-strategy-summary" 
  | "email-type-choice" 
  | "sequence-length-choice" 
  | "email-sequence" 
  | "one-time-email" 
  | "linkedin-outreach" 
  | "email-sequence-summary" 
  | "outreach-choice" 
  | "linkedin-type-choice";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  component?: ChatComponent;
  data?: ICP[] | ValuePropData | Record<string, unknown>;
  thinking?: ThinkingStep[];
}

// Generation State Types
export type GenerationStep = 
  | 'analysis' 
  | 'icp-selection' 
  | 'value-prop' 
  | 'one-time-email' 
  | 'email-sequence' 
  | 'linkedin-outreach' 
  | 'export' 
  | 'complete';

export interface GeneratedContent {
  icps?: ICP[];
  valueProp?: ValuePropData;
  funnelSummary?: Record<string, unknown>;
  emailSequence?: EmailSequenceData;
  oneTimeEmail?: OneTimeEmailData;
  linkedinOutreach?: LinkedInOutreachData;
}

export interface GenerationState {
  currentStep: GenerationStep;
  completedSteps: string[];
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  generationId?: string;
  lastGenerationTime?: Date;
}

// User Journey Types
export interface UserJourney {
  websiteAnalyzed: boolean;
  icpSelected: boolean;
  valuePropGenerated: boolean;
  exported: boolean;
}

// Conversation Memory Types
export interface ConversationMemory {
  id: string;
  websiteUrl: string;
  websiteContent?: string;
  factsJson?: Record<string, unknown>;
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
}

// Conversation (Flow) Types
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  generationState: GenerationState;
  userJourney: UserJourney;
  memory: ConversationMemory;
}

// Copilot-specific types
export type CopilotTab = "strategy" | "identity" | "components" | "previews";

export interface CopilotChatMessage {
  role: "user" | "ai";
  content: string;
}
