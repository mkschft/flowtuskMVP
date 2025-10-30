# Demo Mode - Test Checklist

## Quick Test Instructions

### Start Dev Server
```bash
npm run dev
```

### Test Flow

#### 1. Landing Page Test ✓
- [ ] Go to `http://localhost:3000`
- [ ] See Hero section with URL input field
- [ ] See only "Get Started" button (no "Sign In")
- [ ] Enter test URL: `taxstar.app`
- [ ] Click "Analyze" button

**Expected:** Redirects to `/app?url=taxstar.app`

#### 2. URL Parameter Handoff Test ✓
- [ ] After redirect, you should land on `/app`
- [ ] Input field should auto-populate with `taxstar.app`
- [ ] Form should auto-submit after ~100ms

**Watch Console Logs:**
```
🔍 [URL Param Check] { urlParam: 'taxstar.app', hasProcessedUrlParam: false, willProcess: true }
✅ [URL Param] Processing URL from landing page: taxstar.app
🎯 [URL Param] Input set, auto-submit flag enabled
🔄 [Auto-Submit Check] { shouldAutoSubmit: true, inputLength: 12, willSubmit: true }
🚀 [Auto-Submit] Triggering form submission...
✅ [Auto-Submit] Form found, calling requestSubmit()
```

#### 3. Analysis Flow Test ✓
- [ ] Analysis should start automatically
- [ ] See thinking steps appear:
  - Analyzing website (with substeps)
  - Extracting Facts JSON
- [ ] Facts extraction completes
- [ ] 3 ICPs generated and shown

**Expected:** Full flow works without any login prompts

#### 4. No Auth Barriers ✓
- [ ] No login redirect
- [ ] No "Sign up to continue" messages
- [ ] Can complete entire flow: URL → ICPs → Value Prop → Email/LinkedIn

---

## Debugging

### If URL doesn't carry over:
1. Check browser console for URL param logs
2. Verify URL in address bar: should be `/app?url=...`
3. Check Network tab for any redirects

### If auto-submit doesn't work:
1. Check console for `❌ [Auto-Submit] Form not found!`
2. Verify form has `data-chat-form` attribute
3. Check if `shouldAutoSubmit` flag is set

### If auth prompts appear:
1. Verify `app/page.tsx` doesn't check auth
2. Check middleware allows `/app` routes
3. Clear cookies and try again

---

## Success Criteria

✅ **URL Param Handoff:** Landing page URL → App input field  
✅ **Auto-Submit:** Form submits automatically  
✅ **No Auth:** Complete flow without login  
✅ **Clean UX:** No "Sign In" distractions  

---

## Demo Script

> "I'll show you how easy it is to generate marketing content. Watch this..."

1. Start at landing page
2. Type: `taxstar.app` 
3. Click "Analyze"
4. **Point out:** "Notice it automatically started analyzing - no login, no friction"
5. Wait for ICPs to generate
6. **Point out:** "In just 15 seconds, we extracted 45 facts and created 3 customer profiles"
7. Select an ICP
8. Generate value prop
9. Create email/LinkedIn content
10. **Point out:** "From website to personalized marketing content in under 2 minutes"

---

Ready to test! 🚀

