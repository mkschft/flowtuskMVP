/**
 * Migration Utility: localStorage → Supabase DB
 * 
 * Safely migrates conversation data from localStorage to database with:
 * - Backup creation
 * - Evidence chain validation
 * - Diff reporting
 * - Rollback support
 */

import { flowsClient, type Flow, type CreateFlowInput } from './flows-client';

export interface MigrationResult {
  id: string;
  title: string;
  success: boolean;
  error?: string;
  flowId?: string;
}

export interface MigrationReport {
  total: number;
  success: number;
  failed: number;
  failedItems: MigrationResult[];
  evidenceIntegrityCheck: {
    total: number;
    withEvidence: number;
    missingEvidence: number;
  };
  backupCreated: boolean;
  backupPath?: string;
}

interface LocalStorageConversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date | string;
  generationState?: any;
  userJourney?: any;
  memory?: {
    id: string;
    websiteUrl: string;
    websiteContent?: string;
    factsJson?: Record<string, unknown>;
    selectedIcp?: any;
    generationHistory?: any[];
    userPreferences?: any;
  };
}

/**
 * Export localStorage backup as downloadable JSON
 */
export function exportLocalStorageBackup(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const backup: Record<string, string> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('flowtusk_')) {
      backup[key] = localStorage.getItem(key) || '';
    }
  }

  return backup;
}

/**
 * Download backup as JSON file
 */
export function downloadBackupAsJson(backup: Record<string, string>, filename: string = 'flowtusk-backup.json'): void {
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert localStorage conversation to Flow format
 */
function conversationToFlow(conversation: LocalStorageConversation): CreateFlowInput {
  const memory = conversation.memory;
  
  return {
    title: conversation.title || 'Imported Flow',
    website_url: memory?.websiteUrl,
    facts_json: memory?.factsJson,
    selected_icp: memory?.selectedIcp,
    generated_content: {
      messages: conversation.messages || [],
      generationState: conversation.generationState || {},
      userJourney: conversation.userJourney || {},
      generationHistory: memory?.generationHistory || [],
    },
    step: determineFlowStep(conversation),
  };
}

/**
 * Determine current step from conversation state
 */
function determineFlowStep(conversation: LocalStorageConversation): string {
  const journey = conversation.userJourney;
  
  if (!journey) return 'initial';
  
  if (journey.exported) return 'exported';
  if (journey.valuePropGenerated) return 'value_prop';
  if (journey.icpSelected) return 'icp_selected';
  if (journey.websiteAnalyzed) return 'analyzed';
  
  return 'initial';
}

/**
 * Validate evidence chain in facts_json and selected_icp
 */
function validateEvidenceChain(flow: CreateFlowInput): boolean {
  let hasEvidence = false;

  // Check facts_json for evidence field
  if (flow.facts_json && typeof flow.facts_json === 'object') {
    const facts = flow.facts_json as any;
    
    // Check if facts array exists and has evidence
    if (Array.isArray(facts.facts)) {
      hasEvidence = facts.facts.some((fact: any) => fact.evidence);
    }
    
    // Check if valueProps have evidence
    if (Array.isArray(facts.valueProps)) {
      hasEvidence = hasEvidence || facts.valueProps.some((vp: any) => vp.evidence);
    }
  }

  // Check selected_icp for evidence field
  if (flow.selected_icp && typeof flow.selected_icp === 'object') {
    const icp = flow.selected_icp as any;
    hasEvidence = hasEvidence || (Array.isArray(icp.evidence) && icp.evidence.length > 0);
  }

  return hasEvidence;
}

/**
 * Migrate all conversations from localStorage to database
 */
export async function migrateLocalStorageToDb(): Promise<MigrationReport> {
  // Step 1: Export backup
  console.log('📦 [Migration] Creating backup...');
  const backup = exportLocalStorageBackup();
  const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `flowtusk-backup-${backupTimestamp}.json`;
  downloadBackupAsJson(backup, backupFilename);

  // Step 2: Parse conversations
  console.log('🔍 [Migration] Parsing conversations...');
  const conversationsJson = localStorage.getItem('flowtusk_conversations');
  
  if (!conversationsJson) {
    return {
      total: 0,
      success: 0,
      failed: 0,
      failedItems: [],
      evidenceIntegrityCheck: {
        total: 0,
        withEvidence: 0,
        missingEvidence: 0,
      },
      backupCreated: true,
      backupPath: backupFilename,
    };
  }

  const conversations: LocalStorageConversation[] = JSON.parse(conversationsJson);
  const results: MigrationResult[] = [];
  const evidenceCount = { total: 0, withEvidence: 0, missingEvidence: 0 };

  // Step 3: Migrate each conversation
  console.log(`🚀 [Migration] Migrating ${conversations.length} conversations...`);
  
  for (const conversation of conversations) {
    try {
      const flowInput = conversationToFlow(conversation);
      const hasEvidence = validateEvidenceChain(flowInput);
      
      evidenceCount.total++;
      if (hasEvidence) {
        evidenceCount.withEvidence++;
      } else {
        evidenceCount.missingEvidence++;
        console.warn(`⚠️ [Migration] Missing evidence chain in: ${conversation.title}`);
      }

      // Create flow in database
      const flow = await flowsClient.createFlow(flowInput);
      
      results.push({
        id: conversation.id,
        title: conversation.title,
        success: true,
        flowId: flow.id,
      });
      
      console.log(`✅ [Migration] Migrated: ${conversation.title}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        id: conversation.id,
        title: conversation.title,
        success: false,
        error: errorMessage,
      });
      
      console.error(`❌ [Migration] Failed: ${conversation.title}`, error);
    }
  }

  // Step 4: Generate report
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const failedItems = results.filter(r => !r.success);

  const report: MigrationReport = {
    total: results.length,
    success: successCount,
    failed: failedCount,
    failedItems,
    evidenceIntegrityCheck: evidenceCount,
    backupCreated: true,
    backupPath: backupFilename,
  };

  console.log('📊 [Migration] Report:', report);
  return report;
}

/**
 * Clear localStorage after successful migration (only if user confirms)
 */
export function clearLocalStorageAfterMigration(): void {
  if (typeof window === 'undefined') return;

  const keys = [
    'flowtusk_conversations',
    'flowtusk_active_conversation',
    'flowtusk_conversation_memories',
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('🧹 [Migration] Cleared localStorage');
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false;
  
  const conversationsJson = localStorage.getItem('flowtusk_conversations');
  return conversationsJson !== null && conversationsJson !== '[]';
}

export default {
  migrateLocalStorageToDb,
  exportLocalStorageBackup,
  downloadBackupAsJson,
  clearLocalStorageAfterMigration,
  needsMigration,
};

