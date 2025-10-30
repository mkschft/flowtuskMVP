"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUp, Plus, MessageSquare, Sparkles, Search, Brain, Wand2, ChevronDown, Check, Users, MapPin, CheckCircle2, Menu } from "lucide-react";
import { LinkedInProfileDrawer } from "@/components/LinkedInProfileDrawer";
import { ValuePropBuilderWrapper } from "@/components/ValuePropBuilderWrapper";
import { PersonaShowcase } from "@/components/PersonaShowcase";
import { type ExportFormat } from "@/components/ExportOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SystemMessage } from "@/components/ui/system-message";
import { SummaryApprovalCard } from "@/components/SummaryApprovalCard";
import { OutreachChoice } from "@/components/OutreachChoice";
import { LinkedInTypeChoice } from "@/components/LinkedInTypeChoice";
import { EmailTypeChoice } from "@/components/EmailTypeChoice";
import { SequenceLengthChoice } from "@/components/SequenceLengthChoice";
import { EmailSequenceCard } from "@/components/EmailSequenceCard";
import { OneTimeEmailCard } from "@/components/OneTimeEmailCard";
import { LinkedInOutreachCard } from "@/components/LinkedInOutreachCard";
import { LinkedInSingleContentCard } from "@/components/LinkedInSingleContentCard";
import { nanoid } from "nanoid";

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

type LinkedInPost = {
  id: string;
  content: string;
  timestamp: string;
  engagement: number;
};

type LinkedInProfile = {
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

type ThinkingStep = {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  duration?: number;
  substeps?: string[];
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
  summary?: {
    approachStrategy: string;
    expectedImpact: string;
    mainInsight: string;
    painPointsAddressed: string[];
  };
};

type EmailMessage = {
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
};

type EmailSequenceData = {
  emails: EmailMessage[];
  sequenceGoal: string;
  bestPractices: string[];
  expectedOutcome: string;
  summary?: {
    sequenceGoal: string;
    timeline: string;
    expectedResults: string;
  };
};

type OneTimeEmailData = {
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
};

type LinkedInMessage = {
  id: string;
  step: number;
  type: 'connection' | 'follow-up-1' | 'follow-up-2';
  title: string;
  timing: string;
  characterCount: number;
  message: string;
  personalizationTips: string[];
  expectedResponse: string;
};

type LinkedInOutreachData = {
  overallStrategy: string;
  messages: LinkedInMessage[];
  keyTakeaways: string[];
};


type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  component?: "icps" | "value-prop" | "persona-showcase" | "export-options" | "value-prop-summary" | "positioning-summary" | "landing-preview" | "email-strategy-summary" | "email-type-choice" | "sequence-length-choice" | "email-sequence" | "one-time-email" | "linkedin-outreach" | "email-sequence-summary" | "outreach-choice" | "linkedin-type-choice";
  data?: ICP[] | ValuePropData | Record<string, unknown>;
  thinking?: ThinkingStep[];
};

// Enhanced Generation State Types
type GenerationStep = 'analysis' | 'icp-selection' | 'value-prop' | 'one-time-email' | 'email-sequence' | 'linkedin-outreach' | 'export' | 'complete';

type GeneratedContent = {
  icps?: ICP[];
  valueProp?: ValuePropData;
  funnelSummary?: Record<string, unknown>;
  emailSequence?: EmailSequenceData;
  oneTimeEmail?: OneTimeEmailData;
  linkedinOutreach?: LinkedInOutreachData;
};

type GenerationState = {
  currentStep: GenerationStep;
  completedSteps: string[];
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  generationId?: string;
  lastGenerationTime?: Date;
};

type UserJourney = {
  websiteAnalyzed: boolean;
  icpSelected: boolean;
  valuePropGenerated: boolean;
  exported: boolean;
};

type ConversationMemory = {
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

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  // Enhanced state management
  generationState: GenerationState;
  userJourney: UserJourney;
  memory: ConversationMemory;
};

// Generation Manager Class
class GenerationManager {
  private cache: Map<string, unknown> = new Map();
  private pendingGenerations: Map<string, Promise<unknown>> = new Map();
  private completedGenerations: Set<string> = new Set();

  createKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  async generate<T>(
    type: string,
    params: Record<string, unknown>,
    generator: () => Promise<T>
  ): Promise<T> {
    const key = this.createKey(type, params);

    // Check cache first
    if (this.cache.has(key)) {
      console.log(`🎯 [GenerationManager] Cache hit for ${type}`);
      return this.cache.get(key) as T;
    }

    // Check if already generating
    if (this.pendingGenerations.has(key)) {
      console.log(`⏳ [GenerationManager] Waiting for existing generation: ${type}`);
      return this.pendingGenerations.get(key) as Promise<T>;
    }

    // Check if already completed
    if (this.completedGenerations.has(key)) {
      console.log(`✅ [GenerationManager] Already completed: ${type}`);
      return this.cache.get(key) as T;
    }

    // Start generation
    console.log(`🚀 [GenerationManager] Starting generation: ${type}`);
    const promise = this.executeGeneration(key, generator);
    this.pendingGenerations.set(key, promise);

    try {
      const result = await promise;
      this.cache.set(key, result);
      this.completedGenerations.add(key);
      return result;
    } finally {
      this.pendingGenerations.delete(key);
    }
  }

  private async executeGeneration<T>(key: string, generator: () => Promise<T>): Promise<T> {
    try {
      return await generator();
    } catch (error) {
      console.error(`❌ [GenerationManager] Generation failed for ${key}:`, error);
      throw error;
    }
  }

  isGenerating(type: string, params: Record<string, unknown>): boolean {
    const key = this.createKey(type, params);
    return this.pendingGenerations.has(key);
  }

  isCompleted(type: string, params: Record<string, unknown>): boolean {
    const key = this.createKey(type, params);
    return this.completedGenerations.has(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingGenerations.clear();
    this.completedGenerations.clear();
  }
}

// Enhanced Memory Manager Class with Persistence
class MemoryManager {
  private memories: Map<string, ConversationMemory> = new Map();
  private readonly STORAGE_KEY = 'flowtusk_conversation_memories';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, memory]) => {
          this.memories.set(id, memory as ConversationMemory);
        });
        console.log('📚 [MemoryManager] Loaded memories from storage');
      }
    } catch (error) {
      console.error('❌ [MemoryManager] Failed to load memories:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const data = Object.fromEntries(this.memories);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('💾 [MemoryManager] Saved memories to storage');
    } catch (error) {
      console.error('❌ [MemoryManager] Failed to save memories:', error);
    }
  }

  getMemory(conversationId: string): ConversationMemory | null {
    return this.memories.get(conversationId) || null;
  }

  updateMemory(conversationId: string, updates: Partial<ConversationMemory>): void {
    const current = this.getMemory(conversationId);
    if (current) {
      const updated = { ...current, ...updates };
      this.memories.set(conversationId, updated);
      this.saveToStorage();
    }
  }

  addGenerationRecord(conversationId: string, action: string, result: Record<string, unknown>, success: boolean = true): void {
    const memory = this.getMemory(conversationId);
    if (memory) {
      memory.generationHistory.push({
        timestamp: new Date(),
        action,
        result,
        success
      });
      this.saveToStorage();
    }
  }

  getLastAction(conversationId: string): string | null {
    const memory = this.getMemory(conversationId);
    return memory?.userPreferences.lastAction || null;
  }

  setLastAction(conversationId: string, action: string): void {
    const memory = this.getMemory(conversationId);
    if (memory) {
      memory.userPreferences.lastAction = action;
      this.saveToStorage();
    }
  }

  getGenerationHistory(conversationId: string): Array<{
    timestamp: Date;
    action: string;
    result: Record<string, unknown>;
    success: boolean;
  }> {
    const memory = this.getMemory(conversationId);
    return memory?.generationHistory || [];
  }

  getCompletedActions(conversationId: string): string[] {
    const history = this.getGenerationHistory(conversationId);
    return history
      .filter(record => record.success)
      .map(record => record.action);
  }

  canPerformAction(conversationId: string, action: string): boolean {
    // Define action dependencies (using actual recorded action names)
    const dependencies: Record<string, string[]> = {
      'select-icp': [], // No prerequisite - ICPs can be selected when shown
      'value-prop': ['select-icp'],
      'funnel': ['value-prop'],
      'make-content-choice': ['funnel'],
      'email': ['make-content-choice'],
      'linkedin': ['make-content-choice'],
      'show-email-choice': ['approve-positioning-summary'], // Email flow starts after positioning
      'choose-email-type': ['show-email-choice'],
      'generate-one-time-email': ['choose-email-type'],
      'generate-email-sequence': ['choose-email-type'],
      'generate-linkedin-outreach': ['choose-email-type'],
    };

    const required = dependencies[action] || [];

    // If no prerequisites required, allow the action immediately
    // This prevents blocking actions like 'select-icp' when memory hasn't been initialized yet
    if (required.length === 0) {
      return true;
    }

    // For actions with prerequisites, check memory and completed actions
    const memory = this.getMemory(conversationId);
    if (!memory) return false;

    const completed = this.getCompletedActions(conversationId);
    return required.every(dep => completed.includes(dep));
  }

  clearMemory(conversationId: string): void {
    this.memories.delete(conversationId);
    this.saveToStorage();
  }

  exportMemory(conversationId: string): string {
    const memory = this.getMemory(conversationId);
    return JSON.stringify(memory, null, 2);
  }
}

// Initialize managers
const generationManager = new GenerationManager();
const memoryManager = new MemoryManager();

// Smart Button Component with State Management
interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: string;
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  loadingText?: string;
  conversationId?: string;
}

// Memory Status Indicator Component
const MemoryStatusIndicator: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const memory = memoryManager.getMemory(conversationId);
  const completedActions = memoryManager.getCompletedActions(conversationId);
  
  if (!memory || completedActions.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Memory Active</span>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        <div>Completed: {completedActions.length} actions</div>
        <div>Last: {memory.userPreferences.lastAction || 'None'}</div>
      </div>
    </div>
  );
};

export const SmartButton: React.FC<SmartButtonProps> = ({ 
  action, 
  onClick, 
  children, 
  disabled: propDisabled,
  loadingText = "Generating...",
  conversationId,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const isActionDisabled = (action: string): boolean => {
    if (!conversationId) return false;
    
    // Check if generation is in progress
    if (generationManager.isGenerating(action, {})) {
      return true;
    }
    
    // Check if already completed (for certain actions)
    if (['value-prop', 'email', 'linkedin', 'landing'].includes(action)) {
      return generationManager.isCompleted(action, {});
    }
    
    return false;
  };

  // Move isDisabled calculation up before handleClick
  const isDisabled = propDisabled || isActionDisabled(action) || isLoading;

  const handleClick = async () => {
    if (isActionDisabled(action) || isLoading || propDisabled) return;
    
    setIsLoading(true);
    
    try {
      await onClick();
    } catch (error) {
      console.error(`SmartButton error for ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={`${props.className || ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

// Thinking Block Component
function ThinkingBlock({ thinking }: { thinking: ThinkingStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const totalTime = thinking.reduce((sum, s) => sum + (s.duration || 0), 0);
  const allComplete = thinking.every(s => s.status === 'complete');
  const hasError = thinking.some(s => s.status === 'error');
  
  return (
    <Card className="border-l-4 border-l-purple-500">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {hasError ? (
            <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400">✗</span>
            </div>
          ) : allComplete ? (
            <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          )}
          <div className="text-left">
            <div className="text-sm font-medium">
              {hasError ? 'Error occurred' : allComplete ? 'Analysis complete' : 'Thinking...'}
            </div>
            <div className="text-xs text-muted-foreground">
              {thinking.filter(s => s.status === 'complete').length} / {thinking.length} steps
              {totalTime > 0 && ` • ${(totalTime / 1000).toFixed(1)}s`}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {thinking.map(step => (
            <div key={step.id} className="flex items-start gap-2">
              <div className="mt-1 shrink-0">
                {step.status === 'complete' && (
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {step.status === 'running' && (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                )}
                {step.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-muted-foreground/20" />
                )}
                {step.status === 'error' && (
                  <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                    <span className="text-xs text-red-600 dark:text-red-400">✗</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{step.label}</span>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(step.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                {step.substeps && step.substeps.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {step.substeps.map((substep, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1">→</span>
                        <span>{substep}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ChatPageContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null);
  const [showProfilesDrawer, setShowProfilesDrawer] = useState(false);
  const [selectedProfilesICP, setSelectedProfilesICP] = useState<ICP | null>(null);
  const [linkedInProfiles, setLinkedInProfiles] = useState<LinkedInProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('flowtusk_conversations');
    const savedActiveId = localStorage.getItem('flowtusk_active_conversation');
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        if (savedActiveId) {
          setActiveConversationId(savedActiveId);
        }
        console.log('📦 [Storage] Loaded conversations from localStorage');
      } catch (error) {
        console.error('❌ [Storage] Failed to load conversations:', error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('flowtusk_conversations', JSON.stringify(conversations));
        localStorage.setItem('flowtusk_active_conversation', activeConversationId);
        console.log('💾 [Storage] Saved conversations to localStorage');
      } catch (error) {
        console.error('❌ [Storage] Failed to save conversations:', error);
      }
    }
  }, [conversations, activeConversationId]);

  // Handle URL from landing page on mount
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && !hasProcessedUrlParam && conversations.length === 0) {
      setHasProcessedUrlParam(true);
      // Pre-fill the input with URL from landing page
      setInput(urlParam);
      // Set flag to trigger auto-submit after input state updates
      setShouldAutoSubmit(true);
    }
  }, [searchParams, hasProcessedUrlParam, conversations.length]);

  // Auto-submit after input is set from URL param
  useEffect(() => {
    if (shouldAutoSubmit && input.trim()) {
      // Reset flag to prevent duplicate submissions
      setShouldAutoSubmit(false);
      // Trigger form submission now that input state is updated
      const form = document.querySelector('form[data-chat-form]');
      if (form) {
        (form as HTMLFormElement).requestSubmit();
      }
    }
  }, [input, shouldAutoSubmit]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const createNewConversation = () => {
    const newConvId = nanoid();
    const newConv: Conversation = {
      id: newConvId,
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      generationState: {
        currentStep: 'analysis',
        completedSteps: [],
        generatedContent: {},
        isGenerating: false,
        generationId: undefined,
        lastGenerationTime: undefined,
      },
      userJourney: {
        websiteAnalyzed: false,
        icpSelected: false,
        valuePropGenerated: false,
        exported: false,
      },
      memory: {
        id: newConvId,
        websiteUrl: "",
        selectedIcp: null,
        generationHistory: [],
        userPreferences: {
          preferredContentType: "",
          lastAction: "",
        },
      },
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setSelectedIcp(null);
    setWebsiteUrl("");
    
    // Initialize memory manager
    memoryManager.updateMemory(newConvId, newConv.memory);
  };

  const addMessage = (message: ChatMessage) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  // Enhanced state management utilities
  const updateGenerationState = (updates: Partial<GenerationState>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { 
              ...conv, 
              generationState: { ...conv.generationState, ...updates },
              lastGenerationTime: new Date()
            }
          : conv
      )
    );
  };

  const updateUserJourney = (updates: Partial<UserJourney>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, userJourney: { ...conv.userJourney, ...updates } }
          : conv
      )
    );
  };

  // const updateConversationMemory = (updates: Partial<ConversationMemory>) => {
  //   setConversations(prev =>
  //     prev.map(conv =>
  //       conv.id === activeConversationId
  //         ? { ...conv, memory: { ...conv.memory, ...updates } }
  //         : conv
  //     )
  //   );
  //   // Also update memory manager
  //   memoryManager.updateMemory(activeConversationId, updates);
  // };

  const isGenerationInProgress = (type: string, params: Record<string, unknown> = {}): boolean => {
    return generationManager.isGenerating(type, params);
  };

  const isGenerationCompleted = (type: string, params: Record<string, unknown> = {}): boolean => {
    return generationManager.isCompleted(type, params);
  };

  const canPerformAction = (action: string): boolean => {
    if (!activeConversation) return false;
    
    const { generationState } = activeConversation;
    
    // Check if generation is in progress
    if (generationState.isGenerating) {
      return false;
    }
    
    // Use memory manager for dependency checking
    const memoryCanPerform = memoryManager.canPerformAction(activeConversationId, action);
    
    // Additional checks for specific actions
    switch (action) {
      case 'select-icp':
        return memoryCanPerform && !generationState.isGenerating;
      case 'generate-value-prop':
        return memoryCanPerform && !generationState.isGenerating;
      case 'generate-funnel':
        return memoryCanPerform && !generationState.isGenerating;
      case 'make-content-choice':
        return memoryCanPerform && !generationState.isGenerating;
      case 'generate-email':
        return memoryCanPerform && !generationState.isGenerating;
      case 'generate-landing':
        return memoryCanPerform && !generationState.isGenerating;
      default:
        return !generationState.isGenerating;
    }
  };


  const updateThinkingStep = (messageId: string, stepId: string, updates: Partial<ThinkingStep>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages.map(m =>
                m.id === messageId
                  ? {
                      ...m,
                      thinking: m.thinking?.map(s =>
                        s.id === stepId ? { ...s, ...updates } : s
                      ),
                    }
                  : m
              ),
            }
          : conv
      )
    );
  };

  const updateConversationTitle = (title: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId ? { ...conv, title } : conv
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Ensure we have an active conversation and get the ID
    const convId = ensureActiveConversation();
    
    // Wait a tick for state to settle if we just created a new conversation
    if (convId !== activeConversationId) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: input,
    };

    addMessage(userMessage);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Check if it's a URL - analyze website
      const urlPattern = /https?:\/\/[^\s]+/;
      if (urlPattern.test(userInput)) {
        const url = userInput.match(urlPattern)?.[0] || "";
        setWebsiteUrl(url);
        updateConversationTitle(new URL(url).hostname);

        // Create thinking message with all steps
        const thinkingMsgId = nanoid();
        addMessage({
          id: thinkingMsgId,
          role: "assistant",
          content: "thinking",
          thinking: [
            { id: 'analyze', label: 'Analyzing website', status: 'pending' },
            { id: 'extract', label: 'Extracting visuals', status: 'pending' },
            { id: 'generate', label: 'Generating customer profiles', status: 'pending' },
          ],
        });

        // Step 1: Analyze website
        const analyzeStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'analyze', { 
          status: 'running', 
          startTime: analyzeStart,
          substeps: ['Fetching website content...', 'Extracting structured facts with AI (15-30s)...']
        });

        const analyzeRes = await fetch("/api/analyze-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!analyzeRes.ok) throw new Error("Failed to analyze website");
        const { content, metadata, factsJson } = await analyzeRes.json();
        
        const analyzeSubsteps = [
          `✅ Fetched ${Math.round(content.length / 1000)}k characters`,
          `✅ Extracted ${factsJson?.facts?.length || 0} facts from website`,
          metadata?.heroImage ? '✅ Found brand visuals' : '⚠️ No brand visuals detected'
        ];
        
        updateThinkingStep(thinkingMsgId, 'analyze', { 
          status: 'complete',
          duration: Date.now() - analyzeStart,
          substeps: analyzeSubsteps
        });

        // Store factsJson and content in conversation memory for reuse
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  memory: {
                    ...conv.memory,
                    websiteContent: content,
                    factsJson: factsJson || undefined,
                  }
                }
              : conv
          )
        );

        // Step 2: Extract visuals
        const extractStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'extract', { 
          status: 'running',
          startTime: extractStart,
          substeps: ['Analyzing brand colors', 'Extracting images']
        });

        // Store metadata
        // Note: metadata saved for future use

        updateThinkingStep(thinkingMsgId, 'extract', { 
          status: 'complete',
          duration: Date.now() - extractStart,
          substeps: [
            metadata?.heroImage ? `Hero image: ${new URL(metadata.heroImage).hostname}` : 'Using gradient fallback',
            'Visual metadata ready'
          ]
        });

        // Step 3: Generate ICPs
        const icpStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'generate', { 
          status: 'running',
          startTime: icpStart,
          substeps: ['Analyzing content patterns...', 'Generating customer profiles with AI (10-20s)...']
        });

        const icpRes = await fetch("/api/generate-icps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            content, // Fallback for legacy mode
            factsJson: factsJson || undefined // NEW: Pass structured facts
          }),
        });

        if (!icpRes.ok) throw new Error("Failed to generate ICPs");
        const { icps, brandColors, summary } = await icpRes.json();
        
        // Store brand colors
        // Note: brandColors saved for future use

        updateThinkingStep(thinkingMsgId, 'generate', { 
          status: 'complete',
          duration: Date.now() - icpStart,
          substeps: [
            `✅ Generated ${icps.length} detailed customer profiles`,
            `✅ Identified ${icps.reduce((sum: number, icp: ICP) => sum + (icp.painPoints?.length || 0), 0)} total pain points`,
            '✅ Personas ready for selection'
          ]
        });

        // Build summary message
        const hostname = new URL(url).hostname.replace('www.', '');
        const businessDesc = summary?.businessDescription || "your business";
        const targetMarket = summary?.targetMarket || "";
        const painPoints = summary?.painPointsWithMetrics || [];
        const multiplier = summary?.opportunityMultiplier || "3";
        
        const summaryText = `I've analyzed **${hostname}** and discovered key insights:

${businessDesc}${targetMarket ? ` ${targetMarket}` : ''}

**Key Pain Points & Impact:**
${painPoints.slice(0, 3).map((p: { pain: string; metric: string }) => `• **${p.pain}** — ${p.metric}`).join('\n')}

**Growth Opportunity:** By targeting the right customer profile with personalized messaging, you have potential to reach up to **${multiplier}x more qualified leads** and significantly improve conversion rates.

I've identified **${icps.length} ideal customer profiles** below. Select one to customize your funnel:`;

        // Show summary
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: summaryText,
        });

        // Show ICP cards
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: "",
          component: "icps",
          data: icps,
        });

        // Record website analysis completion
        updateUserJourney({ websiteAnalyzed: true });
        memoryManager.addGenerationRecord(activeConversationId, 'website-analyzed', { icps, summary } as Record<string, unknown>);
      } else if (selectedIcp && websiteUrl) {
        // Chat refinement
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: activeConversation?.messages.map(m => ({
              role: m.role,
              content: m.content,
            })) || [],
            websiteUrl,
            icp: selectedIcp,
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        const assistantMsgId = nanoid();
        addMessage({ id: assistantMsgId, role: "assistant", content: "" });

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            assistantMessage += chunk;

            setConversations(prev =>
              prev.map(conv =>
                conv.id === activeConversationId
                  ? {
                      ...conv,
                      messages: conv.messages.map(m =>
                        m.id === assistantMsgId ? { ...m, content: assistantMessage } : m
                      ),
                    }
                  : conv
              )
            );
          }

          // Parse JSON and update landing page
          try {
            const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              
              setConversations(prev =>
                prev.map(conv =>
                  conv.id === activeConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map(m =>
                          m.id === assistantMsgId
                            ? { ...m, content: parsed.message || assistantMessage }
                            : m.component === "landing-preview"
                            ? { ...m, data: { ...m.data, ...parsed.updates } }
                            : m
                        ),
                      }
                    : conv
                )
              );
            }
          } catch {
            // Not JSON
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `❌ Error: ${errorMessage}\n\nPlease try again or check your URL. If the problem persists, try a different website.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-create conversation if none exists
  const ensureActiveConversation = () => {
    if (!activeConversationId || !activeConversation) {
      const newConv: Conversation = {
        id: nanoid(),
        title: "New conversation",
        messages: [],
        createdAt: new Date(),
        generationState: {
          currentStep: 'analysis',
          completedSteps: [],
          generatedContent: {},
          isGenerating: false,
          generationId: undefined,
          lastGenerationTime: undefined,
        },
        userJourney: {
          websiteAnalyzed: false,
          icpSelected: false,
          valuePropGenerated: false,
          exported: false,
        },
        memory: {
          id: nanoid(),
          websiteUrl: "",
          selectedIcp: null,
          generationHistory: [],
          userPreferences: {
            preferredContentType: "",
            lastAction: "",
          },
        },
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);

      // Initialize memory manager with the new conversation's memory
      memoryManager.updateMemory(newConv.id, newConv.memory);

      return newConv.id; // Return the new ID immediately
    }
    return activeConversationId;
  };

  // Mock LinkedIn profile generator
  const generateMockProfiles = (): LinkedInProfile[] => {
    const mockProfiles: LinkedInProfile[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        headline: 'VP of Marketing at FastGrow | Growth Strategy & B2B SaaS',
        company: 'FastGrow',
        location: 'San Francisco, CA',
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=SarahChen`,
        matchScore: 94,
        matchReasons: [
          'Matches target role and seniority',
          'Active in B2B marketing communities',
          'Recent posts about growth challenges'
        ],
        recentPosts: [
          {
            id: 'p1',
            content: 'Struggling to scale our demand gen without increasing CAC. Any proven frameworks?',
            timestamp: '2d ago',
            engagement: 127
          },
          {
            id: 'p2',
            content: 'Just implemented account-based marketing. Results are promising but resource-intensive.',
            timestamp: '1w ago',
            engagement: 89
          }
        ],
        experience: [
          { title: 'VP Marketing', company: 'FastGrow', duration: '2y 3m' },
          { title: 'Director of Growth', company: 'ScaleUp Inc', duration: '3y 1m' }
        ]
      },
      {
        id: '2',
        name: 'Michael Rodriguez',
        headline: 'Chief Revenue Officer | Scaling B2B SaaS to $50M ARR',
        company: 'CloudSync',
        location: 'Austin, TX',
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=MichaelRodriguez`,
        matchScore: 91,
        matchReasons: [
          'Decision maker for revenue tools',
          'Actively hiring growth team',
          'Budget owner for marketing stack'
        ],
        recentPosts: [
          {
            id: 'p3',
            content: 'Looking for recommendations on modern lead gen tools. What\'s actually working in 2024?',
            timestamp: '3d ago',
            engagement: 203
          }
        ],
        experience: [
          { title: 'Chief Revenue Officer', company: 'CloudSync', duration: '1y 8m' },
          { title: 'VP Sales', company: 'DataStream', duration: '4y 2m' }
        ]
      },
      {
        id: '3',
        name: 'Emily Watson',
        headline: 'Head of Demand Generation | Building Scalable Growth Engines',
        company: 'TechVision',
        location: 'New York, NY',
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=EmilyWatson`,
        matchScore: 89,
        matchReasons: [
          'Pain points align with solution',
          'Company in growth phase (Series B)',
          'Recent budget allocation for tools'
        ],
        recentPosts: [
          {
            id: 'p4',
            content: 'Our pipeline is healthy but conversion rates dropped 15%. Time to revisit our ICP.',
            timestamp: '5d ago',
            engagement: 156
          },
          {
            id: 'p5',
            content: 'Personalization at scale is the holy grail. Who\'s cracked this?',
            timestamp: '2w ago',
            engagement: 94
          }
        ],
        experience: [
          { title: 'Head of Demand Gen', company: 'TechVision', duration: '2y 1m' },
          { title: 'Senior Marketing Manager', company: 'InnovateCo', duration: '3y 6m' }
        ]
      },
      {
        id: '4',
        name: 'David Park',
        headline: 'Director of Marketing Operations | MarTech Stack Optimization',
        company: 'Velocity Labs',
        location: 'Seattle, WA',
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=DavidPark`,
        matchScore: 87,
        matchReasons: [
          'Owns marketing technology decisions',
          'Looking to consolidate tools',
          'Budget cycle starts next quarter'
        ],
        recentPosts: [
          {
            id: 'p6',
            content: 'Auditing our martech stack. 23 tools, but only using 40% of features. Time to streamline.',
            timestamp: '1w ago',
            engagement: 178
          }
        ],
        experience: [
          { title: 'Director Marketing Ops', company: 'Velocity Labs', duration: '1y 11m' },
          { title: 'Marketing Operations Lead', company: 'GrowthCorp', duration: '2y 8m' }
        ]
      },
      {
        id: '5',
        name: 'Jennifer Liu',
        headline: 'Growth Marketing Lead | Performance Marketing & Analytics',
        company: 'Momentum',
        location: 'Boston, MA',
        photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=JenniferLiu`,
        matchScore: 85,
        matchReasons: [
          'Data-driven decision maker',
          'Experimenting with new channels',
          'Team recently expanded'
        ],
        recentPosts: [
          {
            id: 'p7',
            content: 'Attribution modeling is broken. We need better visibility into what actually drives conversions.',
            timestamp: '4d ago',
            engagement: 142
          },
          {
            id: 'p8',
            content: 'Hiring 2 growth marketers. DM if interested! Looking for people who love experiments.',
            timestamp: '1w ago',
            engagement: 67
          }
        ],
        experience: [
          { title: 'Growth Marketing Lead', company: 'Momentum', duration: '1y 5m' },
          { title: 'Senior Growth Manager', company: 'StartupXYZ', duration: '2y 3m' }
        ]
      }
    ];

    return mockProfiles;
  };

  const handleShowProfiles = (e: React.MouseEvent, icp: ICP) => {
    e.stopPropagation(); // Prevent card click
    setSelectedProfilesICP(icp);
    setLoadingProfiles(true);
    setShowProfilesDrawer(true);

    // Simulate loading delay
    setTimeout(() => {
      const profiles = generateMockProfiles();
      setLinkedInProfiles(profiles);
      setLoadingProfiles(false);
    }, 800);
  };

  // Handler for approving value prop summary
  const handleApproveValuePropSummary = async (data: { valuePropData: ValuePropData; icp: ICP }) => {
    // Show value prop builder
    addMessage({
      id: nanoid(),
      role: "assistant",
      content: `Here's your personalized value proposition for **${data.icp.title}**. Customize the variables to match your messaging, then click "Generate Variations" to see different styles.`,
      component: "value-prop",
      data: {
        ...data.valuePropData,
        icp: data.icp
      },
    });

    updateUserJourney({ valuePropGenerated: true });
    memoryManager.addGenerationRecord(activeConversationId, 'approve-value-prop-summary', { approved: true } as Record<string, unknown>);
  };

  // Handler for regenerating a single variation
  const handleRegenerateVariation = async (variationId: string, variationIndex: number) => {
    try {
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      const valuePropData = activeConversation?.generationState.generatedContent.valueProp;
      
      if (!valuePropData) return;

      const response = await fetch("/api/generate-value-prop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icp: valuePropData.icp,
          websiteUrl,
          factsJson: activeConversation?.memory.factsJson,
          regenerateIndex: variationIndex,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the specific variation in the conversation state
        setConversations(prev => prev.map(conv => {
          if (conv.id !== activeConversationId) return conv;
          
          const updatedValueProp = {
            ...valuePropData,
            variations: valuePropData.variations.map((v, idx) => 
              idx === variationIndex ? data.variations[variationIndex] : v
            )
          };

          return {
            ...conv,
            generationState: {
              ...conv.generationState,
              generatedContent: {
                ...conv.generationState.generatedContent,
                valueProp: updatedValueProp
              }
            },
            messages: conv.messages.map(msg =>
              msg.component === "value-prop" 
                ? { ...msg, data: updatedValueProp }
                : msg
            )
          };
        }));
      }
    } catch (error) {
      console.error("Error regenerating variation:", error);
    }
  };

  // Handler for confirming value prop (moves to next step)
  const handleConfirmValueProp = () => {
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const valuePropData = activeConversation?.generationState.generatedContent.valueProp;
    
    if (!valuePropData) {
      console.error('No value prop data found');
      return;
    }

    // Get ICP from the valueProp data
    const icp = valuePropData.icp;
    
    if (!icp) {
      console.error('No ICP found in value prop data');
      return;
    }

    // Move to positioning summary
    handleVariationsGenerated(valuePropData, icp);
  };

  // Handler for when variations are generated
  const handleVariationsGenerated = (valuePropData: ValuePropData, icp: ICP) => {
    // Step 1: Show text message with mini summary of accomplishment
    const accomplishmentText = `Excellent! I've generated 5 value proposition variations for **${icp.title}**.

**What We Created:**
• ${valuePropData.variations.length} different messaging styles (${valuePropData.variations.map(v => v.style).join(', ')})
• Customized for ${icp.personaRole} in ${icp.personaCompany}
• Strategy: ${valuePropData.summary?.approachStrategy || 'Strategic positioning'}
• Expected impact: ${valuePropData.summary?.expectedImpact || 'Improved conversion'}

Now let me prepare your complete positioning package...`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: accomplishmentText
    });

    // Step 2: Show positioning summary card after short delay for readability
    setTimeout(() => {
      const positioningSummary = `I've created a complete positioning package for **${icp.personaName}** (${icp.title}).

**Persona Match:**
• ${icp.personaRole} at ${icp.personaCompany}
• ${icp.location}, ${icp.country}

**Value Proposition Strategy:**
${valuePropData.summary?.approachStrategy || 'Strategic positioning'}

**Why This Positioning Works:**
${valuePropData.summary?.mainInsight || 'Targeted messaging approach'}

**Impact You Can Expect:**
${valuePropData.summary?.expectedImpact || 'Improved conversion rates'}

Ready to see your complete positioning package?`;

      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "positioning-summary",
        data: {
          summary: positioningSummary,
          icp,
          valuePropData
        }
      });
    }, 1000);
  };

  // Handler for regenerating value prop
  const handleRegenerateValueProp = async () => {
    if (!selectedIcp) return;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: "Regenerating with a fresh perspective...",
    });

    // Clear cache and regenerate
    generationManager.clearCache();
    await handleSelectIcp(selectedIcp);
  };

  // Handler for approving positioning summary
  const handleApprovePositioningSummary = (data: { icp: ICP; valuePropData: ValuePropData }) => {
    // Step 1: Show text explaining what they'll see
    const explanationText = `Here's your complete customer positioning package 🎯

**What's Included:**
• **Persona Profile** – Detailed ICP with demographics, pain points, and goals
• **Value Propositions** – 5 messaging variations for different channels
• **Positioning Strategy** – The "why" behind this approach
• **Export Options** – Download as Google Slides, LinkedIn post, or plain text

This is your go-to resource for all messaging, marketing, and sales targeting **${data.icp.title}**.`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: explanationText
    });

    // Step 2: Show PersonaShowcase after short delay for readability
    setTimeout(() => {
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "persona-showcase",
        data: {
          personas: [data.icp],
          selectedPersonaId: data.icp.id,
          valuePropData: {
            [data.icp.id]: data.valuePropData
          }
        }
      });

      memoryManager.addGenerationRecord(activeConversationId, 'approve-positioning-summary', { approved: true } as Record<string, unknown>);
    }, 1000);
  };

  // Outreach choice handler (Email vs LinkedIn)
  const handleContinueToOutreach = (icp: ICP) => {
    // Show outreach choice summary message
    const outreachText = `Great! Now let's deploy your value proposition for **${icp.title}**.

**Where do you want to use this?**
• **Email** – Single emails or multi-day nurture sequences
• **LinkedIn** – Posts, profile bios, or InMail outreach

Choose your channel:`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: outreachText
    });

    // Show outreach choice card
    setTimeout(() => {
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "outreach-choice",
        data: { icp }
      });
    }, 500);

    memoryManager.addGenerationRecord(activeConversationId, 'show-outreach-choice', { icpId: icp.id } as Record<string, unknown>);
  };

  // Handler for outreach choice selection
  const handleOutreachChoice = (choice: 'email' | 'linkedin', icp: ICP) => {
    if (choice === 'email') {
      handleContinueToEmail(icp);
    } else {
      handleContinueToLinkedIn(icp);
    }
  };

  // Email sequence handlers
  const handleContinueToEmail = (icp: ICP) => {
    // Show email strategy summary message
    const emailStrategyText = `Let's create your email outreach for **${icp.title}**.

**Available Options:**
• **Single Email** – Perfect for announcements or quick outreach
• **Email Sequence** – 5, 7, or 10-day nurture flow that builds relationships over time

Which approach would you like to use?`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: emailStrategyText
    });

    // Show email type choice card
    setTimeout(() => {
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "email-type-choice",
        data: { icp }
      });
    }, 500);

    memoryManager.addGenerationRecord(activeConversationId, 'show-email-choice', { icpId: icp.id } as Record<string, unknown>);
  };

  // LinkedIn outreach handlers
  const handleContinueToLinkedIn = (icp: ICP) => {
    // Show LinkedIn strategy summary message
    const linkedInStrategyText = `Let's create LinkedIn content for **${icp.title}**.

**Available Formats:**
• **Post** – Single LinkedIn post with hashtags and CTA
• **Profile Bio** – First-person bio highlighting your expertise
• **InMail** – 60-120 word outreach message to connect

What would you like to create?`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: linkedInStrategyText
    });

    // Show LinkedIn type choice card
    setTimeout(() => {
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "linkedin-type-choice",
        data: { icp }
      });
    }, 500);

    memoryManager.addGenerationRecord(activeConversationId, 'show-linkedin-choice', { icpId: icp.id } as Record<string, unknown>);
  };

  // Handler for LinkedIn type choice
  const handleLinkedInTypeChoice = async (type: 'post' | 'profile_bio' | 'inmail', icp: ICP) => {
    const typeLabels = {
      post: 'LinkedIn Post',
      profile_bio: 'Profile Bio',
      inmail: 'InMail Message'
    };

    addMessage({
      id: nanoid(),
      role: "user",
      content: `Generate a ${typeLabels[type]} for ${icp.title}`
    });

    // Create thinking message
    const thinkingMsgId = nanoid();
    addMessage({
      id: thinkingMsgId,
      role: "assistant",
      content: "thinking",
      thinking: [
        { id: 'analyze', label: 'Analyzing persona insights', status: 'pending' },
        { id: 'craft', label: `Crafting ${typeLabels[type]}`, status: 'pending' },
        { id: 'optimize', label: 'Optimizing for engagement', status: 'pending' },
      ],
    });

    updateGenerationState({ isGenerating: true, currentStep: 'linkedin-outreach' });

    try {
      // Step 1: Analyze persona insights
      const analyzeStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'analyze', {
        status: 'running',
        startTime: analyzeStart,
        substeps: ['Analyzing ICP pain points & goals...', 'Matching to value propositions...']
      });

      // Get current value prop data
      const valuePropData = activeConversation?.generationState.generatedContent.valueProp;
      const websiteUrl = activeConversation?.memory.websiteUrl;

      updateThinkingStep(thinkingMsgId, 'analyze', {
        status: 'complete',
        duration: Date.now() - analyzeStart,
        substeps: [
          `✅ Analyzed ${icp.painPoints?.length || 0} pain points`,
          `✅ Matched to ${valuePropData?.variations?.length || 0} value props`
        ]
      });

      // Step 2: Craft LinkedIn content
      const craftStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'craft', {
        status: 'running',
        startTime: craftStart,
        substeps: [`Generating ${typeLabels[type]} with AI (10-20s)...`]
      });

      // Call LinkedIn generation API
      const response = await fetch('/api/generate-linkedin-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icp,
          valueProp: valuePropData,
          websiteUrl,
          factsJson: activeConversation?.memory.factsJson, // NEW: Pass structured facts
          websiteContent: activeConversation?.memory.websiteContent, // Fallback
          type, // Pass the specific type
        }),
      });

      if (!response.ok) throw new Error('Failed to generate LinkedIn content');

      const linkedInData = await response.json();

      updateThinkingStep(thinkingMsgId, 'craft', {
        status: 'complete',
        duration: Date.now() - craftStart,
        substeps: [
          `✅ Generated ${linkedInData?.messages?.length || 0} LinkedIn messages`,
          `✅ Total ${linkedInData?.messages?.reduce((sum: number, m: any) => sum + (m.characterCount || 0), 0) || 0} characters`
        ]
      });

      // Step 3: Optimize for engagement
      const optimizeStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'optimize', {
        status: 'running',
        startTime: optimizeStart,
        substeps: ['Adding personalization tips...', 'Optimizing for engagement...']
      });

      updateThinkingStep(thinkingMsgId, 'optimize', {
        status: 'complete',
        duration: Date.now() - optimizeStart,
        substeps: [
          `✅ Added ${linkedInData?.messages?.[0]?.personalizationTips?.length || 0} personalization tips`,
          '✅ Optimized for LinkedIn best practices'
        ]
      });

      // Remove thinking message and show result
      setTimeout(() => {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
              : conv
          )
        );

        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `Here's your ${typeLabels[type]} for **${icp.title}**. Copy it and use it on LinkedIn!`,
          component: "linkedin-outreach",
          data: linkedInData.messages 
            ? { outreach: linkedInData, icp, type } // Sequence format
            : { ...linkedInData, icp, type }, // Single content format
        });

        updateGenerationState({
          isGenerating: false,
          generatedContent: {
            ...activeConversation?.generationState.generatedContent,
            linkedinOutreach: linkedInData
          }
        });
      }, 300);

    } catch (error) {
      console.error('Error generating LinkedIn content:', error);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
            : conv
        )
      );

      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `I encountered an error generating your ${typeLabels[type]}. Please try again.`,
      });

      updateGenerationState({ isGenerating: false });
    }
  };

  const handleEmailTypeChoice = async (type: 'one-time' | 'sequence', icp: ICP) => {
    if (type === 'one-time') {
      // Generate single email immediately
      addMessage({
        id: nanoid(),
        role: "user",
        content: `Generate a single email for ${icp.title}`
      });

      // Create thinking message
      const thinkingMsgId = nanoid();
      addMessage({
        id: thinkingMsgId,
        role: "assistant",
        content: "thinking",
        thinking: [
          { id: 'analyze', label: 'Analyzing persona insights', status: 'pending' },
          { id: 'craft', label: 'Crafting email copy', status: 'pending' },
          { id: 'subjects', label: 'Creating A/B/C subject lines', status: 'pending' },
        ],
      });

      updateGenerationState({ isGenerating: true, currentStep: 'one-time-email' });

      try {
        // Step 1: Analyze persona insights
        const analyzeStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'analyze', {
          status: 'running',
          startTime: analyzeStart,
          substeps: ['Analyzing persona profile...', 'Identifying key pain points...']
        });

        updateThinkingStep(thinkingMsgId, 'analyze', {
          status: 'complete',
          duration: Date.now() - analyzeStart,
          substeps: [
            `✅ Analyzed ${icp.title}`,
            `✅ ${icp.painPoints?.length || 0} pain points identified`
          ]
        });

        // Step 2: Craft email copy
        const craftStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'craft', {
          status: 'running',
          startTime: craftStart,
          substeps: ['Crafting email body (10-20s)...', 'Generating A/B/C subject lines...']
        });

        const response = await fetch('/api/generate-one-time-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            icp, 
            websiteContext: activeConversation?.memory.websiteContent, // Fallback
            factsJson: activeConversation?.memory.factsJson, // NEW: Pass structured facts
            valueProp: activeConversation?.generationState.generatedContent.valueProp,
            userChoices: {} // Can be extended later with tone, CTA choices
          })
        });

        const data: OneTimeEmailData = await response.json();

        updateThinkingStep(thinkingMsgId, 'craft', {
          status: 'complete',
          duration: Date.now() - craftStart,
          substeps: [
            `✅ Email body: ${data?.emailBody?.split(' ')?.length || 0} words`,
            `✅ Generated ${Object.keys(data?.subjectLines || {}).length} subject line variations`
          ]
        });

        // Step 3: Optimize subject lines
        const subjectsStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'subjects', {
          status: 'running',
          startTime: subjectsStart,
          substeps: ['Optimizing subject lines for open rates...']
        });

        updateThinkingStep(thinkingMsgId, 'subjects', {
          status: 'complete',
          duration: Date.now() - subjectsStart,
          substeps: [
            `✅ ${data?.subjectLines?.A?.length || 0} chars (optimal: 40-50)`,
            '✅ Ready for A/B/C testing'
          ]
        });

        // Remove thinking message
        setTimeout(() => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === activeConversationId
                ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
                : conv
            )
          );

          // Show result
          addMessage({
            id: nanoid(),
            role: "assistant",
            content: `Here's your one-time email for **${icp.title}** with 3 subject line variations ready for A/B testing.`,
            component: "one-time-email",
            data: { email: data, icp }
          });

          // Update generation state
          updateGenerationState({
            isGenerating: false,
            generatedContent: {
              ...activeConversation?.generationState.generatedContent,
              oneTimeEmail: data
            }
          });

          memoryManager.addGenerationRecord(activeConversationId, 'generate-one-time-email', { icpId: icp.id, data } as Record<string, unknown>);
        }, 800);
      } catch (error) {
        console.error('Error generating one-time email:', error);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
              : conv
          )
        );
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: "Sorry, there was an error generating the email. Please try again."
        });
        updateGenerationState({ isGenerating: false });
      }
    } else {
      // Show sequence length choice
      addMessage({
        id: nanoid(),
        role: "user",
        content: `I want to create an email sequence for ${icp.title}`
      });

      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "Perfect! Email sequences are great for building relationships. Let's choose the length:",
        component: "sequence-length-choice",
        data: { icp }
      });

      memoryManager.addGenerationRecord(activeConversationId, 'choose-email-type', { type: 'sequence', icpId: icp.id } as Record<string, unknown>);
    }
  };

  const handleSequenceLengthChoice = async (days: 5 | 7 | 10, icp: ICP) => {
    addMessage({
      id: nanoid(),
      role: "user",
      content: `Generate a ${days}-day email sequence for ${icp.title}`
    });

    // Create thinking message
    const thinkingMsgId = nanoid();
    addMessage({
      id: thinkingMsgId,
      role: "assistant",
      content: "thinking",
      thinking: [
        { id: 'analyze', label: 'Analyzing persona journey', status: 'pending' },
        { id: 'sequence', label: `Planning ${days}-day sequence`, status: 'pending' },
        { id: 'emails', label: `Crafting ${days} emails with variations`, status: 'pending' },
        { id: 'timeline', label: 'Building visual timeline', status: 'pending' },
      ],
    });

    updateGenerationState({ isGenerating: true, currentStep: 'email-sequence' });

    try {
      // Step 1: Analyze persona journey
      const analyzeStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'analyze', {
        status: 'running',
        startTime: analyzeStart,
        substeps: ['Analyzing customer journey...', 'Identifying touchpoints...']
      });

      updateThinkingStep(thinkingMsgId, 'analyze', {
        status: 'complete',
        duration: Date.now() - analyzeStart,
        substeps: [
          `✅ Mapped ${days}-day journey`,
          '✅ Identified key decision points'
        ]
      });

      // Step 2: Plan sequence
      const sequenceStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'sequence', {
        status: 'running',
        startTime: sequenceStart,
        substeps: [`Planning ${days} touchpoints...`, 'Defining email objectives...']
      });

      updateThinkingStep(thinkingMsgId, 'sequence', {
        status: 'complete',
        duration: Date.now() - sequenceStart,
        substeps: [
          `✅ Planned ${days} emails`,
          '✅ Defined sequence flow'
        ]
      });

      // Step 3: Craft emails
      const emailsStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'emails', {
        status: 'running',
        startTime: emailsStart,
        substeps: [`Crafting ${days} emails with AI (20-40s)...`, 'Generating A/B variations...']
      });

      const response = await fetch('/api/generate-email-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icp,
          websiteUrl,
          factsJson: activeConversation?.memory.factsJson, // NEW: Pass structured facts
          websiteContent: activeConversation?.memory.websiteContent, // Fallback
          valueProp: activeConversation?.generationState.generatedContent.valueProp,
          sequenceLength: days
        })
      });

      const data: EmailSequenceData = await response.json();

      updateThinkingStep(thinkingMsgId, 'emails', {
        status: 'complete',
        duration: Date.now() - emailsStart,
        substeps: [
          `✅ Generated ${data?.emails?.length || 0} emails`,
          `✅ ${data?.emails?.reduce((sum: number, e: EmailMessage) => sum + (e.subjectLines?.length || 0), 0)} total subject lines`
        ]
      });

      // Step 4: Build timeline
      const timelineStart = Date.now();
      updateThinkingStep(thinkingMsgId, 'timeline', {
        status: 'running',
        startTime: timelineStart,
        substeps: ['Building visual timeline...', 'Adding delivery schedule...']
      });

      updateThinkingStep(thinkingMsgId, 'timeline', {
        status: 'complete',
        duration: Date.now() - timelineStart,
        substeps: [
          `✅ Timeline: Day 0 → Day ${days}`,
          '✅ Ready to deploy'
        ]
      });

      // Remove thinking message and show result
      setTimeout(() => {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
              : conv
          )
        );

        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `Here's your complete ${days}-day email sequence for **${icp.title}** with a visual timeline and personalization tips for each email.`,
          component: "email-sequence",
          data: { sequence: data, icp, days }
        });

        // Update generation state
        updateGenerationState({
          isGenerating: false,
          generatedContent: {
            ...activeConversation?.generationState.generatedContent,
            emailSequence: data
          }
        });

        memoryManager.addGenerationRecord(activeConversationId, 'generate-email-sequence', { icpId: icp.id, days, data } as Record<string, unknown>);
      }, 1000);
    } catch (error) {
      console.error('Error generating email sequence:', error);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: conv.messages.filter(m => m.id !== thinkingMsgId) }
            : conv
        )
      );
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "Sorry, there was an error generating the email sequence. Please try again."
      });
      updateGenerationState({ isGenerating: false });
    }
  };

  const handleSelectIcp = async (icp: ICP) => {
    // Check if action is allowed
    if (!canPerformAction('select-icp')) {
      console.log('🚫 [handleSelectIcp] Action not allowed - generation in progress or prerequisites not met');
      return;
    }

    // Check if already completed for this ICP
    if (isGenerationCompleted('value-prop', { icp: icp.id })) {
      console.log('✅ [handleSelectIcp] Value prop already generated for this ICP');
      setSelectedIcp(icp);
      updateUserJourney({ icpSelected: true });
      return;
    }

    // Check if currently generating
    if (isGenerationInProgress('value-prop', { icp: icp.id })) {
      console.log('⏳ [handleSelectIcp] Value prop generation already in progress');
      return;
    }

    setSelectedIcp(icp);
    updateGenerationState({ 
      isGenerating: true, 
      generationId: `value-prop-${icp.id}`,
      currentStep: 'value-prop'
    });
    updateUserJourney({ icpSelected: true });
    
    // Record ICP selection
    memoryManager.addGenerationRecord(activeConversationId, 'select-icp', { icpId: icp.id, icpTitle: icp.title } as Record<string, unknown>);

    addMessage({
      id: nanoid(),
      role: "user",
      content: `Create value proposition for: ${icp.title}`,
    });

    // Add text-based conversational messages instead of thinking block
    const analyzeMsg = nanoid();
    addMessage({
      id: analyzeMsg,
      role: "assistant",
      content: "Analyzing your customer insights...",
    });

    try {
      // Use idempotent generation
      const valuePropData = await generationManager.generate(
        'value-prop',
        { icp: icp.id, websiteUrl },
        async () => {
          // Step 1: Analyze
          await new Promise(resolve => setTimeout(resolve, 400));

          // Update to show progress
          setTimeout(() => {
            addMessage({
              id: nanoid(),
              role: "assistant",
              content: `Found ${icp.painPoints.length} key pain points and ${icp.goals.length} goals. Crafting your positioning...`,
            });
          }, 500);

          // Step 2: Generate value prop
          await new Promise(resolve => setTimeout(resolve, 300));

          const valuePropRes = await fetch("/api/generate-value-prop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              icp,
              websiteUrl,
              factsJson: activeConversation?.memory.factsJson // NEW: Pass structured facts
            }),
          });

          if (!valuePropRes.ok) throw new Error("Failed to generate value prop");
          const data = await valuePropRes.json();

          // Step 3: Show variations message
          setTimeout(() => {
            addMessage({
              id: nanoid(),
              role: "assistant",
              content: "Creating variations tailored to different use cases...",
            });
          }, 800);

          await new Promise(resolve => setTimeout(resolve, 300));

          return data;
        }
      );

      // Format summary for display
      const summary = valuePropData.summary;
      const summaryText = `**Key Insight:**
${summary.mainInsight}

**Pain Points Addressed:**
${summary.painPointsAddressed.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

**Positioning Strategy:** ${summary.approachStrategy}

**Expected Impact:** ${summary.expectedImpact}`;

      // Show summary with approval step
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "value-prop-summary",
        data: {
          summary: summaryText,
          valuePropData,
          icp
        },
      });

      // Update state with generated content
      updateGenerationState({
        generatedContent: {
          ...activeConversation?.generationState.generatedContent,
          valueProp: valuePropData
        },
        completedSteps: [...(activeConversation?.generationState.completedSteps || []), 'value-prop']
      });

      // Record in memory
      memoryManager.addGenerationRecord(activeConversationId, 'value-prop', valuePropData);
      memoryManager.setLastAction(activeConversationId, 'select-icp');

    } catch (error) {
      console.error("Error:", error);
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "Sorry, something went wrong generating the value proposition. Please try again.",
      });
      memoryManager.addGenerationRecord(activeConversationId, 'value-prop', { error: true }, false);
    } finally {
      updateGenerationState({ 
        isGenerating: false, 
        generationId: undefined 
      });
    }
  };

  const handleExport = async (format: string, data: { personas: ICP[]; valuePropData: Record<string, ValuePropData> }) => {
    console.log('🚀 [handleExport] Starting export for format:', format);
    setIsLoading(true);
    
    try {
      const exportData = {
        ...data,
        websiteUrl: activeConversation?.memory.websiteUrl || ''
      };
      
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });
      
      if (!response.ok) throw new Error(`Export failed: ${format}`);
      
      const result = await response.json();
      
      // Handle different export types
      if (format === 'google-slides') {
        // Open Google Slides template
        if (result.templateUrl) {
          window.open(result.templateUrl, '_blank');
        }
        
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `✅ **Opening Google Slides template...**\n\n${result.message}\n\n${result.instructions}`
        });
        
      } else if (format === 'linkedin') {
        // Copy first post to clipboard
        const firstPost = result.posts?.[0]?.post || result.combinedPost;
        await navigator.clipboard.writeText(firstPost);
        
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `✅ **LinkedIn post copied to clipboard!**\n\nHere's what was copied:\n\n---\n\n${firstPost}\n\n---\n\n💡 ${result.tips?.[0] || 'Post during business hours for best engagement'}`
        });
        
      } else if (format === 'plain-text') {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.content);
        
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `✅ **Plain text copied to clipboard!**\n\n📊 Stats:\n- ${result.characterCount} characters\n- ${result.lineCount} lines\n- ${data.personas.length} personas included\n\nYou can now paste this into any document, email, or notes app.`
        });
        
      } else if (format === 'pdf') {
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `📄 **PDF export coming soon!**\n\n${result.message}\n\nAlternative: ${result.alternative}`
        });
      } else if (format === 'share-link') {
        addMessage({
          id: nanoid(),
          role: "assistant",
          content: `🔗 **Share link feature coming soon!**\n\nThis will let you create a public URL to share your positioning with team members or stakeholders.`
        });
      }
      
      // Update user journey
      updateUserJourney({ exported: true });
      memoryManager.addGenerationRecord(activeConversationId, `export-${format}`, result);
      
    } catch (error) {
      console.error('Export error:', error);
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `❌ Export failed for ${format}. Please try again or choose a different format.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sidebar content (reused in desktop & mobile)
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <div className="font-semibold mb-4">Flowtusk</div>
        <Button
          onClick={() => {
            createNewConversation();
            setSidebarOpen(false); // Close mobile drawer on action
          }}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversationId(conv.id);
                setSidebarOpen(false); // Close mobile drawer on selection
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                conv.id === activeConversationId
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 border-r flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header - Only visible on mobile */}
        <div className="md:hidden flex items-center gap-3 p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Flowtusk</span>
        </div>
        {/* Messages */}
        <ScrollArea className="flex-1 px-3 sm:px-4 py-6 sm:py-12" ref={scrollRef}>
          <div className="space-y-4 mx-auto max-w-3xl">
            {!activeConversation?.messages.length && (
              <div className="text-center py-12 sm:py-20 px-4">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Your Positioning Co-Pilot
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  Enter a website URL to generate customer personas and value propositions
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-sm sm:max-w-none mx-auto">
                  {["https://taxstar.app", "https://stripe.com", "https://linear.app"].map(url => (
                    <Button
                      key={url}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!activeConversation) createNewConversation();
                        setInput(url);
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          form?.requestSubmit();
                        }, 100);
                      }}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {url}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeConversation?.messages.map(message => (
              <div
                key={message.id}
                className={`flex w-full flex-col gap-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "user" ? (
                  <div className="bg-muted text-foreground max-w-[85%] rounded-3xl px-5 py-2.5 text-sm">
                    {message.content}
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    {/* Thinking Block */}
                    {message.content === "thinking" && message.thinking && (
                      <ThinkingBlock thinking={message.thinking} />
                    )}
                    
                    {/* Status Messages (Legacy - fallback) */}
                    {message.content === "crawling_website" && (
                      <SystemMessage variant="loading" icon={<Search className="h-4 w-4" />}>
                        Crawling website and extracting content...
                      </SystemMessage>
                    )}
                    {message.content.startsWith("crawl_complete:") && (() => {
                      const [, pages, source, filepath] = message.content.split(":");
                      return (
                        <SystemMessage variant="success">
                          Crawled {pages} page{pages !== "1" ? "s" : ""} using {source === "firecrawl" ? "Firecrawl" : "Jina AI"}
                          <div className="text-xs text-muted-foreground mt-1">
                            Blueprint saved: {filepath?.split("/").pop()}
                          </div>
                        </SystemMessage>
                      );
                    })()}
                    {message.content === "generating_icps" && (
                      <SystemMessage variant="loading" icon={<Brain className="h-4 w-4" />}>
                        Generating ideal customer profiles...
                      </SystemMessage>
                    )}
                    {message.content === "crafting_landing_page" && (
                      <SystemMessage variant="loading" icon={<Wand2 className="h-4 w-4" />}>
                        Crafting your landing page...
                      </SystemMessage>
                    )}
                    
                    {/* Regular text content */}
                    {message.content && 
                     !message.content.startsWith("crawl_complete:") &&
                     !["crawling_website", "generating_icps", "crafting_landing_page", "thinking"].includes(message.content) && (
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content.split('**').map((part, i) => 
                          i % 2 === 0 ? (
                            <span key={i}>{part}</span>
                          ) : (
                            <strong key={i} className="font-semibold">{part}</strong>
                          )
                        )}
                      </div>
                    )}

                    {/* ICP Cards */}
                    {message.component === "icps" && message.data && (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {(message.data as ICP[]).map((icp, idx) => {
                          const colors = [
                            { 
                              gradient: "from-pink-500/10 to-purple-500/10",
                              border: "border-pink-200 dark:border-pink-800",
                              badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
                              avatar: "ring-pink-200 dark:ring-pink-800",
                              progress: "bg-gradient-to-r from-pink-500 to-purple-500"
                            },
                            { 
                              gradient: "from-purple-500/10 to-blue-500/10",
                              border: "border-purple-200 dark:border-purple-800",
                              badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
                              avatar: "ring-purple-200 dark:ring-purple-800",
                              progress: "bg-gradient-to-r from-purple-500 to-blue-500"
                            },
                            { 
                              gradient: "from-blue-500/10 to-cyan-500/10",
                              border: "border-blue-200 dark:border-blue-800",
                              badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                              avatar: "ring-blue-200 dark:ring-blue-800",
                              progress: "bg-gradient-to-r from-blue-500 to-cyan-500"
                            }
                          ];
                          const color = colors[idx % colors.length];
                          
                          // Generate consistent avatar
                          const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(icp.personaName || icp.title)}`;
                          
                          // Calculate match score based on data richness
                          const matchScore = Math.min(84 + idx * 4 + (icp.painPoints.length * 2), 98);
                          
                          return (
                            <Card
                              key={icp.id}
                              className={`group relative overflow-hidden border-2 ${color.border} hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1`}
                              onClick={() => handleSelectIcp(icp)}
                            >
                              {/* Gradient background */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient}`} />
                              
                              <div className="relative p-3 sm:p-4 space-y-2 sm:space-y-3">
                                {/* Persona Header */}
                                <div className="flex items-start gap-3">
                                  {/* Avatar with online indicator */}
                                  <div className="relative shrink-0">
                                    <img 
                                      src={avatarUrl}
                                      alt={icp.personaName}
                                      className={`w-12 h-12 rounded-xl ring-2 ${color.avatar} ring-offset-2 ring-offset-background group-hover:scale-110 transition-transform`}
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm mb-0.5 truncate">
                                      {icp.personaName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {icp.personaRole}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 truncate">
                                      {icp.personaCompany}
                                    </p>
                                    {icp.location && icp.country && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground/50" />
                                        <p className="text-xs text-muted-foreground/60 truncate">
                                          {icp.location}, {icp.country}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* ICP Segment with Score */}
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <Badge className={`${color.badge} text-xs font-medium mb-1.5`}>
                                      {icp.title}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                      {icp.description}
                                    </p>
                                  </div>
                                  {/* Conversion Score Badge */}
                                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    <div className={`w-11 h-11 rounded-full ${color.badge} flex items-center justify-center border-2 ${color.border}`}>
                                      <span className="text-sm font-bold">{matchScore}%</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground font-medium">FIT</span>
                                  </div>
                                </div>

                                {/* Pain Points - Icon + Word */}
                                <div className="pt-2 border-t border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                    Key Challenges
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {icp.painPoints.slice(0, 3).map((point, pidx) => {
                                      // Extract first 1-2 words or key term
                                      const shortPoint = point.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
                                      const icons = ['⚠️', '⏱️', '💸', '📉', '🔧', '⚡'];
                                      return (
                                        <div key={pidx} className="flex items-center gap-1">
                                          <span className="text-xs">{icons[pidx % icons.length]}</span>
                                          <span className="text-xs font-medium">{shortPoint}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* LinkedIn Profiles CTA */}
                                <div className="pt-2 border-t border-border/50 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-semibold text-foreground">12+ LinkedIn profiles</span> found
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className={`w-full h-8 text-xs ${color.badge} border-2 ${color.border} hover:shadow-md transition-all`}
                                    onClick={(e) => handleShowProfiles(e, icp)}
                                  >
                                    <Users className="h-3 w-3 mr-1.5" />
                                    Show Profiles
                                  </Button>
                                </div>

                                {/* Hover CTA */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                                    →
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {/* Value Prop Summary with Approval */}
                    {message.component === "value-prop-summary" && message.data && (() => {
                      const data = message.data as { summary: string; valuePropData: ValuePropData; icp: ICP };
                      return (
                        <SummaryApprovalCard
                          summary={data.summary}
                          onContinue={() => handleApproveValuePropSummary({ valuePropData: data.valuePropData, icp: data.icp })}
                          onRegenerate={handleRegenerateValueProp}
                          continueButtonText="Show Value Prop Builder →"
                          regenerateButtonText="Regenerate"
                        />
                      );
                    })()}

                    {/* Value Prop Builder */}
                    {message.component === "value-prop" && message.data && (() => {
                      const data = message.data as ValuePropData;
                      const activeConv = conversations.find(c => c.id === activeConversationId);
                      return (
                        <ValuePropBuilderWrapper
                          valuePropData={data}
                          websiteUrl={websiteUrl}
                          conversationId={activeConversationId}
                          factsJson={activeConv?.memory.factsJson}
                          onVariationsGenerated={(updatedData) => handleVariationsGenerated(updatedData, data.icp)}
                          onConfirmValueProp={handleConfirmValueProp}
                        />
                      );
                    })()}

                    {/* Positioning Summary with Approval */}
                    {message.component === "positioning-summary" && message.data && (() => {
                      const data = message.data as { summary: string; icp: ICP; valuePropData: ValuePropData };
                      return (
                        <SummaryApprovalCard
                          summary={data.summary}
                          onContinue={() => handleApprovePositioningSummary({ icp: data.icp, valuePropData: data.valuePropData })}
                          continueButtonText="Show My Positioning →"
                          showRegenerateButton={false}
                        />
                      );
                    })()}

                    {/* Persona Showcase */}
                    {message.component === "persona-showcase" && message.data && (() => {
                      const showcaseData = message.data as { personas: ICP[]; selectedPersonaId: string; valuePropData: Record<string, ValuePropData> };
                      return (
                        <PersonaShowcase
                          personas={showcaseData.personas}
                          selectedPersonaId={showcaseData.selectedPersonaId}
                          valuePropData={showcaseData.valuePropData}
                          onPersonaChange={(personaId) => {
                            // Update the message data to reflect new selection
                            setConversations(prev =>
                              prev.map(conv =>
                                conv.id === activeConversationId
                                  ? {
                                      ...conv,
                                      messages: conv.messages.map(m =>
                                        m.id === message.id
                                          ? { ...m, data: { ...showcaseData, selectedPersonaId: personaId } }
                                          : m
                                      ),
                                    }
                                  : conv
                              )
                            );
                          }}
                          onExport={handleExport}
                          onContinue={(persona) => handleContinueToOutreach(persona)}
                          onGenerateLinkedIn={(persona) => handleContinueToLinkedIn(persona)}
                          onGenerateEmail={(persona) => handleContinueToEmail(persona)}
                          readOnly={false}
                        />
                      );
                    })()}

                    {/* Outreach Choice (Email vs LinkedIn) */}
                    {message.component === "outreach-choice" && message.data && (() => {
                      const data = message.data as { icp: ICP };
                      return (
                        <OutreachChoice
                          onSelect={(choice) => handleOutreachChoice(choice, data.icp)}
                        />
                      );
                    })()}

                    {/* LinkedIn Type Choice */}
                    {message.component === "linkedin-type-choice" && message.data && (() => {
                      const data = message.data as { icp: ICP };
                      return (
                        <LinkedInTypeChoice
                          onSelect={(type) => handleLinkedInTypeChoice(type, data.icp)}
                        />
                      );
                    })()}

                    {/* Email Type Choice */}
                    {message.component === "email-type-choice" && message.data && (() => {
                      const data = message.data as { icp: ICP };
                      return (
                        <EmailTypeChoice
                          onSelect={(type) => handleEmailTypeChoice(type, data.icp)}
                        />
                      );
                    })()}

                    {/* Sequence Length Choice */}
                    {message.component === "sequence-length-choice" && message.data && (() => {
                      const data = message.data as { icp: ICP };
                      return (
                        <SequenceLengthChoice
                          onSelect={(days) => handleSequenceLengthChoice(days, data.icp)}
                        />
                      );
                    })()}

                    {/* Email Sequence */}
                    {message.component === "email-sequence" && message.data && (() => {
                      const data = message.data as { sequence: EmailSequenceData; icp: ICP; days: number };
                      return (
                        <EmailSequenceCard
                          data={data.sequence}
                          personaTitle={data.icp.title}
                        />
                      );
                    })()}

                    {/* One-Time Email */}
                    {message.component === "one-time-email" && message.data && (() => {
                      const data = message.data as { email: OneTimeEmailData; icp: ICP };
                      return (
                        <OneTimeEmailCard
                          data={data.email}
                          personaTitle={data.icp.title}
                        />
                      );
                    })()}

                    {/* LinkedIn Outreach */}
                    {message.component === "linkedin-outreach" && message.data && (() => {
                      const data = message.data as any;
                      
                      // Check if it's a sequence format (has outreach.messages)
                      if (data.outreach?.messages) {
                        return (
                          <LinkedInOutreachCard
                            data={data.outreach}
                            personaTitle={data.icp?.title || 'Unknown Persona'}
                          />
                        );
                      }
                      
                      // Check if it's single content format (has content or type)
                      if (data.content || data.type) {
                        return (
                          <LinkedInSingleContentCard
                            content={data.content}
                            type={data.type}
                            hashtags={data.suggestedHashtags}
                            callToAction={data.callToAction}
                            sourceFactIds={data.sourceFactIds}
                            personaTitle={data.icp?.title || 'Unknown Persona'}
                          />
                        );
                      }
                      
                      // Fallback for unexpected format
                      return (
                        <Card className="p-6 text-center">
                          <p className="text-muted-foreground">
                            Unable to display LinkedIn content. Please regenerate.
                          </p>
                        </Card>
                      );
                    })()}


                  </div>
                )}
              </div>
            ))}

            {isLoading && !activeConversation?.messages.some(m => 
              m.content.includes("🔍") || 
              m.content.includes("✨") || 
              m.content.includes("🧠")
            ) && (
              <div className="flex items-start gap-2">
                <Loader2 className="h-4 w-4 animate-spin mt-1" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 pb-3 sm:pb-4">
          <form
            data-chat-form
            onSubmit={handleSendMessage}
            className="relative w-full rounded-3xl border bg-background p-2.5 sm:p-3 shadow-sm"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !websiteUrl
                  ? "Enter a website URL to analyze..."
                  : selectedIcp
                  ? "Ask me to refine the page..."
                  : "What would you like to do?"
              }
              disabled={isLoading}
              className="border-0 pr-11 sm:pr-12 focus-visible:ring-0 bg-transparent text-sm sm:text-base"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0"
            >
              {isLoading ? (
                <span className="h-3 w-3 rounded-sm bg-white" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* LinkedIn Profiles Drawer */}
      <LinkedInProfileDrawer
        open={showProfilesDrawer}
        onOpenChange={setShowProfilesDrawer}
        icp={selectedProfilesICP}
        profiles={linkedInProfiles}
        loading={loadingProfiles}
      />

      {/* Memory Status Indicator */}
      {activeConversationId && (
        <MemoryStatusIndicator conversationId={activeConversationId} />
      )}
    </div>
  );
}

// Wrap in Suspense to handle useSearchParams() during build
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
