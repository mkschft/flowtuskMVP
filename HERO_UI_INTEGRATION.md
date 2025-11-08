# Hero UI Integration Guide

## Overview

The new Hero UI components have been built and are ready for integration. This guide explains how to enable and fully integrate them into the app.

## Components Created

All components are located in `/components/`:

1. **HeroICPCard.tsx** - Primary ICP display with interactive evidence
2. **AnalysisProgress.tsx** - Real-time analysis progress indicator
3. **ExpandedResults.tsx** - All 3 ICPs + assets with filter tabs
4. **PromptIterator.tsx** - Natural language refinement interface

## Quick Start

### Step 1: Enable Hero UI

Add to `.env.local`:
```bash
NEXT_PUBLIC_USE_HERO_UI=true
```

### Step 2: Component Integration

The components are imported in `app/app/page.tsx` (lines 37-40) and handler functions are ready (lines 2895-2944).

### Current State

- ✅ DB sync enabled with health checks
- ✅ Evidence tracking in place
- ✅ All Hero UI components built and tested
- ✅ Handler functions created
- ⚠️ Full UI integration requires additional work (see below)

## Full Integration Steps

### Option A: Gradual Integration (Recommended)

Keep the existing UI and add Hero UI as an optional feature:

```typescript
// In app/app/page.tsx, around line 2946
return (
  <div className="flex h-screen bg-background">
    {useHeroUI ? (
      <HeroUILayout />
    ) : (
      <LegacyUILayout />
    )}
  </div>
);
```

Create `HeroUILayout` component:
```typescript
function HeroUILayout() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* URL Input */}
      <Input placeholder="Paste your website URL..." />
      
      {/* Progress during analysis */}
      {isLoading && (
        <AnalysisProgress 
          currentStep={analysisStep} 
          progress={analysisProgress} 
        />
      )}
      
      {/* Hero ICP Card */}
      {heroICP && !showExpandedResults && (
        <HeroICPCard
          icp={heroICP}
          factsJson={activeConversation?.memory.factsJson}
          onCopy={handleHeroCopy}
          onShare={handleHeroShare}
          onViewAll={handleViewAll}
        />
      )}
      
      {/* Prompt Iterator */}
      {heroICP && (
        <PromptIterator
          flowId={activeConversationId}
          currentICP={heroICP}
          onRegenerate={handleRegenerateICP}
          isLoading={isLoading}
        />
      )}
      
      {/* Expanded Results */}
      {showExpandedResults && (
        <ExpandedResults
          icps={allICPs}
          valuePropData={activeConversation?.memory.valuePropData}
          factsJson={activeConversation?.memory.factsJson}
          onICPSelect={(icp) => setHeroICP(icp)}
          onExport={handleHeroExport}
        />
      )}
    </div>
  );
}
```

### Option B: Full Replacement

Replace the existing message-based UI entirely:

1. Remove the complex message rendering (lines 3000-3400)
2. Replace with Hero UI components
3. Update `handleSendMessage` to set Hero UI state:

```typescript
// After ICP generation (around line 1450):
const icps = parsedResult.icps || [];
setAllICPs(icps);
setHeroICP(icps[0]); // Set primary ICP
setShowExpandedResults(false);
```

## Progress Tracking Integration

Update `handleSendMessage` to track analysis steps:

```typescript
// Step 1: Fetching website
setAnalysisStep('fetching');
setAnalysisProgress(10);

const analyzeRes = await fetch("/api/analyze-website", { ... });

// Step 2: Extracting facts
setAnalysisStep('extracting');
setAnalysisProgress(40);

const { factsJson } = await analyzeRes.json();

// Step 3: Generating ICPs
setAnalysisStep('generating');
setAnalysisProgress(70);

const icpsRes = await fetch("/api/generate-icps", { ... });

// Step 4: Finalizing
setAnalysisStep('finalizing');
setAnalysisProgress(95);

const { icps } = await icpsRes.json();
setAnalysisProgress(100);
```

## Regeneration Logic

Implement `handleRegenerateICP`:

```typescript
const handleRegenerateICP = async (prompt: string, currentICP: ICP) => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flowId: activeConversationId,
        prompt: `Refine this ICP: ${prompt}`,
        currentICP,
        factsJson: activeConversation?.memory.factsJson,
      }),
    });
    
    const { icp: newICP } = await response.json();
    setHeroICP(newICP);
    
    // Update allICPs to include the new version
    setAllICPs(prev => prev.map(icp => 
      icp.id === newICP.id ? newICP : icp
    ));
  } catch (error) {
    console.error('Failed to regenerate ICP:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Checklist

- [ ] Set `NEXT_PUBLIC_USE_HERO_UI=true`
- [ ] Paste URL → See AnalysisProgress
- [ ] Hero ICP appears after ~60s
- [ ] Evidence sources are clickable and show full context
- [ ] Copy button works
- [ ] "View All" expands to show all 3 ICPs
- [ ] Filter tabs work (All / ICPs Only / Assets Only)
- [ ] Prompt iterator validates input
- [ ] Regenerate creates new ICP
- [ ] Data persists in Supabase

## Rollback

If issues occur, disable the feature flag:

```bash
# In .env.local
NEXT_PUBLIC_USE_HERO_UI=false
```

The app will fall back to the original UI immediately.

## Performance Notes

- Hero UI reduces initial cognitive load (1 card vs 3)
- Evidence resolution happens client-side (fast)
- Progress tracking uses real API stages (no fake progress)
- Filter tabs reduce clutter for power users

## Next Steps

1. Complete full integration in `app/app/page.tsx`
2. Test end-to-end with real URLs
3. Add snapshot tests (see Phase 6)
4. Deploy behind feature flag
5. Gather user feedback
6. Iterate based on data

## Support

For questions or issues, check:
- Component source code in `/components/`
- Handler functions in `app/app/page.tsx` (lines 2895-2944)
- Evidence chain validation in `lib/validators.ts`

