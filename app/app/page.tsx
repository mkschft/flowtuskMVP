"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUp, Plus, MessageSquare, Sparkles, Search, Brain, Wand2, ChevronDown, Check, Users, MapPin, CheckCircle2, Menu, Trash2, Settings } from "lucide-react";
import { LinkedInProfileDrawer } from "@/components/LinkedInProfileDrawer";
import { ValuePropBuilderWrapper } from "@/components/ValuePropBuilderWrapper";
import { PersonaShowcase } from "@/components/PersonaShowcase";
import { type ExportFormat } from "@/components/ExportOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SystemMessage } from "@/components/ui/system-message";
import { SummaryApprovalCard } from "@/components/SummaryApprovalCard";
import { nanoid } from "nanoid";
import { flowsClient, type Flow } from "@/lib/flows-client";
import { createClient } from "@/lib/supabase/client";
import { fetchWithRetry } from "@/lib/utils/fetch-with-retry";
import Image from "next/image";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFlowsSkeleton } from "@/components/LoadingFlowsSkeleton";
// New Hero UI Components
import { HeroICPCard } from "@/components/HeroICPCard";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ExpandedResults } from "@/components/ExpandedResults";
import { PromptIterator } from "@/components/PromptIterator";
import type {
  ICP,
  LinkedInProfile,
  ThinkingStep,
  ValuePropData,
  ChatMessage,
  GenerationStep,
  GeneratedContent,
  GenerationState,
  UserJourney,
  ConversationMemory,
  Conversation,
} from "./types";
import { generationManager } from "@/lib/generation-manager";
import { ThinkingBlock } from "@/components/app/ThinkingBlock";
import { SmartButton } from "@/components/app/SmartButton";
import { MemoryStatusIndicator } from "@/components/app/MemoryStatusIndicator";
import { AppSidebar } from "@/components/AppSidebar";
import { initializeCache, invalidateFlowCache } from "@/lib/utils/cache-manager";

type OldGenerationState = {
  currentStep: GenerationStep;
  completedSteps: string[];
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  generationId?: string;
  lastGenerationTime?: Date;
};

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
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure Sheet only renders on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // DB Integration states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false); // Track guest mode for data persistence

  // New Hero UI states
  const useHeroUI = process.env.NEXT_PUBLIC_USE_HERO_UI === 'true';
  const [analysisStep, setAnalysisStep] = useState<'fetching' | 'extracting' | 'generating' | 'finalizing'>('fetching');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showExpandedResults, setShowExpandedResults] = useState(false);
  const [heroICP, setHeroICP] = useState<ICP | null>(null);
  const [allICPs, setAllICPs] = useState<ICP[]>([]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Check auth and load flows from DB on mount
  useEffect(() => {
    checkAuthAndLoadFlows();
  }, []);

  // Handle deep linking to conversation via ?c=ID
  useEffect(() => {
    const conversationId = searchParams.get('c');
    if (conversationId && conversations.length > 0) {
      const targetConv = conversations.find(c => c.id === conversationId);
      if (targetConv && targetConv.id !== activeConversationId) {
        console.log(`🔗 [Deep Link] Switching to conversation: ${conversationId}`);
        setActiveConversationId(conversationId);
        setWebsiteUrl(targetConv.memory.websiteUrl || "");
        setSelectedIcp(targetConv.memory.selectedIcp);
      }
    }
  }, [searchParams, conversations, activeConversationId]);


  async function checkAuthAndLoadFlows() {
    try {
      // ✅ Initialize cache management (checks version, clears if stale)
      await initializeCache();

      // Check if there's a URL param from landing page to preserve
      const urlParams = new URLSearchParams(window.location.search);
      const urlParam = urlParams.get('url');

      // ✅ CLEANUP: Clear all state first for fresh start
      console.log('🧹 [Init] Clearing state for fresh start...', { urlParam });
      setConversations([]);
      setActiveConversationId("");
      // Only clear input if there's no pending URL param to process
      if (!urlParam) {
        setInput("");
      }
      setWebsiteUrl("");
      setSelectedIcp(null);
      setIsLoading(false);
      setAnalysisStep('fetching');
      setAnalysisProgress(0);
      setShowExpandedResults(false);
      setHeroICP(null);
      setAllICPs([]);

      // Check auth
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      setUser(authUser);

      // Guest mode: Allow unauthenticated users to experience the product
      if (!authUser) {
        console.log('👤 [Auth] Guest mode - allowing product experience without login');
        setIsGuest(true);
        setAuthLoading(false);

        // Load any existing guest data from localStorage
        const savedConversations = localStorage.getItem('flowtusk_guest_conversations');
        const savedActiveId = localStorage.getItem('flowtusk_guest_active_id');

        if (savedConversations) {
          try {
            const parsed = JSON.parse(savedConversations);
            console.log(`📦 [Guest] Loaded ${parsed.length} conversations from localStorage`);
            setConversations(parsed);
            if (savedActiveId) {
              setActiveConversationId(savedActiveId);
              const activeConv = parsed.find((c: any) => c.id === savedActiveId);
              if (activeConv) {
                setWebsiteUrl(activeConv.memory?.websiteUrl || "");
                setSelectedIcp(activeConv.memory?.selectedIcp || null);
              }
            }
          } catch (error) {
            console.error('❌ [Guest] Failed to load saved conversations:', error);
          }
        }
        return;
      }

      console.log('✅ [Auth] User authenticated');
      setIsGuest(false);

      // Check for guest data to migrate (returns pending redirect if any)
      const pendingRedirect = await migrateGuestDataToDb();

      // Load flows from DB (this will populate conversations)
      await loadFlowsFromDB();
      setAuthLoading(false);

      // If there's a pending redirect from guest session, navigate to it
      if (pendingRedirect) {
        console.log(`🔗 [Auth] Redirecting to pending URL: ${pendingRedirect}`);
        router.push(pendingRedirect);
        return;
      }
    } catch (error) {
      console.error('❌ [Init] Failed to initialize:', error);
      setAuthLoading(false);
    }
  }

  const realtimeChannelRef = useRef<any>(null);
  const thinkingMsgIdRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false); // ✅ Prevent duplicate submissions

  // Migrate guest data to database after user authenticates
  // Returns the pending redirect URL if one exists, or null
  async function migrateGuestDataToDb(): Promise<string | null> {
    try {
      const savedConversations = localStorage.getItem('flowtusk_guest_conversations');
      const pendingRedirect = localStorage.getItem('flowtusk_pending_redirect');

      if (!savedConversations) {
        console.log('📦 [Migration] No guest data to migrate');
        // Still check for pending redirect even if no conversations to migrate
        if (pendingRedirect) {
          localStorage.removeItem('flowtusk_pending_redirect');
          return pendingRedirect;
        }
        return null;
      }

      const guestConversations = JSON.parse(savedConversations) as Conversation[];
      if (guestConversations.length === 0) {
        console.log('📦 [Migration] Guest conversations array is empty');
        if (pendingRedirect) {
          localStorage.removeItem('flowtusk_pending_redirect');
          return pendingRedirect;
        }
        return null;
      }

      console.log(`🔄 [Migration] Migrating ${guestConversations.length} guest conversation(s) to database...`);

      // Track the new flow ID for the active conversation (for redirect URL update)
      let migratedFlowId: string | null = null;
      const savedActiveId = localStorage.getItem('flowtusk_guest_active_id');

      // Migrate each conversation that has actual data (factsJson or messages)
      for (const conv of guestConversations) {
        // Only migrate conversations that have been used (have factsJson or websiteUrl)
        if (!conv.memory?.websiteUrl && !conv.memory?.factsJson) {
          console.log(`⏭️ [Migration] Skipping empty conversation: ${conv.id.slice(0, 8)}`);
          continue;
        }

        try {
          const title = conv.title || (conv.memory?.websiteUrl ? new URL(conv.memory.websiteUrl).hostname : 'Untitled');

          // Create flow in database
          const { flow, isNew } = await flowsClient.findOrCreateFlow({
            title,
            website_url: conv.memory?.websiteUrl || undefined,
            facts_json: conv.memory?.factsJson || undefined,
            step: conv.userJourney?.valuePropGenerated ? 'value_prop' :
              conv.userJourney?.icpSelected ? 'icp_selected' :
                conv.userJourney?.websiteAnalyzed ? 'analyzed' : 'initial',
          });

          // Update flow with any missing data
          await flowsClient.updateFlow(flow.id, {
            facts_json: conv.memory?.factsJson ?? undefined,
            selected_icp: conv.memory?.selectedIcp ?? undefined,
            generated_content: {
              messages: conv.messages,
              generationState: conv.generationState,
              userJourney: conv.userJourney,
            },
          });

          // Extract ICP data from conversation messages to create brand_manifest
          const icpMessage = conv.messages.find(m => m.component === 'icps');
          const icps = icpMessage?.data as ICP[] | undefined;
          const selectedIcp = conv.memory?.selectedIcp;

          // If we have ICP data and a selected ICP, create the brand_manifest
          if (icps && icps.length > 0 && selectedIcp) {
            console.log(`📋 [Migration] Creating brand manifest for flow: ${flow.id.slice(0, 8)}`);

            try {
              const hostname = conv.memory?.websiteUrl
                ? new URL(conv.memory.websiteUrl).hostname.replace(/^www\./, '')
                : title;

              // Build manifest from conversation data
              const manifestData = {
                flowId: flow.id,
                manifest: {
                  version: "1.0",
                  brandName: hostname,
                  brandKey: flow.id.slice(0, 8).toUpperCase(),
                  lastUpdated: new Date().toISOString(),
                  strategy: {
                    icps: icps.map((icp: ICP) => ({
                      id: icp.id,
                      title: icp.title,
                      description: icp.description,
                      personaName: icp.personaName,
                      personaRole: icp.personaRole,
                      personaCompany: icp.personaCompany,
                      location: icp.location,
                      country: icp.country,
                      painPoints: icp.painPoints || [],
                      goals: icp.goals || [],
                      demographics: icp.demographics || ''
                    })),
                    persona: {
                      id: selectedIcp.id,
                      name: selectedIcp.personaName,
                      role: selectedIcp.personaRole,
                      company: selectedIcp.personaCompany,
                      industry: selectedIcp.title,
                      location: selectedIcp.location,
                      country: selectedIcp.country,
                      painPoints: selectedIcp.painPoints || [],
                      goals: selectedIcp.goals || []
                    },
                    valueProp: conv.generationState?.generatedContent?.valueProp || {}
                  },
                  identity: { colors: { primary: [], secondary: [], accent: [], neutral: [] }, typography: {}, logo: {}, tone: {} },
                  components: { buttons: {}, cards: {}, inputs: {}, spacing: {} },
                  previews: { landingPage: {} },
                  metadata: {
                    generationHistory: [{
                      timestamp: new Date().toISOString(),
                      action: 'migrated_from_guest',
                      changedFields: ['strategy']
                    }],
                    regenerationCount: 0,
                    sourceFlowId: flow.id,
                    sourceIcpId: selectedIcp.id
                  }
                }
              };

              // Save brand manifest
              const manifestRes = await fetch("/api/brand-manifest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(manifestData),
              });

              if (manifestRes.ok) {
                console.log(`✅ [Migration] Brand manifest created for flow: ${flow.id.slice(0, 8)}`);
              } else {
                const error = await manifestRes.json().catch(() => ({}));
                console.warn(`⚠️ [Migration] Brand manifest creation failed:`, error);
              }
            } catch (manifestErr) {
              console.error(`❌ [Migration] Failed to create brand manifest:`, manifestErr);
            }
          }

          // Track the migrated flow ID for the active conversation
          if (conv.id === savedActiveId) {
            migratedFlowId = flow.id;
            console.log(`📌 [Migration] Active conversation migrated to flow: ${flow.id.slice(0, 8)}`);
          }

          console.log(`✅ [Migration] ${isNew ? 'Created' : 'Updated'} flow for: ${title} (${flow.id.slice(0, 8)})`);
        } catch (err) {
          console.error(`❌ [Migration] Failed to migrate conversation: ${conv.id.slice(0, 8)}`, err);
        }
      }

      // Clear guest data from localStorage after successful migration
      localStorage.removeItem('flowtusk_guest_conversations');
      localStorage.removeItem('flowtusk_guest_active_id');
      localStorage.removeItem('flowtusk_pending_redirect');
      console.log('✅ [Migration] Guest data cleared from localStorage');

      // Update the pending redirect URL with the new flow ID if available
      if (pendingRedirect && migratedFlowId) {
        try {
          const url = new URL(pendingRedirect, window.location.origin);
          url.searchParams.set('flowId', migratedFlowId);
          const updatedRedirect = url.pathname + url.search;
          console.log(`🔗 [Migration] Updated redirect URL with new flow ID: ${updatedRedirect}`);
          return updatedRedirect;
        } catch (e) {
          console.error('❌ [Migration] Failed to update redirect URL:', e);
          return pendingRedirect;
        }
      }

      return pendingRedirect;

    } catch (error) {
      console.error('❌ [Migration] Failed to migrate guest data:', error);
      // Don't fail silently - keep guest data for retry
      return null;
    }
  }

  async function loadFlowsFromDB() {
    try {
      setIsLoading(true);
      console.log('🔍 [DB] Loading flows from database...');

      const flows = await flowsClient.listFlows();
      console.log(`✅ [DB] Loaded ${flows.length} flows from database`);

      // Debug: Track evidence chain in loaded flows
      flows.forEach((flow, idx) => {
        const facts = (flow.facts_json as any)?.facts || [];
        const icpEvidence = (flow.selected_icp as any)?.evidence || [];
        if (facts.length > 0 || icpEvidence.length > 0) {
          console.log(`📎 [Evidence] Flow ${idx + 1}: ${facts.length} facts, ICP has ${icpEvidence.length} evidence links`);
        }
      });

      // Convert Flow to Conversation format
      const conversations = flows.map(flowToConversation);

      // ✅ Enhanced deduplication: Remove duplicates by ID AND by website_url
      const seenIds = new Set<string>();
      const seenUrls = new Map<string, string>(); // url -> id (keep most recent)
      const duplicateIds = new Set<string>();
      const duplicateUrls = new Set<string>();

      // Sort by createdAt DESC to keep most recent when duplicates found
      const sortedConversations = [...conversations].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      const uniqueConversations = sortedConversations.filter(conv => {
        // Check ID duplicates
        if (seenIds.has(conv.id)) {
          duplicateIds.add(conv.id);
          return false;
        }
        seenIds.add(conv.id);

        // Check URL duplicates (keep the most recent)
        const url = conv.memory?.websiteUrl;
        if (url) {
          const existingId = seenUrls.get(url);
          if (existingId && existingId !== conv.id) {
            duplicateUrls.add(url);
            console.warn(`⚠️ [DB] Duplicate URL found: ${url}, keeping most recent (${conv.id})`);
            return false; // Remove older duplicate
          }
          seenUrls.set(url, conv.id);
        }

        return true;
      });

      if (duplicateIds.size > 0) {
        console.warn(`⚠️ [DB] Found ${duplicateIds.size} duplicate conversation IDs:`, Array.from(duplicateIds));
      }
      if (duplicateUrls.size > 0) {
        console.warn(`⚠️ [DB] Found ${duplicateUrls.size} duplicate URLs:`, Array.from(duplicateUrls));
      }

      setConversations(uniqueConversations);

      if (uniqueConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(uniqueConversations[0].id);
      }
    } catch (error) {
      console.error('❌ [DB] Failed to load flows:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function flowToConversation(flow: Flow): Conversation {
    const generatedContent = (flow.generated_content as any) || {};

    return {
      id: flow.id,
      title: flow.title,
      messages: generatedContent.messages || [],
      createdAt: new Date(flow.created_at),
      generationState: generatedContent.generationState || {
        currentStep: 'analysis',
        completedSteps: [],
        generatedContent: {},
        isGenerating: false,
        generationId: undefined,
        lastGenerationTime: undefined,
      },
      userJourney: generatedContent.userJourney || {
        websiteAnalyzed: false,
        icpSelected: false,
        valuePropGenerated: false,
        exported: false,
      },
      memory: {
        id: flow.id,
        websiteUrl: flow.website_url || '',
        websiteContent: undefined,
        factsJson: (flow as any).facts_json ?? (flow as any).website_analysis,
        selectedIcp: flow.selected_icp as any,
        generationHistory: generatedContent.generationHistory || [],
        userPreferences: generatedContent.userPreferences || {
          preferredContentType: '',
          lastAction: '',
        },
      },
    };
  }

  // Auto-save to DB whenever conversation changes (debounced)
  useEffect(() => {
    if (!activeConversationId || conversations.length === 0) {
      return;
    }

    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;

    // Skip DB autosave during generation to reduce write noise
    if (conversation.generationState?.isGenerating) {
      return;
    }

    // Only auto-save if conversation has messages (meaning it's been initialized)
    // This prevents trying to update flows that don't exist in DB yet
    if (conversation.messages.length > 0) {
      debouncedSaveToDb(conversation);
    }
  }, [conversations, activeConversationId]);

  async function debouncedSaveToDb(conversation: Conversation) {
    try {
      // Skip DB auto-save for guests - they use localStorage instead
      if (isGuest) {
        console.log(`👤 [Guest] Skipping DB auto-save - using localStorage`);
        return;
      }

      // Skip auto-save if conversation ID is not a UUID (still local nanoid)
      // UUIDs are 36 chars with dashes (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      // nanoids are shorter (typically 21 chars, no dashes)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversation.id);
      if (!isUUID) {
        console.log(`⏭️ [DB Save] Skipping auto-save for local-only conversation (ID: ${conversation.id.slice(0, 8)}..., not yet in DB)`);
        return;
      }

      console.log(`💾 [DB Save] Auto-saving flow ${conversation.id.slice(0, 8)}... (UUID confirmed)`);

      // Debug: Track evidence chain integrity
      if (conversation.memory.factsJson) {
        const facts = (conversation.memory.factsJson as any)?.facts || [];
        console.log(`💾 [DB Save] Flow ${conversation.id.slice(0, 8)}: ${facts.length} facts with evidence`);
      }
      if (conversation.memory.selectedIcp) {
        const evidence = (conversation.memory.selectedIcp as any)?.evidence || [];
        console.log(`💾 [DB Save] Selected ICP has ${evidence.length} evidence links`);
      }

      // Sanitize data before saving to avoid size issues
      // Ensure generationState exists with defaults
      const safeGenerationState = conversation.generationState || {
        currentStep: 'analysis',
        completedSteps: [],
        generatedContent: {},
        isGenerating: false,
        generationId: undefined,
        lastGenerationTime: undefined,
      };

      const sanitizedGeneratedContent = {
        // Preserve all message data - needed for rendering components (icps, value-prop, persona-showcase, etc.)
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          component: msg.component,
          // Preserve message.data completely - all components depend on it for rendering
          data: msg.data,
          thinking: msg.thinking
        })),
        generationState: {
          ...safeGenerationState,
          // Preserve generatedContent completely - used for restoration and regeneration
          generatedContent: safeGenerationState.generatedContent || {}
        },
        userJourney: conversation.userJourney || {
          websiteAnalyzed: false,
          icpSelected: false,
          valuePropGenerated: false,
          exported: false,
        },
        generationHistory: (conversation.memory?.generationHistory || []).slice(-10), // Keep only last 10
        userPreferences: conversation.memory?.userPreferences || {
          preferredContentType: '',
          lastAction: '',
        },
      };

      await flowsClient.debouncedUpdate(conversation.id, {
        // Don't update title to avoid 409 conflicts with other flows
        // (title is set once during creation via findOrCreateFlow)
        // Always include website_url if available (important for data integrity)
        website_url: conversation.memory.websiteUrl || undefined,
        facts_json: conversation.memory.factsJson,
        selected_icp: conversation.memory.selectedIcp ?? undefined,
        generated_content: sanitizedGeneratedContent,
        step: determineCurrentStep(conversation),
      });

      console.log('💾 [DB] Auto-saved to database');
    } catch (error) {
      console.error('❌ [DB] Auto-save failed:', error);
      // Don't disrupt user experience, just log the error
    }
  }

  function determineCurrentStep(conversation: Conversation): string {
    const journey = conversation.userJourney;

    if (journey.exported) return 'exported';
    if (journey.valuePropGenerated) return 'value_prop';
    if (journey.icpSelected) return 'icp_selected';
    if (journey.websiteAnalyzed) return 'analyzed';

    return 'initial';
  }

  // Handle URL from landing page on mount
  useEffect(() => {
    const urlParam = searchParams.get('url');
    console.log('🔍 [URL Param Check]', {
      urlParam,
      hasProcessedUrlParam,
      authLoading,
      conversationsCount: conversations.length,
      willProcess: !!(urlParam && !hasProcessedUrlParam && !authLoading)
    });

    // Wait for auth to complete before processing URL param
    if (urlParam && !hasProcessedUrlParam && !authLoading) {
      console.log('✅ [URL Param] Processing URL from landing page:', urlParam);
      setHasProcessedUrlParam(true);
      // Pre-fill the input with URL from landing page
      setInput(urlParam);
      // Set flag to trigger auto-submit after input state updates
      setShouldAutoSubmit(true);
      console.log('🎯 [URL Param] Input set, auto-submit flag enabled');
    }
  }, [searchParams, hasProcessedUrlParam, authLoading]);

  // Handle flowId parameter to select specific conversation (e.g., when returning from /copilot)
  useEffect(() => {
    const flowIdParam = searchParams.get('flowId');

    if (flowIdParam && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === flowIdParam);

      if (conversation && activeConversationId !== flowIdParam) {
        console.log('🔗 [Flow Param] Selecting conversation from flowId:', flowIdParam);
        setActiveConversationId(flowIdParam);
        setWebsiteUrl(conversation.memory.websiteUrl || "");
        setSelectedIcp(conversation.memory.selectedIcp);

        // Clean up URL parameter after processing
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('flowId');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, conversations, activeConversationId]);

  // Auto-save guest data to localStorage whenever conversations change
  useEffect(() => {
    if (isGuest && conversations.length > 0) {
      try {
        localStorage.setItem('flowtusk_guest_conversations', JSON.stringify(conversations));
        if (activeConversationId) {
          localStorage.setItem('flowtusk_guest_active_id', activeConversationId);
        }
        console.log('💾 [Guest] Auto-saved conversations to localStorage');
      } catch (e) {
        console.error('❌ [Guest] Failed to auto-save:', e);
      }
    }
  }, [isGuest, conversations, activeConversationId]);

  // Auto-submit after input is set from URL param
  useEffect(() => {
    console.log('🔄 [Auto-Submit Check]', {
      shouldAutoSubmit,
      input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
      inputLength: input.length,
      willSubmit: !!(shouldAutoSubmit && input.trim())
    });

    if (shouldAutoSubmit && input.trim()) {
      console.log('🚀 [Auto-Submit] Triggering form submission...');
      // Reset flag to prevent duplicate submissions
      setShouldAutoSubmit(false);

      // Retry finding the form with a delay to ensure it's rendered
      const attemptSubmit = (attempts = 0) => {
        const form = document.querySelector('form[data-chat-form]');
        if (form) {
          console.log('✅ [Auto-Submit] Form found, calling requestSubmit()');
          (form as HTMLFormElement).requestSubmit();
        } else if (attempts < 10) {
          // Retry up to 10 times with 100ms delay
          console.log(`⏳ [Auto-Submit] Form not found, retrying... (attempt ${attempts + 1})`);
          setTimeout(() => attemptSubmit(attempts + 1), 100);
        } else {
          console.error('❌ [Auto-Submit] Form not found after 10 attempts!');
        }
      };

      attemptSubmit();
    }
  }, [input, shouldAutoSubmit]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const createNewConversation = async () => {
    try {
      // ✅ Don't create DB flow yet - just create local conversation
      // DB flow will be created when user analyzes a URL
      const newConv: Conversation = {
        id: nanoid(),
        title: `New conversation ${new Date().toLocaleDateString()}`,
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
          id: '',
          websiteUrl: '',
          factsJson: undefined,
          selectedIcp: null,
          generationHistory: [],
          userPreferences: {
            preferredContentType: '',
            lastAction: '',
          },
        },
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setSelectedIcp(null);
      setWebsiteUrl("");

      console.log('✅ [Conversation] Created new local conversation (no DB flow yet)');
      return newConv.id;
    } catch (error) {
      console.error('❌ [Conversation] Failed to create:', error);
      return null;
    }
  };

  const deleteConversation = async (convId: string) => {
    console.log(`🗑️ [DELETE] deleteConversation called for: ${convId}`);
    try {
      // Only try to delete from DB if it's a UUID (exists in database)
      // Local-only conversations (nanoids) don't need DB deletion
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(convId);

      if (isUUID) {
        // Soft delete in DB
        await flowsClient.softDeleteFlow(convId);
        console.log(`🗑️ [DB] Soft deleted flow: ${convId}`);

        // Invalidate cache for this flow
        invalidateFlowCache(convId);
      } else {
        console.log(`🗑️ [Conversation] Deleting local-only conversation (not in DB): ${convId}`);
      }

      // Remove from UI
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== convId);

        // If we deleted the active conversation, switch to another one
        if (convId === activeConversationId) {
          // Try to switch to the next conversation, or create a new one if none exist
          if (filtered.length > 0) {
            const nextConv = filtered[0];
            setActiveConversationId(nextConv.id);
            setWebsiteUrl(nextConv.memory.websiteUrl || "");
            setSelectedIcp(nextConv.memory.selectedIcp);
          } else {
            setTimeout(() => createNewConversation(), 0);
          }
        }

        console.log(`🗑️ [Conversation] Deleted conversation: ${convId}`);
        return filtered;
      });
    } catch (error) {
      console.error('❌ [DB] Failed to delete flow:', error);
      setConversations(prev => prev.filter(c => c.id !== convId));
    }
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

  // Targeted add to avoid race when conversation ID changes (e.g., after flow creation)
  const addMessageTo = (conversationId: string, message: ChatMessage) => {
    setConversations(prev => {
      const found = prev.findIndex(c => c.id === conversationId);
      if (found === -1) {
        console.warn(`⚠️ [addMessageTo] Conversation ${conversationId} not found! Message dropped:`, {
          messageContent: message.content?.substring(0, 100),
          messageComponent: message.component,
          availableConversations: prev.map(c => c.id)
        });
        return prev;
      }
      console.log(`✅ [addMessageTo] Adding to ${conversationId}:`, message.component || message.content?.substring(0, 50));
      return prev.map((conv, idx) =>
        idx === found ? { ...conv, messages: [...conv.messages, message] } : conv
      );
    });
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
  const updateUserJourneyFor = (conversationId: string, updates: Partial<UserJourney>) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, userJourney: { ...conv.userJourney, ...updates } }
          : conv
      )
    );
  };


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

    // All actions are allowed if generation is not in progress
    return !generationState.isGenerating;
  };


  const updateThinkingStep = (messageId: string, stepId: string, updates: Partial<ThinkingStep>) => {
    // Update by messageId across conversations to be resilient to ID changes
    setConversations(prev =>
      prev.map(conv => ({
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
      }))
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

    // ✅ Prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.warn('⚠️ [Submit] Already processing, ignoring duplicate submission');
      return;
    }

    console.log('📨 [handleSendMessage] Called with input:', input.substring(0, 100) + (input.length > 100 ? '...' : ''));
    console.log('📊 [handleSendMessage] State:', { inputLength: input.length, isLoading, hasInput: !!input.trim() });

    if (!input.trim() || isLoading) {
      console.warn('⚠️ [handleSendMessage] Skipping - no input or already loading');
      return;
    }

    // Mark as submitting
    isSubmittingRef.current = true;

    // Ensure we have an active conversation and get the ID
    const convId = ensureActiveConversation();
    console.log('✅ [handleSendMessage] Active conversation ID:', convId);

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
      // Match URLs with or without protocol
      const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*/;
      if (urlPattern.test(userInput)) {
        let url = userInput.match(urlPattern)?.[0] || "";

        // Normalize URL to ensure it has a protocol
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }

        setWebsiteUrl(url);
        updateConversationTitle(new URL(url).hostname);

        // Create thinking message with all steps
        const thinkingMsgId = nanoid();
        thinkingMsgIdRef.current = thinkingMsgId;
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

        // Add timeout to prevent indefinite hangs (120s timeout - industry standard for web scraping)
        console.log('⏱️ [Fetch] Starting website analysis with 120s timeout:', url);
        const controller = new AbortController();
        setCurrentAbortController(controller);

        let content: string;
        let metadata: any;
        let factsJson: any;
        let wasCached = false;

        // Check if URL has already been crawled (authenticated users only)
        // Guests skip DB cache check but can still use API-level caching
        let existingCrawl = null;
        if (!isGuest) {
          console.log('🔍 [Cache] Checking if URL already crawled...');
          existingCrawl = await flowsClient.findExistingCrawl(url);
        } else {
          console.log('👤 [Guest] Skipping DB cache check');
        }

        if (existingCrawl && existingCrawl.facts_json) {
          // Reuse existing crawl data
          console.log('✅ [Cache] Found existing crawl, reusing data');
          wasCached = true;
          const analysis = existingCrawl.facts_json as any;
          factsJson = analysis;
          content = 'Cached analysis - raw content not stored'; // Placeholder for UI
          metadata = {
            url: existingCrawl.website_url,
            cached: true,
            heroImage: analysis.brand?.heroImage || null
          };

          // No timeout was created, so just clear the abort controller
          setCurrentAbortController(null);
        } else {
          // Need to scrape - proceed with API call
          console.log('📡 [Cache] No existing crawl found, scraping now...');
          const fetchStartTime = Date.now();

          // Timeout increased to 120s (industry standard: Perplexity uses 180s+)
          const timeoutId = setTimeout(() => {
            const elapsed = Date.now() - fetchStartTime;
            console.error(`⏰ [Timeout] Aborting after ${elapsed}ms (120s limit reached)`);
            controller.abort();
          }, 120000);

          // Progress updates via thinking step substeps for user feedback
          const progress30s = setTimeout(() => {
            updateThinkingStep(thinkingMsgId, 'analyze', {
              status: 'running',
              substeps: ['⏳ Still working - complex websites take up to 2 minutes...', 'Extracting facts with AI...']
            });
          }, 30000);

          const progress60s = setTimeout(() => {
            updateThinkingStep(thinkingMsgId, 'analyze', {
              status: 'running',
              substeps: ['⏳ Almost there - extracting final details...', 'Processing with GPT-4...']
            });
          }, 60000);

          const progress90s = setTimeout(() => {
            updateThinkingStep(thinkingMsgId, 'analyze', {
              status: 'running',
              substeps: ['⏳ Taking longer than usual - large website...', 'Still processing...']
            });
          }, 90000);

          let analyzeRes;
          try {
            analyzeRes = await fetchWithRetry("/api/analyze-website", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
              signal: controller.signal,
            }, {
              maxRetries: 5,
              onRetry: (attempt, error) => {
                console.log(`🔄 [Retry] Attempt ${attempt}/5:`, error.message);
                updateThinkingStep(thinkingMsgId, 'analyze', {
                  status: 'running',
                  substeps: [`🔄 Connection interrupted - retrying (${attempt}/5)...`, 'Please wait...']
                });
              }
            });
            const elapsed = Date.now() - fetchStartTime;
            console.log(`✅ [Fetch] Analysis completed in ${elapsed}ms`);
            clearTimeout(timeoutId);
            clearTimeout(progress30s);
            clearTimeout(progress60s);
            clearTimeout(progress90s);
            setCurrentAbortController(null);
          } catch (fetchError) {
            const elapsed = Date.now() - fetchStartTime;
            clearTimeout(timeoutId);
            clearTimeout(progress30s);
            clearTimeout(progress60s);
            clearTimeout(progress90s);
            setCurrentAbortController(null);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              console.error(`❌ [Timeout] Request aborted after ${elapsed}ms`);
              throw new Error("Analysis timed out. Try a simpler website or check your connection.");
            }
            console.error(`❌ [Fetch] Error after ${elapsed}ms:`, fetchError);
            throw fetchError;
          }

          if (!analyzeRes.ok) {
            console.error('❌ [Fetch] Response not OK:', analyzeRes.status, analyzeRes.statusText);
            throw new Error("Failed to analyze website");
          }
          console.log('📦 [Fetch] Parsing response JSON...');
          const response = await analyzeRes.json();
          content = response.content;
          metadata = response.metadata;
          factsJson = response.factsJson;
        }

        const analyzeSubsteps = [
          wasCached
            ? `✅ Using cached analysis (${factsJson?.facts?.length || 0} facts)`
            : `✅ Fetched ${Math.round(content.length / 1000)}k characters`,
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

        // For guests: Use temporary ID and save to localStorage
        // For authenticated users: Create/find flow in database
        let flowId = activeConversationId;
        const hostTitle = new URL(url).hostname;

        if (!isGuest) {
          // Find or create flow in database (prevents duplicates)
          console.log('💾 [Flow] Finding or creating flow in database...');
          const { flow, isNew: flowIsNew } = await flowsClient.findOrCreateFlow({
            title: hostTitle,
            website_url: url,
            facts_json: factsJson || undefined,
            step: 'analyzed'
          });

          if (!flowIsNew && !flow.website_url) {
            console.warn('⚠️ [Flow] Found flow without website_url, should be updated now');
          }

          console.log(`✅ [Flow] ${flowIsNew ? 'Created new' : 'Found existing'} flow with ID:`, flow.id);
          console.log(`🔄 [ID Sync] Updating conversation ID from ${activeConversationId.slice(0, 8)}... to ${flow.id.slice(0, 8)}...`);
          flowId = flow.id;

          // Store flow ID and align conversation ID with DB flow ID
          setConversations(prev => {
            const updated = prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  id: flow.id,
                  memory: {
                    ...conv.memory,
                    id: flow.id,
                    flowId: flow.id,
                    websiteUrl: url,
                  }
                }
                : conv
            );
            console.log(`✅ [ID Sync] Conversation ID updated. Active conversation now has DB ID: ${flow.id.slice(0, 8)}...`);
            return updated;
          });

          // Wait for state update to complete before changing active ID
          setTimeout(() => {
            setActiveConversationId(flow.id);
            console.log(`✅ [ID Sync] Active conversation ID set to: ${flow.id.slice(0, 8)}...`);
          }, 0);

          // Subscribe to realtime updates for this flow
          try {
            const supabase = createClient();
            if (realtimeChannelRef.current) {
              supabase.removeChannel(realtimeChannelRef.current);
              realtimeChannelRef.current = null;
            }
            const channel = supabase.channel(`flow:${flow.id}`)
              .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'positioning_flows', filter: `id=eq.${flow.id}` }, (payload) => {
                const newStep = (payload.new as any)?.step;
                if (!newStep) return;
                const msgId = thinkingMsgIdRef.current;
                if (!msgId) return;
                if (newStep === 'analyzed') {
                  updateThinkingStep(msgId, 'analyze', { status: 'complete' });
                } else if (newStep === 'icps') {
                  updateThinkingStep(msgId, 'generate', { status: 'complete' });
                }
              })
              .subscribe();
            realtimeChannelRef.current = channel;
          } catch { }
        } else {
          // Guest mode: Keep temporary ID and save to localStorage
          console.log('👤 [Guest] Using temporary flow ID:', activeConversationId.slice(0, 8));

          // Update conversation with URL and facts
          setConversations(prev => {
            const updated = prev.map(conv =>
              conv.id === activeConversationId
                ? {
                  ...conv,
                  title: hostTitle,
                  memory: {
                    ...conv.memory,
                    websiteUrl: url,
                    factsJson: factsJson || undefined,
                  }
                }
                : conv
            );

            // Save to localStorage for persistence
            try {
              localStorage.setItem('flowtusk_guest_conversations', JSON.stringify(updated));
              localStorage.setItem('flowtusk_guest_active_id', activeConversationId);
              console.log('💾 [Guest] Saved conversation to localStorage');
            } catch (e) {
              console.error('❌ [Guest] Failed to save to localStorage:', e);
            }

            return updated;
          });
        }

        console.log('🎯 [Flow] Proceeding to Step 2: Extract visuals');
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
            metadata?.heroImage ? `Hero image: ${metadata.heroImage.split('/')[2] || 'found'}` : 'Using gradient fallback',
            'Visual metadata ready'
          ]
        });

        console.log('🎯 [Flow] Proceeding to Step 3: Generate ICPs');
        // Step 3: Generate ICPs
        const icpStart = Date.now();
        updateThinkingStep(thinkingMsgId, 'generate', {
          status: 'running',
          startTime: icpStart,
          substeps: ['Analyzing content patterns...', 'Generating customer profiles with AI (10-20s)...']
        });

        // Prefer SSE; fallback to JSON
        let icps: ICP[] = [] as any;
        let brandColors: any = null;
        let summary: any = null;
        let usedSSE = false;
        try {
          const sseRes = await fetch("/api/generate-icps?stream=1", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
            body: JSON.stringify({ content, factsJson: factsJson || undefined }),
          });
          if (sseRes.ok && (sseRes.headers.get('content-type') || '').includes('text/event-stream')) {
            usedSSE = true;
            const reader = sseRes.body?.getReader();
            const decoder = new TextDecoder();
            if (reader) {
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split("\n\n");
                buffer = events.pop() || "";
                for (const ev of events) {
                  const lines = ev.split("\n");
                  let type = "message"; let dataStr = "{}";
                  for (const line of lines) {
                    if (line.startsWith("event:")) type = line.slice(6).trim();
                    if (line.startsWith("data:")) dataStr = line.slice(5).trim();
                  }
                  if (type === 'progress') {
                    const payload = JSON.parse(dataStr);
                    const msgId = thinkingMsgIdRef.current;
                    if (msgId) {
                      let detail = 'Generating profiles...';
                      switch (payload.step) {
                        case 'received_input': detail = 'Preparing input...'; break;
                        case 'prompt_ready': detail = 'Prompt ready'; break;
                        case 'calling_model': detail = 'Calling AI model...'; break;
                        case 'model_done': detail = 'Model completed'; break;
                        case 'parsing': detail = 'Validating and structuring output...'; break;
                      }
                      updateThinkingStep(msgId, 'generate', { substeps: ['Analyzing content patterns...', detail] });
                    }
                  } else if (type === 'done') {
                    const payload = JSON.parse(dataStr);
                    icps = payload.icps; brandColors = payload.brandColors; summary = payload.summary;
                  } else if (type === 'error') {
                    const payload = JSON.parse(dataStr);
                    throw new Error(payload?.error || 'Generation failed');
                  }
                }
              }
            }
          }
        } catch (e) {
          // fall back
        }
        if (!usedSSE) {
          const icpRes = await fetch("/api/generate-icps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, factsJson: factsJson || undefined }),
          });
          if (!icpRes.ok) throw new Error("Failed to generate ICPs");
          const json = await icpRes.json();
          icps = json.icps; brandColors = json.brandColors; summary = json.summary;
        }

        // Store brand colors
        // Note: brandColors saved for future use

        // Save ICPs to brand_manifests (single source of truth)
        // Note: Only for authenticated users - guests will get this during migration

        // ICPs already have generated IDs from /api/generate-icps
        const icpsWithDbIds = icps;

        // Extract hostname from URL
        const hostname = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

        if (!isGuest) {
          console.log('💾 [ICPs] Saving to brand_manifests...');
          console.log('📋 [ICPs] FlowID:', flowId);
          console.log('🔢 [ICPs] Count:', icps.length);

          // Create/update brand manifest with ICPs
          const saveManifestRes = await fetch("/api/brand-manifest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flowId: flowId,
              manifest: {
                version: "1.0",
                brandName: hostname,
                brandKey: flowId.slice(0, 8).toUpperCase(),
                lastUpdated: new Date().toISOString(),
                strategy: {
                  icps: icps.map((icp: ICP) => ({
                    id: icp.id,
                    title: icp.title,
                    description: icp.description,
                    personaName: icp.personaName,
                    personaRole: icp.personaRole,
                    personaCompany: icp.personaCompany,
                    location: icp.location,
                    country: icp.country,
                    painPoints: icp.painPoints || [],
                    goals: icp.goals || [],
                    demographics: icp.demographics || ''
                  })),
                  persona: {}, // Will be set when user selects an ICP
                  valueProp: {} // Will be generated later
                },
                identity: { colors: brandColors || { primary: [], secondary: [], accent: [], neutral: [] }, typography: {}, logo: {}, tone: {} },
                components: { buttons: {}, cards: {}, inputs: {}, spacing: {} },
                previews: { landingPage: {} },
                metadata: {
                  generationHistory: [{
                    timestamp: new Date().toISOString(),
                    action: 'icps_generated',
                    changedFields: ['strategy.icps']
                  }],
                  regenerationCount: 0,
                  sourceFlowId: flowId,
                  sourceIcpId: ''
                }
              }
            }),
          });

          if (saveManifestRes.ok) {
            console.log('✅ [ICPs] Saved to brand_manifests');

            // Boundary step update -> 'icps' (triggers realtime event)
            try {
              await fetch(`/api/flows/${flowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: 'icps' }),
              });
            } catch { }
          } else {
            const errorData = await saveManifestRes.json().catch(() => ({}));
            console.error('❌ [ICPs] Failed to save to brand_manifests!');
            console.error('   Status:', saveManifestRes.status, saveManifestRes.statusText);
            console.error('   Error:', errorData.error || 'Unknown error');
            console.error('   Details:', errorData.details || 'No details');
            console.warn('⚠️ [ICPs] Continuing with in-memory data');
          }
        } else {
          console.log('👤 [Guest] Skipping brand_manifest save - will be created during migration');
        }

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
        addMessageTo(flowId, {
          id: nanoid(),
          role: "assistant",
          content: summaryText,
        });

        // Show ICP cards with database IDs
        addMessageTo(flowId, {
          id: nanoid(),
          role: "assistant",
          content: "",
          component: "icps",
          data: icpsWithDbIds,
        });

        // For guest users: explicitly save to localStorage after ICP generation
        // This matches the pattern used in website analysis (lines 1210-1217)
        if (isGuest) {
          // Wait for state update to complete, then save
          setTimeout(() => {
            setConversations(prev => {
              const updated = [...prev];

              // Explicit save to localStorage
              try {
                localStorage.setItem('flowtusk_guest_conversations', JSON.stringify(updated));
                localStorage.setItem('flowtusk_guest_active_id', flowId);
                console.log('💾 [Guest] Explicitly saved ICP data to localStorage');
                console.log(`   - Conversation count: ${updated.length}`);
                console.log(`   - Active ID: ${flowId.slice(0, 8)}...`);
                const activeConv = updated.find(c => c.id === flowId);
                if (activeConv) {
                  console.log(`   - Messages in active conv: ${activeConv.messages.length}`);
                  const icpMsg = activeConv.messages.find(m => m.component === 'icps');
                  if (icpMsg) {
                    console.log(`   - ICP message found with ${Array.isArray(icpMsg.data) ? icpMsg.data.length : 0} ICPs`);
                  } else {
                    console.warn('   ⚠️ No ICP message found in conversation!');
                  }
                }
              } catch (e) {
                console.error('❌ [Guest] Failed to save ICP data to localStorage:', e);
              }

              return updated;
            });
          }, 100); // Small delay to ensure addMessageTo state updates have completed
        }

        // Record website analysis completion
        updateUserJourneyFor(flowId, { websiteAnalyzed: true });
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
      console.error("❌❌❌ [Error Caught] ❌❌❌");
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'N/A');
      console.error("Full error object:", error);

      let userMessage = "Something went wrong. Please try again.";

      if (error instanceof Error) {
        // Handle specific error types with helpful messages
        if (error.message.startsWith('TIMEOUT:')) {
          userMessage = `⏱️ **Website Analysis Timeout**\n\n${error.message.replace('TIMEOUT: ', '')}\n\n**Possible reasons:**\n• Website is very slow or unresponsive\n• Complex website with lots of content\n• Network connectivity issues\n\n**Try:**\n• Using a simpler page from the same site\n• Checking if the website loads in your browser\n• Waiting a moment and retrying`;
        } else if (error.message.includes('Failed to analyze')) {
          userMessage = `❌ **Unable to Analyze Website**\n\n**Possible reasons:**\n• Website blocks automated access\n• Invalid or private URL\n• Server returned an error\n\n**Try:**\n• Making sure the URL is correct and publicly accessible\n• Testing with a different website\n• Using the website's homepage URL`;
        } else if (error.message.includes('Failed to generate')) {
          userMessage = `❌ **Generation Failed**\n\n${error.message}\n\nPlease try again or contact support if the problem persists.`;
        } else {
          userMessage = `❌ **Error:** ${error.message}\n\nPlease try again or check your URL. If the problem persists, try a different website.`;
        }
      }

      addMessage({
        id: nanoid(),
        role: "assistant",
        content: userMessage,
      });
    } finally {
      isSubmittingRef.current = false; // ✅ Reset submission guard
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

      // Memory state is already in the conversation object

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

Now let me prepare your complete brand strategy...`;

    addMessage({
      id: nanoid(),
      role: "assistant",
      content: accomplishmentText
    });

    // Show loading message before positioning summary
    addMessage({
      id: nanoid(),
      role: "assistant",
      content: "✨ Building your brand strategy..."
    });

    // Step 2: Show positioning summary card after short delay for readability
    setTimeout(() => {
      const positioningSummary = `Here's your complete brand strategy for **${icp.personaName}** (${icp.title}).

**Persona Match:**
• ${icp.personaRole} at ${icp.personaCompany}
• ${icp.location}, ${icp.country}

**Value Proposition Strategy:**
${valuePropData.summary?.approachStrategy || 'Strategic positioning'}

**Why This Positioning Works:**
${valuePropData.summary?.mainInsight || 'Targeted messaging approach'}

**Impact You Can Expect:**
${valuePropData.summary?.expectedImpact || 'Improved conversion rates'}

Ready to explore your brand strategy?`;

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
    // TODO: Implement regeneration logic
    console.log('🔄 [Regenerate Value Prop] Feature to be implemented');
  };

  // Handler for approving positioning summary
  const handleApprovePositioningSummary = (data: { icp: ICP; valuePropData: ValuePropData }) => {
    // Step 1: Show text explaining what they'll see
    const explanationText = `Here's your complete customer brand strategy 🎯

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

    // Show loading message before persona showcase
    addMessage({
      id: nanoid(),
      role: "assistant",
      content: "📦 Loading your persona showcase..."
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

      // Positioning summary approved
    }, 1000);
  };

  // Handler for Launch Copilot button
  const handleLaunchCopilot = (persona: ICP) => {
    console.log('🚀 [Launch Copilot] Navigating to copilot for:', persona.personaName);
    console.log('🔍 [Launch Copilot] Persona ID:', persona.id);
    console.log('📊 [Launch Copilot] Full persona:', persona);

    const flowId = activeConversation?.id;
    if (!flowId) {
      console.error('❌ [Launch Copilot] No active conversation found');
      return;
    }

    console.log('✅ [Launch Copilot] FlowID:', flowId);
    console.log('🔗 [Launch Copilot] URL:', `/copilot?icpId=${persona.id}&flowId=${flowId}`);

    // CHECK: Is this a temp ID (like "icp-18") or a UUID?
    if (persona.id && !persona.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('❌ [Launch Copilot] PROBLEM: Using temporary ID instead of database UUID!');
      console.error('   This will fail. The persona needs to be saved to database first.');
      alert('Error: Persona not properly saved. Please refresh and try again.');
      return;
    }

    router.push(`/copilot?icpId=${persona.id}&flowId=${flowId}`);
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
  // Sidebar content (reused in desktop & mobile)
  const SidebarContent = () => (
    <AppSidebar
      user={user}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onNewConversation={async () => {
        const newConvId = await createNewConversation();
        // Update URL to trigger deep linking effect
        if (newConvId) {
          router.push(`/app?c=${newConvId}`, { scroll: false });
        }
        setSidebarOpen(false);
      }}
      onSelectConversation={(id: string) => {
        // Update URL first - this will trigger the deep linking useEffect to sync state
        router.push(`/app?c=${id}`, { scroll: false });
        setSidebarOpen(false);
      }}
      onDeleteConversation={deleteConversation}
      onCloseMobileDrawer={() => setSidebarOpen(false)}
      className="h-full border-none"
    />
  );

  // Show loading skeleton while checking auth
  if (authLoading) {
    return <LoadingFlowsSkeleton />;
  }


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

      // Update conversation memory with selected ICP so it persists to DB
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
              ...conv,
              memory: {
                ...conv.memory,
                selectedIcp: icp
              }
            }
            : conv
        )
      );

      updateUserJourney({ icpSelected: true });

      // Navigate to copilot if manifest already exists
      const manifestRes = await fetch(`/api/brand-manifest?flowId=${activeConversationId}`);
      if (manifestRes.ok) {
        const { manifest } = await manifestRes.json();
        if (manifest?.id) {
          router.push(`/copilot?icpId=${icp.id}&flowId=${activeConversationId}`);
        }
      }
      return;
    }

    // Check if currently generating
    if (isGenerationInProgress('value-prop', { icp: icp.id })) {
      console.log('⏳ [handleSelectIcp] Value prop generation already in progress');
      return;
    }

    setSelectedIcp(icp);

    // Update conversation memory with selected ICP so it persists to DB
    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
            ...conv,
            memory: {
              ...conv.memory,
              selectedIcp: icp
            }
          }
          : conv
      )
    );

    updateGenerationState({
      isGenerating: true,
      generationId: `value-prop-${icp.id}`,
      currentStep: 'value-prop'
    });
    updateUserJourney({ icpSelected: true });

    addMessage({
      id: nanoid(),
      role: "user",
      content: `Create value proposition for: ${icp.title}`,
    });

    // Single loading message
    const loadingMsgId = nanoid();
    addMessage({
      id: loadingMsgId,
      role: "assistant",
      content: "Creating your brand strategy...",
    });

    try {
      // Use idempotent generation
      const valuePropData = await generationManager.generate(
        'value-prop',
        { icp: icp.id, websiteUrl },
        async () => {
          // Generate value prop (all backend processing happens here)
          const valuePropRes = await fetch("/api/generate-value-prop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              icp,
              websiteUrl,
              factsJson: activeConversation?.memory.factsJson
            }),
          });

          if (!valuePropRes.ok) {
            const errorData = await valuePropRes.json().catch(() => ({}));
            console.error('❌ [Generate Value Prop] API error:', errorData);
            throw new Error(errorData.error || errorData.details || "Failed to generate value prop");
          }
          const data = await valuePropRes.json();

          return data;
        }
      );

      // Remove loading message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: conv.messages.filter(m => m.id !== loadingMsgId) }
            : conv
        )
      );

      // Update brand_manifests with selected ICP and value prop
      // Note: Only for authenticated users - guests will get this during migration
      if (!isGuest) {
        console.log('💾 [handleSelectIcp] Saving to brand manifest...');
        const updateRes = await fetch('/api/brand-manifest', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flowId: activeConversationId,
            updates: {
              'strategy.persona': {
                name: icp.personaName,
                role: icp.personaRole,
                company: icp.personaCompany,
                industry: icp.title,
                location: icp.location,
                country: icp.country,
                painPoints: icp.painPoints || [],
                goals: icp.goals || []
              },
              'strategy.valueProp': {
                headline: valuePropData.headline || valuePropData.summary?.mainInsight || valuePropData.variations?.[0]?.text || '',
                subheadline: valuePropData.subheadline || valuePropData.summary?.approachStrategy || '',
                problem: valuePropData.problem || (Array.isArray(valuePropData.summary?.painPointsAddressed) ? valuePropData.summary.painPointsAddressed.join(', ') : '') || (Array.isArray(icp.painPoints) ? icp.painPoints[0] : ''),
                solution: valuePropData.solution || valuePropData.summary?.approachStrategy || '',
                outcome: valuePropData.outcome || valuePropData.summary?.expectedImpact || '',
                benefits: valuePropData.benefits || (Array.isArray(valuePropData.variations) ? valuePropData.variations.map((v: any) => v.text) : []),
                targetAudience: valuePropData.targetAudience || icp.title || ''
              },
              'brandName': icp.personaCompany || 'Untitled Brand',
              'metadata.sourceIcpId': icp.id,
              'metadata.sourceFlowId': activeConversationId
            }
          })
        });

        if (!updateRes.ok) {
          console.error('❌ Failed to update brand manifest with ICP selection:', await updateRes.text());
        } else {
          console.log('✅ [handleSelectIcp] Brand manifest updated successfully');
        }
      } else {
        console.log('👤 [Guest] Skipping brand_manifest update - will be created during migration');
      }

      // Show persona showcase directly
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "",
        component: "persona-showcase",
        data: {
          personas: [icp],
          selectedPersonaId: icp.id,
          valuePropData: {
            [icp.id]: valuePropData
          }
        }
      });

      // For guest users: explicitly save to localStorage after value prop generation
      // This ensures persona showcase data is persisted before sign-in
      if (isGuest) {
        setTimeout(() => {
          setConversations(prev => {
            const updated = [...prev];

            // Explicit save to localStorage
            try {
              localStorage.setItem('flowtusk_guest_conversations', JSON.stringify(updated));
              localStorage.setItem('flowtusk_guest_active_id', activeConversationId);
              console.log('💾 [Guest] Explicitly saved value prop data to localStorage');
              console.log(`   - Active ID: ${activeConversationId.slice(0, 8)}...`);
              const activeConv = updated.find(c => c.id === activeConversationId);
              if (activeConv) {
                console.log(`   - Messages in active conv: ${activeConv.messages.length}`);
                const personaMsg = activeConv.messages.find(m => m.component === 'persona-showcase');
                if (personaMsg) {
                  console.log(`   - Persona showcase message found with value prop data`);
                } else {
                  console.warn('   ⚠️ No persona showcase message found!');
                }
              }
            } catch (e) {
              console.error('❌ [Guest] Failed to save value prop data to localStorage:', e);
            }

            return updated;
          });
        }, 100); // Small delay ensures addMessage state updates complete
      }

      // Update state with generated content (include ICP for export functionality)
      updateGenerationState({
        generatedContent: {
          ...activeConversation?.generationState.generatedContent,
          valueProp: {
            ...valuePropData,
            icp // Add ICP to valueProp data for PNG export
          }
        },
        completedSteps: [...(activeConversation?.generationState.completedSteps || []), 'value-prop']
      });

      // Navigate to copilot after successful generation
      const manifestRes = await fetch(`/api/brand-manifest?flowId=${activeConversationId}`);
      if (manifestRes.ok) {
        const { manifest } = await manifestRes.json();
        if (manifest?.id) {
          // Brief delay to allow user to see the showcase
          setTimeout(() => {
            router.push(`/copilot?icpId=${icp.id}&flowId=${activeConversationId}`);
          }, 1500);
        }
      }

    } catch (error) {
      console.error("Error:", error);

      // Remove loading message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: conv.messages.filter(m => m.id !== loadingMsgId) }
            : conv
        )
      );

      // Show error message with more details
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `Sorry, something went wrong generating the value proposition.\n\n**Error:** ${errorMessage}\n\nPlease try again or select a different persona.`,
      });
    } finally {
      updateGenerationState({
        isGenerating: false,
        generationId: undefined
      });
    }
  };

  // ============================================================================
  // Hero UI Handlers (for new UI components)
  // ============================================================================

  const handleHeroCopy = () => {
    console.log('📋 [Hero UI] Copied ICP to clipboard');
  };

  const handleHeroShare = () => {
    console.log('🔗 [Hero UI] Share link generated');
    // TODO: Implement share link generation
  };

  const handleViewAll = () => {
    setShowExpandedResults(true);
    console.log('👀 [Hero UI] Expanded to view all ICPs');
  };

  const handleRegenerateICP = async (prompt: string, currentICP: ICP) => {
    console.log('🔄 [Hero UI] Regenerating ICP with prompt:', prompt);
    // TODO: Implement regeneration logic using /api/chat
    // This would call the chat API with the prompt and current ICP context
    // then update heroICP with the new result
  };

  const handleHeroExport = (format: string) => {
    console.log('📥 [Hero UI] Exporting as:', format);
    // Reuse existing export logic
  };

  // ============================================================================
  // Hero UI Integration Point
  // ============================================================================
  // To enable the new Hero UI, set NEXT_PUBLIC_USE_HERO_UI=true in .env.local
  // The Hero UI will replace the message-based flow with:
  // 1. URL input
  // 2. AnalysisProgress component during analysis
  // 3. HeroICPCard for the primary result
  // 4. PromptIterator for refinement
  // 5. ExpandedResults when user clicks "View All"
  //
  // Integration example:
  // if (useHeroUI) {
  //   return <div>
  //     {isLoading && <AnalysisProgress currentStep={analysisStep} progress={analysisProgress} />}
  //     {heroICP && <HeroICPCard icp={heroICP} factsJson={activeConversation?.memory.factsJson} ... />}
  //     {heroICP && <PromptIterator flowId={activeConversationId} currentICP={heroICP} onRegenerate={handleRegenerateICP} />}
  //     {showExpandedResults && <ExpandedResults icps={allICPs} ... />}
  //   </div>
  // }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 border-r flex-col h-screen shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Sheet - Only render on client to avoid hydration mismatch */}
      {isMounted && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
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
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Flowtusk" width={18} height={18} className="shrink-0" />
            <span className="font-semibold">Flowtusk</span>
          </div>
        </div>
        {/* Messages */}
        <ScrollArea className="flex-1 h-full w-full px-3 sm:px-4 py-6 sm:py-12" ref={scrollRef}>
          <div className="space-y-4 mx-auto max-w-3xl">
            {!activeConversation?.messages.length && (() => {
              const urlParam = searchParams.get('url');
              const isProcessingUrl = urlParam && (shouldAutoSubmit || isLoading);

              // Show analyzing state when processing URL from landing
              if (isProcessingUrl) {
                return (
                  <div className="text-center py-12 sm:py-20 px-4">
                    <div className="flex items-center justify-center mb-4">
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#8b5cf6]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                      Starting Analysis...
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                      Analyzing {urlParam} to create your brand guide
                    </p>
                  </div>
                );
              }

              // Show input form for new conversations
              return (
                <div className="text-center py-12 sm:py-20 px-4">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Find users who love your brand
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
                    Paste your website and get a complete brand guide—colors, logos, messaging—customized for your ideal customer
                  </p>

                  {/* Input */}
                  <div className="mx-auto w-full max-w-2xl px-4 mb-6">
                    <form
                      data-chat-form
                      onSubmit={handleSendMessage}
                      className="relative w-full rounded-3xl border-2 border-border bg-background p-3 sm:p-4 shadow-lg focus-within:border-[#8b5cf6] focus-within:shadow-xl transition-all"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                          !websiteUrl
                            ? "Paste any website URL (e.g., https://yoursite.com)..."
                            : selectedIcp
                              ? "Ask me to refine the page..."
                              : "What would you like to do?"
                        }
                        disabled={isLoading}
                        className="!border-0 !ring-0 !outline-0 rounded-none pr-14 sm:pr-16 focus-visible:!ring-0 focus-visible:!outline-0 focus:!ring-0 focus:!outline-0 active:!ring-0 active:!outline-0 shadow-none bg-transparent text-base sm:text-lg h-12 sm:h-14 text-left [&:focus]:ring-0 [&:focus-visible]:ring-0"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d28d9] hover:to-[#7c3aed] transition-all"
                      >
                        <ArrowUp className="h-6 w-6" />
                      </Button>
                    </form>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 max-w-md mx-auto">
                    Try these examples or paste any public website URL:
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
              );
            })()}

            {activeConversation?.messages.map(message => (
              <div
                key={message.id}
                className={`flex w-full flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"
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
                      <ThinkingBlock
                        thinking={message.thinking}
                        onCancel={currentAbortController ? () => {
                          currentAbortController.abort();
                          setCurrentAbortController(null);
                          setIsLoading(false);
                        } : undefined}
                      />
                    )}

                    {/* Status Messages (Legacy - fallback) */}
                    {message.content === "crawling_website" && (
                      <SystemMessage variant="loading" icon={<Search className="h-4 w-4" />}>
                        Reading your website to understand your product...
                      </SystemMessage>
                    )}
                    {message.content.startsWith("crawl_complete:") && (() => {
                      const [, pages, source, filepath] = message.content.split(":");
                      return (
                        <SystemMessage variant="success">
                          Analyzed {pages} page{pages !== "1" ? "s" : ""} from your site
                          <div className="text-xs text-muted-foreground mt-1">
                            Blueprint saved: {filepath?.split("/").pop()}
                          </div>
                        </SystemMessage>
                      );
                    })()}
                    {message.content === "generating_icps" && (
                      <SystemMessage variant="loading" icon={<Brain className="h-4 w-4" />}>
                        Finding people who'll love your product...
                      </SystemMessage>
                    )}
                    {message.content === "crafting_landing_page" && (
                      <SystemMessage variant="loading" icon={<Wand2 className="h-4 w-4" />}>
                        Creating your landing page preview...
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
                    {message.component === "icps" && message.data && Array.isArray(message.data) && (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {(
                          // De-duplicate ICPs by id to avoid React key warnings
                          (message.data as ICP[]).filter((icp, index, arr) =>
                            arr.findIndex(i => i.id === icp.id) === index
                          )
                        ).map((icp, idx) => {
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
                              onClick={(e) => {
                                // Only handle clicks if not clicking on interactive elements
                                const target = e.target as HTMLElement;
                                if (target.closest('button') || target.closest('[role="menuitem"]')) {
                                  return;
                                }
                                // Select this ICP and proceed
                                handleSelectIcp(icp);
                              }}
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

                                {/* Select Profile CTA */}
                                <div className="pt-2 border-t border-border/50 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-semibold text-foreground">12+ LinkedIn profiles</span> found
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className={`w-full h-8 text-xs hover:shadow-lg transition-all font-semibold`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectIcp(icp);
                                    }}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    Target This Audience
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {/* Value Prop Summary with Approval */}
                    {message.component === "value-prop-summary" && message.data && typeof message.data === 'object' && !Array.isArray(message.data) && (() => {
                      const data = message.data as { summary: string; valuePropData: ValuePropData; icp: ICP };
                      // Defensive check: ensure required properties exist
                      if (!data.summary || !data.valuePropData || !data.icp) return null;
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
                    {message.component === "value-prop" && message.data && typeof message.data === 'object' && !Array.isArray(message.data) && (() => {
                      const data = message.data as ValuePropData;
                      // Defensive check: ensure valuePropData has required structure
                      if (!data || !data.variables || !data.variations) return null;
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
                    {message.component === "positioning-summary" && message.data && typeof message.data === 'object' && !Array.isArray(message.data) && (() => {
                      const data = message.data as { summary: string; icp: ICP; valuePropData: ValuePropData };
                      // Defensive check: ensure required properties exist
                      if (!data.summary || !data.icp || !data.valuePropData) return null;
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
                    {message.component === "persona-showcase" && message.data && typeof message.data === 'object' && !Array.isArray(message.data) && (() => {
                      const showcaseData = message.data as { personas: ICP[]; selectedPersonaId: string; valuePropData: Record<string, ValuePropData> };
                      // Defensive check: ensure personas is an array and required properties exist
                      if (!showcaseData || !Array.isArray(showcaseData.personas) || !showcaseData.selectedPersonaId) return null;
                      return (
                        <PersonaShowcase
                          personas={showcaseData.personas}
                          selectedPersonaId={showcaseData.selectedPersonaId}
                          valuePropData={showcaseData.valuePropData}
                          isGuest={isGuest}
                          flowId={activeConversationId}
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
                          onLaunchCopilot={handleLaunchCopilot}
                          onSignIn={(returnUrl) => {
                            // Save current conversation to localStorage before redirecting
                            try {
                              const currentConv = conversations.find(c => c.id === activeConversationId);
                              if (currentConv) {
                                localStorage.setItem('flowtusk_guest_conversations', JSON.stringify(conversations));
                                localStorage.setItem('flowtusk_guest_active_id', activeConversationId);
                                localStorage.setItem('flowtusk_pending_redirect', returnUrl);
                              }
                            } catch (e) {
                              console.error('Failed to save guest data before auth:', e);
                            }
                            // Redirect to login, then back to /app for migration (which will then redirect to copilot)
                            window.location.href = `/auth/login?redirectTo=${encodeURIComponent('/app')}`;
                          }}
                          readOnly={false}
                        />
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

// Wrap in ErrorBoundary and Suspense
export default function ChatPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFlowsSkeleton />}>
        <ChatPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
