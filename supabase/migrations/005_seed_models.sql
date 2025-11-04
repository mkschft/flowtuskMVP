-- Seed initial models
INSERT INTO models (name, code, description)
VALUES 
  ('GPT-4o Mini', 'gpt-4o-mini', 'Fast and efficient model for general AI tasks'),
  ('Firecrawl Scraper', 'firecrawl-scraper', 'Firecrawl web scraping tool')
ON CONFLICT (code) DO NOTHING;

