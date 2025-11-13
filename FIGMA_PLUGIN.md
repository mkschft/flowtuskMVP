# Flowtusk Figma Plugin

Auto-fill persona templates in Figma with real customer data from your website.

## Quick Start

### 1. Install the Plugin

```bash
cd figma-plugin
npm install
npm run build
```

### 2. Load in Figma

1. Open **Figma Desktop App**
2. **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `figma-plugin/manifest.json`

### 3. Use It

1. Create text layers in Figma named: "Persona Name", "Role", "Company", "Goals", "Pain Points"
2. Run the plugin: **Plugins** → **Development** → **Flowtusk Persona Filler**
3. Enter any website URL
4. Click **Generate Personas**
5. Watch it auto-fill! ✨

## What It Does

- **Analyzes any website** using your production API
- **Generates 3 detailed personas** with AI
- **Auto-fills text layers** based on their names
- **No manual data entry** needed

## Architecture

```
Figma Plugin → flowtusk.vercel.app/api → Returns ICPs → Auto-fill text nodes
```

The plugin is completely separate from your web app - it just calls the same backend APIs.

## Files

- `code.ts` - Plugin logic (TypeScript)
- `ui.html` - Plugin UI modal
- `manifest.json` - Figma plugin config
- Full docs in `figma-plugin/README.md`

## Development

Watch mode (auto-recompile on save):

```bash
cd figma-plugin
npm run watch
```

Then reload plugin in Figma after changes.

## Notes

- Uses the same backend as your web app
- CORS already configured (those 5 commits from earlier)
- Zero impact on existing app
- Can be published to Figma Community later

---

For detailed instructions, see `figma-plugin/README.md`

