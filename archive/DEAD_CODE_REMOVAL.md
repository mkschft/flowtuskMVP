# Dead Code Removal - Lean Flow Implementation

**Date:** November 18, 2025

## Core Flow (KEEP)
URL → Scrape → Show Personas → Select Persona → Launch Copilot (`/copilot/[icpId]`)

## Code to Remove

### Functions to DELETE:
1. `handleContinueToOutreach()` - Lines ~1913-1941
2. `handleOutreachChoice()` - Lines ~1944-1950
3. `handleContinueToEmail()` - Lines ~1979-2007
4. `handleContinueToLinkedIn()` - Lines ~2010-2039
5. `handleLinkedInTypeChoice()` - Lines ~2042-2191
6. `handleEmailTypeChoice()` - Lines ~2193-2395
7. `handleSequenceLengthChoice()` - Lines ~2397-2580
8. All associated `updateThinkingStep` and thinking message logic for email/LinkedIn

### Component Renderings to DELETE:
1. `message.component === "outreach-choice"` - Lines ~3291-3299
2. `message.component === "linkedin-type-choice"` - Lines ~3301-3309
3. `message.component === "email-type-choice"` - Lines ~3311-3319
4. `message.component === "sequence-length-choice"` - Lines ~3321-3329
5. `message.component === "email-sequence"` - Lines ~3331-3340
6. `message.component === "one-time-email"` - Lines ~3342-3351
7. `message.component === "linkedin-outreach"` - Lines ~3353-3389

### PersonaShowcase Handlers to REMOVE:
In PersonaShowcase component calls (~line 3282-3284):
- `onContinue` prop
- `onGenerateLinkedIn` prop
- `onGenerateEmail` prop

KEEP only:
- `onLaunchCopilot` prop
- `onExport` prop
- `onPersonaChange` prop

## What Remains

### `/app` Route Components:
- URL input
- Scrape/analyze website
- Show ICP cards
- Select ICP
- Generate value prop summary
- **Launch Copilot button** → navigates to `/copilot/[icpId]`

### `/copilot/[icpId]` Route:
- Already exists in `DesignStudioWorkspace.tsx`
- Split screen: chat left, preview right
- No changes needed there

## Result
- Remove ~1500 lines of dead code
- Single clear path: personas → copilot
- No email/LinkedIn generation in main app
