# Example Persona Template for Figma

Use this guide to create a test template in Figma that works with the Flowtusk plugin.

## Quick Setup

### 1. Create a Frame (Persona Card)

- Press `F` or use the Frame tool
- Size: 400 × 600px
- Name: "Persona Card"

### 2. Add Text Layers (Inside the Frame)

Add these text layers **with exact names** for auto-fill:

| Text Layer Name | Will Be Filled With | Example Value |
|----------------|---------------------|---------------|
| `Persona Name` | Full name | "Sarah Chen" |
| `Role` | Job title | "VP of Engineering" |
| `Company` | Company name + size | "TechCorp (500 employees)" |
| `Location` | City | "San Francisco" |
| `Country` | Country | "United States" |
| `Goals` | Bullet list of goals | "• Scale infrastructure<br>• Improve security" |
| `Pain Points` | Bullet list of challenges | "• Manual deployments<br>• Legacy systems" |
| `Description` | Segment description | "Enterprise CTOs seeking automation" |

### 3. Style Recommendations

#### Header Section
- **Persona Name**: 24px, Bold, Black
- **Role**: 16px, Regular, Gray (#666)
- **Company**: 14px, Regular, Gray (#666)

#### Body Section
- **Location/Country**: 12px, Regular, Gray
- **Goals/Pain Points**: 14px, Regular, Black, Line height 1.5

#### Spacing
- 24px top padding
- 16px between sections
- 24px left/right padding

### 4. Advanced: Multi-Column Layout

For a more detailed template:

```
Frame: Persona Dashboard (1200 × 800)
├─ Frame: Left Column (400px wide)
│  ├─ Text: "Persona Name"
│  ├─ Text: "Role"
│  ├─ Text: "Company"
│  └─ Text: "Location"
├─ Frame: Middle Column (400px wide)
│  ├─ Text: "Goals"
│  └─ Text: "Pain Points"
└─ Frame: Right Column (400px wide)
   ├─ Text: "Demographics"
   └─ Text: "Description"
```

## Testing the Plugin

1. Create your template with named text layers
2. Run plugin: **Plugins** → **Flowtusk Persona Filler**
3. Test URLs:
   - `https://stripe.com` - Payment platform
   - `https://notion.so` - Productivity tool
   - `https://figma.com` - Design platform
   - Any company website!
4. Click **Generate Personas**
5. Wait 10-20 seconds
6. Check your text fields!

## Tips

### Layer Naming Flexibility

The plugin is smart about matching. These all work:

- "Persona Name", "Name", "persona name" ✅
- "Job Title", "Role", "Persona Role" ✅
- "Pain Points", "Challenges", "Pains" ✅
- Case doesn't matter!

### Component Best Practices

1. **Create a Component** from your persona card
2. **Duplicate instances** for multiple personas
3. **Run plugin** - it fills all instances on the page

### Styling After Auto-Fill

The plugin fills with plain text. You can:
- Apply text styles after filling
- Use Figma's text replacement feature
- Keep your typography styles in sync

## Troubleshooting

### "No matching text fields found"

**Check:**
- Text layer names contain keywords (case-insensitive)
- Layers are actual TEXT nodes, not groups
- Layers are on the current page

### Nothing gets filled

**Check:**
- Plugin ran successfully (check status message)
- Text layers are named correctly
- Try selecting just one frame before running plugin

### Partial fills

**Expected!** The plugin only fills fields that:
- Have matching names
- Have data in the API response
- Some ICPs may not have all fields

## Example Frame Structure (Copy This)

```
📦 Persona Card [Frame]
├─ 📝 Persona Name [Text] ← Fills with persona name
├─ 📝 Role [Text] ← Fills with job title
├─ 📝 Company [Text] ← Fills with company
├─ 📝 Location [Text] ← Fills with city
├─ ─────────────── [Line]
├─ 📋 Goals [Text] ← Fills with goals list
├─ 📋 Pain Points [Text] ← Fills with pain points list
└─ 📝 Description [Text] ← Fills with description
```

---

**Pro Tip:** Create templates for different use cases (sales deck, persona research, user stories) and reuse them!

