# Brand Manifest Migration Status

## ✅ What's Working

### 1. Data Flow Architecture
```
brand_manifests (Supabase)
    ↓
/api/workspace (reads manifest, transforms to legacy format)
    ↓
DesignStudioWorkspace (loads workspaceData + designAssets)
    ↓
currentProject (useMemo builds unified object)
    ↓
Canvas components (ValueProp, Brand, Style, Landing)
```

### 2. APIs Using Manifests ✅
- `/api/workspace` - ✅ Reads from `brand_manifests` first
- `/api/design-assets/generate` - ✅ Writes to `brand_manifests` primary, syncs to legacy
- `/api/copilot/chat` - ✅ Reads/writes `brand_manifests` directly
- `/api/brand-manifest` - ✅ CRUD operations on manifests

### 3. Frontend Data Binding ✅
`DesignStudioWorkspace.tsx` (lines 536-571) builds `currentProject` from:
- `workspaceData` (from `/api/workspace`)
- `designAssets` (from `/api/workspace`)  
- `uiValueProp` (synced with manifest)
- `chatMessages` (local state)

This object feeds all Canvas components.

### 4. Migration Complete ✅
- 18 flows migrated to brand_manifests
- Legacy tables archived (renamed to _archive_*)
- No data loss (manifests contain all migrated data)

## ⚠️ Known Issues

### 1. Empty Value Props
**Problem**: Many manifests have empty `strategy.valueProp` sections

**Root Cause**: Legacy `positioning_value_props` table was completely empty

**Impact**: Value Prop Framework shows empty rows (Who, Pain, Solution, Why Us)

**Fix Options**:
a) Regenerate value props via chat for existing flows
b) Update GPT prompts to ensure value props are always generated
c) Make value prop generation mandatory during ICP creation

### 2. Landing Page Structure
**Fixed**: Added `navigation.logo` field to prevent crash (commit just made)

**Remaining**: Verify all landing page fields populate correctly

### 3. GPT Prompt Alignment
**Status**: Copilot chat prompt (lines 180-248 in `/api/copilot/chat/route.ts`) correctly references manifest structure

**Action needed**: Verify other generation endpoints use manifest-aligned prompts:
- `/api/generate-value-prop` - Check if still writes to legacy or manifest
- `/api/design-assets/generate` - ✅ Already updated to write to manifest

## 🔧 Current System State

### Active Tables
- ✅ `brand_manifests` - PRIMARY source of truth
- ✅ `positioning_flows` - Still active (flow metadata)
- 🗄️ `_archive_positioning_icps` - Archived (backup until Dec 22)
- 🗄️ `_archive_positioning_value_props` - Archived (backup until Dec 22)
- 🗄️ `_archive_positioning_design_assets` - Archived (backup until Dec 22)

### Data Transformation Layer
The system maintains backward compatibility by transforming manifest data to legacy format in `/api/workspace`:

**Manifest Structure:**
```typescript
{
  strategy: { persona: {...}, valueProp: {...} },
  identity: { colors: {...}, typography: {...}, tone: {...} },
  components: { buttons: {...}, cards: {...} },
  previews: { landingPage: {...} }
}
```

**Transformed to Legacy Format:**
```typescript
{
  icp: { persona_name, persona_role, pain_points, ... },
  valueProp: { headline, problem, solution, benefits, ... },
  designAssets: { brand_guide, style_guide, landing_page, ... }
}
```

This allows the frontend to work without changes while using manifests as the source.

## 🎯 Next Steps

### Immediate (Critical)
1. ✅ Fix landing page crash - DONE
2. ⚠️ Test value prop regeneration via chat
3. ⚠️ Verify all tabs display data correctly

### Short-term (This Week)
1. Audit and fix any remaining empty data issues
2. Update `/api/generate-value-prop` to write to manifests
3. Add validation to ensure value props are always generated
4. Test new flow creation end-to-end

### Medium-term (Next Sprint)
1. Remove transformation layer - have frontend consume manifest directly
2. Clean up legacy code references
3. Delete archived tables (after Dec 22, 2025)
4. Update documentation

## 🧪 Testing Checklist

### Manual Testing
- [ ] Create new flow
- [ ] Generate value prop via chat
- [ ] Generate design assets (brand/style/landing)
- [ ] Verify Value Prop tab shows all fields
- [ ] Verify Brand Guide tab shows colors/typography
- [ ] Verify Style Guide tab shows button/card styles  
- [ ] Verify Landing tab renders without crash
- [ ] Export to Figma with brand key
- [ ] Undo/redo functionality

### Automated Testing
- [x] Evidence chain tests - PASSING (30/30)
- [x] TypeScript compilation - PASSING
- [ ] API integration tests (TODO)
- [ ] E2E copilot tests (TODO)

## 📊 Migration Stats

- **Total flows**: 40
- **Flows with manifests**: 18 (45%)
- **Flows migrated**: 8 new + 10 existing
- **Flows skipped**: 22 (no ICPs or design assets)
- **Migration failures**: 0
- **Data loss**: 0

## 🔍 Debugging Commands

### Check manifest for a flow
```bash
npx tsx scripts/debug-manifest.ts <flowId>
```

### Verify manifest in Supabase
```sql
SELECT * FROM brand_manifests WHERE flow_id = '<flowId>';
```

### Check for missing manifests
```sql
SELECT COUNT(*) 
FROM positioning_design_assets pda
WHERE pda.brand_guide IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM brand_manifests bm WHERE bm.flow_id = pda.parent_flow
);
```

## 📝 Notes

- Legacy tables are still synced during generation for safety
- Transformation layer allows gradual frontend migration
- Archived tables safe to delete after Dec 22, 2025
- All new data writes go to `brand_manifests` first
