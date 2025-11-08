/**
 * Migration Utility - localStorage → Supabase DB
 * 
 * This utility provides safe migration of localStorage conversations to Supabase flows
 * with evidence chain validation, backup creation, and diff reporting.
 */

import { flowsClient, type CreateFlowInput } from "./flows-client";

export interface LocalStorageConversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  generationState: any;
  userJourney: {
    websiteAnalyzed: boolean;
    icpSelected: boolean;
    valuePropGenerated: boolean;
    exported: boolean;
  };
  memory: {
    id: string;
    websiteUrl: string;
    websiteContent?: string;
    factsJson?: Record<string, unknown>;
    selectedIcp: any | null;
    generationHistory: any[];
    userPreferences: any;
  };
}

export interface MigrationResult {
  conversationId: string;
  title: string;
  success: boolean;
  flowId?: string;
  error?: string;
  evidenceValidation: {
    hasFactsJson: boolean;
    hasEvidenceFields: boolean;
    hasSourceFactIds: boolean;
  };
}

export interface MigrationReport {
  timestamp: string;
  total: number;
  success: number;
  failed: number;
  results: MigrationResult[];
  evidenceIntegrityCheck: {
    totalFlows: number;
    flowsWithEvidence: number;
    flowsWithoutEvidence: number;
    evidenceIntegrityScore: number; // percentage
  };
  backupPath: string;
}

/**
 * Export localStorage backup as JSON file
 */
export function exportLocalStorageBackup(): {
  conversations: LocalStorageConversation[];
  timestamp: string;
  version: string;
} {
  if (typeof window === "undefined") {
    throw new Error("This function can only run in the browser");
  }

  const savedConversations = localStorage.getItem("flowtusk_conversations");
  const savedActiveId = localStorage.getItem("flowtusk_active_conversation");

  const backup = {
    conversations: savedConversations ? JSON.parse(savedConversations) : [],
    activeConversationId: savedActiveId,
    timestamp: new Date().toISOString(),
    version: "1.0",
  };

  return backup;
}

/**
 * Download backup as JSON file
 */
export function downloadBackupAsJson(backup: any, filename = "flowtusk-backup.json") {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate evidence chain in a flow
 */
function validateEvidenceChain(flowData: CreateFlowInput): {
  hasFactsJson: boolean;
  hasEvidenceFields: boolean;
  hasSourceFactIds: boolean;
} {
  const result = {
    hasFactsJson: false,
    hasEvidenceFields: false,
    hasSourceFactIds: false,
  };

  // Check if facts_json exists
  if (flowData.facts_json) {
    result.hasFactsJson = true;

    // Check if facts have evidence fields
    const facts = flowData.facts_json as any;
    if (facts.facts && Array.isArray(facts.facts)) {
      const hasEvidence = facts.facts.some(
        (fact: any) => fact.evidence || fact.id
      );
      result.hasEvidenceFields = hasEvidence;
    }
  }

  // Check if selected_icp has evidence
  if (flowData.selected_icp) {
    const icp = flowData.selected_icp as any;
    if (icp.evidence && Array.isArray(icp.evidence)) {
      result.hasSourceFactIds = icp.evidence.length > 0;
    }
  }

  return result;
}

/**
 * Transform localStorage conversation to flow format
 */
function transformConversationToFlow(
  conversation: LocalStorageConversation
): CreateFlowInput {
  return {
    title: conversation.title || "Migrated Flow",
    website_url: conversation.memory?.websiteUrl || null,
    facts_json: conversation.memory?.factsJson || null,
    selected_icp: conversation.memory?.selectedIcp || null,
    step: mapUserJourneyToStep(conversation.userJourney),
  };
}

/**
 * Map user journey to flow step
 */
function mapUserJourneyToStep(userJourney: any): string {
  if (!userJourney) return "initial";

  if (userJourney.exported) return "exported";
  if (userJourney.valuePropGenerated) return "value_prop_generated";
  if (userJourney.icpSelected) return "icp_selected";
  if (userJourney.websiteAnalyzed) return "website_analyzed";

  return "initial";
}

/**
 * Migrate a single conversation to DB
 */
async function migrateConversation(
  conversation: LocalStorageConversation
): Promise<MigrationResult> {
  const flowData = transformConversationToFlow(conversation);
  const evidenceValidation = validateEvidenceChain(flowData);

  try {
    const flow = await flowsClient.createFlow(flowData);

    return {
      conversationId: conversation.id,
      title: conversation.title,
      success: true,
      flowId: flow.id,
      evidenceValidation,
    };
  } catch (error) {
    return {
      conversationId: conversation.id,
      title: conversation.title,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      evidenceValidation,
    };
  }
}

/**
 * Main migration function - migrates all localStorage conversations to DB
 */
export async function migrateLocalStorageToDb(): Promise<MigrationReport> {
  // Step 1: Export and download backup
  console.log("📦 Creating backup...");
  const backup = exportLocalStorageBackup();
  const backupFilename = `flowtusk-backup-${Date.now()}.json`;
  downloadBackupAsJson(backup, backupFilename);

  // Step 2: Migrate each conversation
  console.log("🔄 Migrating conversations...");
  const results: MigrationResult[] = [];

  for (const conversation of backup.conversations) {
    const result = await migrateConversation(conversation);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Migrated: ${result.title} (${result.flowId})`);
    } else {
      console.error(`❌ Failed: ${result.title} - ${result.error}`);
    }
  }

  // Step 3: Calculate evidence integrity
  const totalFlows = results.length;
  const flowsWithEvidence = results.filter(
    (r) =>
      r.evidenceValidation.hasFactsJson &&
      (r.evidenceValidation.hasEvidenceFields ||
        r.evidenceValidation.hasSourceFactIds)
  ).length;

  const evidenceIntegrityScore =
    totalFlows > 0 ? (flowsWithEvidence / totalFlows) * 100 : 0;

  // Step 4: Generate report
  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    total: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
    evidenceIntegrityCheck: {
      totalFlows,
      flowsWithEvidence,
      flowsWithoutEvidence: totalFlows - flowsWithEvidence,
      evidenceIntegrityScore,
    },
    backupPath: backupFilename,
  };

  console.log("📊 Migration Report:", {
    success: report.success,
    failed: report.failed,
    evidenceIntegrity: `${evidenceIntegrityScore.toFixed(1)}%`,
  });

  return report;
}

/**
 * Clear localStorage after successful migration and user confirmation
 */
export function clearLocalStorageAfterMigration(): void {
  if (typeof window === "undefined") {
    throw new Error("This function can only run in the browser");
  }

  const confirmed = window.confirm(
    "Are you sure you want to clear your local data? This action cannot be undone. Make sure you have downloaded your backup file."
  );

  if (confirmed) {
    localStorage.removeItem("flowtusk_conversations");
    localStorage.removeItem("flowtusk_active_conversation");
    localStorage.removeItem("flowtusk_conversation_memories");
    console.log("✅ Cleared localStorage after migration");
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === "undefined") return false;

  const savedConversations = localStorage.getItem("flowtusk_conversations");
  return !!savedConversations && JSON.parse(savedConversations).length > 0;
}

