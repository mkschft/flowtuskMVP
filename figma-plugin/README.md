# Flowtusk Figma Plugin

Auto-fill persona templates in Figma with real customer data from Flowtusk's AI-powered ICP generator.

## Features

- 🎯 **One-Click Generation**: Paste any website URL and generate 3 detailed personas
- 🤖 **GPT-Powered Mapping**: Works with ANY template - no naming conventions required!
- 🎨 **Intelligent Analysis**: Understands content, position, and template structure
- 🎯 **80%+ Accuracy**: Matches fields even with generic "Text 1" layer names
- ⚡ **Fast**: Powered by Flowtusk's production API + GPT-4o
- 🔒 **Secure**: Uses your deployed backend at flowtusk.vercel.app

## Installation

### 1. Install Dependencies

```bash
cd figma-plugin
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

This compiles `code.ts` → `code.js` (required by Figma).

### 3. Load in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `figma-plugin/manifest.json`
4. Plugin is now available in your Plugins menu!

## Usage

### Step 1: Prepare Your Figma File

**No naming conventions required!** The plugin uses AI to understand your template.

Just create ANY text layers - the plugin intelligently detects:
- Names (even if layer is called "Text 1")
- Roles (from content like "Senior Engineer")
- Companies (from position and context)
- Lists (bullet points → goals/pain points)
- Descriptions (multi-line text)

**Example - Works with generic names:**
```
Frame: Card
├─ Text: "Text 1" (containing "John Doe")
├─ Text: "Text 2" (containing "Engineer")
├─ Text: "Text 3" (containing "TechCorp")
├─ Text: "Description" (multi-line text)
└─ Text: "List" (bullet points)
```

All will be correctly mapped! 🤖

### Step 2: Run the Plugin

1. **Plugins** → **Development** → **Flowtusk Persona Filler**
2. Enter a website URL (e.g., `https://stripe.com`)
3. Click **Generate Personas**
4. Wait 10-20 seconds (analyzing website + generating ICPs)
5. Watch your text fields auto-fill! ✨

### Step 3: Review & Customize

The plugin fills the first persona by default. You can:
- Manually edit any field
- Run again with a different URL
- Duplicate the frame for multiple personas

## How It Works

```
User enters URL
    ↓
Plugin calls: POST /api/analyze-website
    ↓
Extracts facts from website (GPT-4o + Jina scraper)
    ↓
Plugin calls: POST /api/generate-icps
    ↓
Generates 3 detailed ICPs (GPT-4o-mini)
    ↓
Plugin extracts text layer metadata (name, content, position)
    ↓
Plugin calls: POST /api/figma-template-mapper
    ↓
GPT-4o analyzes template structure & detects type
    ↓
GPT-4o intelligently maps ICP fields to text layers
    ↓
Returns mappings with confidence scores
    ↓
Plugin auto-fills fields with confidence ≥50%
    ↓
Success! 🎉
```

**See [SMART_MAPPING.md](./SMART_MAPPING.md) for technical details.**

## API Reference

The plugin uses these Flowtusk API endpoints:

### POST /api/analyze-website
```json
// Request
{ "url": "https://example.com" }

// Response
{ "factsJson": { "facts": [...], "evidence": [...] } }
```

### POST /api/generate-icps
```json
// Request
{ "factsJson": {...} }

// Response
{ 
  "icps": [
    {
      "personaName": "Sarah Chen",
      "personaRole": "VP of Engineering",
      "personaCompany": "TechCorp (500 employees)",
      "goals": ["Scale infrastructure", "Improve security"],
      "painPoints": ["Manual deployments", "Legacy systems"]
    }
  ]
}
```

### POST /api/figma-template-mapper (NEW!)
```json
// Request
{
  "textLayers": [
    {
      "id": "12:34",
      "name": "Text 1",
      "content": "John Doe",
      "x": 50, "y": 50,
      "width": 200, "height": 30,
      "fontSize": 24,
      "parentName": "Card"
    }
  ],
  "icpData": { "personaName": "Sarah Chen", ... }
}

// Response
{
  "templateType": "persona",
  "mappings": [
    {
      "layerId": "12:34",
      "icpField": "personaName",
      "confidence": 85,
      "reason": "Content matches name pattern"
    }
  ],
  "confidence": 85
}
```

## Development

### Watch Mode

```bash
npm run watch
```

Recompiles on every save. Reload plugin in Figma to see changes:
- **Plugins** → **Development** → **Reload**

### File Structure

```
figma-plugin/
├── manifest.json    # Plugin metadata
├── code.ts          # TypeScript source (business logic)
├── code.js          # Compiled output (generated)
├── ui.html          # Plugin UI (modal)
├── tsconfig.json    # TypeScript config
├── package.json     # Dependencies
└── README.md        # This file
```

## Troubleshooting

### "No matching text fields found"

**Solution:** Make sure your text layers are named correctly:
- Layer names must contain keywords like "name", "role", "goals", etc.
- Check for typos
- Names are case-insensitive

### "Analysis failed" or "ICP generation failed"

**Possible causes:**
- Invalid URL format (must start with `http://` or `https://`)
- Website is unreachable or blocks scraping
- API rate limits reached

**Solution:**
- Check the URL
- Try a different website
- Wait a few minutes and retry

### Plugin doesn't load

**Solution:**
- Run `npm run build` first
- Make sure you're using Figma **Desktop App** (not browser)
- Check for TypeScript errors in console

### Changes not appearing

**Solution:**
- Reload plugin: **Plugins** → **Development** → **Reload**
- Or close and reopen the plugin

## Customization

### Change API Endpoint

Edit `code.ts` and replace `https://flowtusk.vercel.app` with your own backend:

```typescript
const analyzeResponse = await fetch('YOUR_BACKEND_URL/api/analyze-website', {
  // ...
});
```

### Add More Field Mappings

Edit the `fieldMappings` object in `code.ts`:

```typescript
const fieldMappings: Record<string, string> = {
  'custom field': 'icpFieldName',
  // ...
};
```

### Support Multiple Personas

Currently fills the first ICP only. To fill all 3:

```typescript
// In fillPersonaData(), loop through ICPs instead of using icps[0]
for (let i = 0; i < icps.length; i++) {
  const icp = icps[i];
  // ... fill logic with index suffix (e.g., "Name 1", "Name 2")
}
```

## Publishing (Optional)

To publish to Figma Community:

1. Test thoroughly with various websites
2. Add screenshots and examples
3. Go to **Plugins** → **Development** → **Publish**
4. Follow Figma's submission guidelines

## License

Proprietary - Part of Flowtusk MVP

## Support

Questions? Check:
- Main repo README at `/README.md`
- API docs at `/DEPLOYMENT.md`
- Open an issue or contact the team

---

**Built with ❤️ by Flowtusk**

