-- Create style_guides table for storing brand style guides with locale support
CREATE TABLE IF NOT EXISTS style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_flow UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  locale TEXT NOT NULL, -- e.g., "en-US", "es-ES", "fr-FR", "de-DE"
  
  -- Basic Info
  name TEXT,
  description TEXT,
  
  -- Colors (JSONB for flexible structure)
  colors JSONB DEFAULT '{}'::jsonb,
  -- Structure example:
  -- {
  --   "primary": "#1879ED",
  --   "secondary": "#E17D19",
  --   "accent": "#BB1CEC",
  --   "neutrals": {
  --     "50": "#F9FAFB",
  --     "100": "#F3F4F6",
  --     "200": "#E5E7EB",
  --     ...
  --   },
  --   "palette": [
  --     {"name": "Azure", "hex": "#1879ED"},
  --     {"name": "Zest", "hex": "#E17D19"}
  --   ]
  -- }
  
  -- Typography (JSONB)
  typography JSONB DEFAULT '{}'::jsonb,
  -- Structure example:
  -- {
  --   "heading": {
  --     "fontFamily": "Geist Sans",
  --     "sizes": {"h1": "2.5rem", "h2": "2rem", "h3": "1.5rem"},
  --     "weights": [400, 600, 700]
  --   },
  --   "body": {
  --     "fontFamily": "Geist Sans",
  --     "size": "1rem",
  --     "lineHeight": "1.5",
  --     "weight": 400
  --   }
  -- }
  
  -- Spacing & Layout (JSONB)
  spacing JSONB DEFAULT '{}'::jsonb,
  -- Structure example:
  -- {
  --   "scale": [4, 8, 12, 16, 24, 32, 48, 64],
  --   "breakpoints": {
  --     "sm": "640px",
  --     "md": "768px",
  --     "lg": "1024px",
  --     "xl": "1280px"
  --   }
  -- }
  
  -- UI Components (JSONB)
  components JSONB DEFAULT '{}'::jsonb,
  -- Structure example:
  -- {
  --   "buttons": {
  --     "primary": {
  --       "bg": "#1879ED",
  --       "text": "#FFFFFF",
  --       "radius": "8px",
  --       "padding": "12px 24px"
  --     },
  --     "secondary": {...}
  --   },
  --   "cards": {
  --     "bg": "#FFFFFF",
  --     "border": "#E5E7EB",
  --     "radius": "12px",
  --     "shadow": "0 1px 3px rgba(0,0,0,0.1)"
  --   },
  --   "forms": {...}
  -- }
  
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  brand_voice TEXT, -- e.g., "Professional, friendly, innovative"
  
  -- Effects (JSONB)
  effects JSONB DEFAULT '{}'::jsonb,
  -- Structure example:
  -- {
  --   "shadows": [
  --     "0 1px 2px rgba(0,0,0,0.05)",
  --     "0 4px 6px rgba(0,0,0,0.1)",
  --     "0 10px 15px rgba(0,0,0,0.1)"
  --   ],
  --   "gradients": [
  --     "linear-gradient(to right, #7c3aed, #8b5cf6)"
  --   ],
  --   "borders": {
  --     "default": "1px solid #E5E7EB",
  --     "radius": "8px"
  --   }
  -- }
  
  -- Source
  source_url TEXT, -- URL of the website this was extracted from
  extraction_method TEXT, -- e.g., "css_parser", "ai_inference", "manual"
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique style guide per flow+locale combination
  UNIQUE(parent_flow, locale)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS style_guides_parent_flow_idx ON style_guides(parent_flow);
CREATE INDEX IF NOT EXISTS style_guides_locale_idx ON style_guides(locale);
CREATE INDEX IF NOT EXISTS style_guides_parent_flow_locale_idx ON style_guides(parent_flow, locale);
CREATE INDEX IF NOT EXISTS style_guides_created_at_idx ON style_guides(created_at DESC);

-- Enable Row Level Security
ALTER TABLE style_guides ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view style guides from their own flows
CREATE POLICY "Users can view style guides from their own flows"
  ON style_guides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = style_guides.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can insert style guides to their own flows
CREATE POLICY "Users can insert style guides to their own flows"
  ON style_guides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = style_guides.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can update style guides in their own flows
CREATE POLICY "Users can update style guides in their own flows"
  ON style_guides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = style_guides.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Policy: Users can delete style guides from their own flows
CREATE POLICY "Users can delete style guides from their own flows"
  ON style_guides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = style_guides.parent_flow
      AND flows.author = auth.uid()
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_style_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on style_guides
CREATE TRIGGER update_style_guides_updated_at
  BEFORE UPDATE ON style_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_style_guides_updated_at();

-- Create junction table: site_style_guides
-- Links sites to style guides with locale support
CREATE TABLE IF NOT EXISTS site_style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  style_guide_id UUID NOT NULL REFERENCES style_guides(id) ON DELETE CASCADE,
  locale TEXT NOT NULL, -- Redundant but useful for queries and validation
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one style guide per site+locale combination
  UNIQUE(site_id, locale)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS site_style_guides_site_id_idx ON site_style_guides(site_id);
CREATE INDEX IF NOT EXISTS site_style_guides_style_guide_id_idx ON site_style_guides(style_guide_id);
CREATE INDEX IF NOT EXISTS site_style_guides_locale_idx ON site_style_guides(locale);
CREATE INDEX IF NOT EXISTS site_style_guides_site_locale_idx ON site_style_guides(site_id, locale);

-- Enable Row Level Security
ALTER TABLE site_style_guides ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view site_style_guides from their own flows
CREATE POLICY "Users can view site_style_guides from their own flows"
  ON site_style_guides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_style_guides.site_id
      AND EXISTS (
        SELECT 1 FROM flows
        WHERE flows.id = sites.parent_flow
        AND flows.author = auth.uid()
      )
    )
  );

-- Policy: Users can insert site_style_guides to their own flows
CREATE POLICY "Users can insert site_style_guides to their own flows"
  ON site_style_guides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_style_guides.site_id
      AND EXISTS (
        SELECT 1 FROM flows
        WHERE flows.id = sites.parent_flow
        AND flows.author = auth.uid()
      )
    )
  );

-- Policy: Users can update site_style_guides in their own flows
CREATE POLICY "Users can update site_style_guides in their own flows"
  ON site_style_guides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_style_guides.site_id
      AND EXISTS (
        SELECT 1 FROM flows
        WHERE flows.id = sites.parent_flow
        AND flows.author = auth.uid()
      )
    )
  );

-- Policy: Users can delete site_style_guides from their own flows
CREATE POLICY "Users can delete site_style_guides from their own flows"
  ON site_style_guides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = site_style_guides.site_id
      AND EXISTS (
        SELECT 1 FROM flows
        WHERE flows.id = sites.parent_flow
        AND flows.author = auth.uid()
      )
    )
  );

