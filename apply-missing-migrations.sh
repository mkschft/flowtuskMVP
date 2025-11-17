#!/bin/bash
# Apply missing migrations 007 and 008 to Supabase database

echo "🔧 Applying missing migrations to Supabase..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  exit 1
fi

# Extract Supabase URL and anon key
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: Could not find Supabase credentials in .env.local"
  exit 1
fi

echo "📊 Found Supabase project: $SUPABASE_URL"
echo ""
echo "⚠️  IMPORTANT: These migrations need to be applied via Supabase Dashboard"
echo ""
echo "Steps:"
echo "1. Go to: ${SUPABASE_URL}/project/_/sql/new"
echo "2. Copy the contents of: supabase/migrations/007_create_positioning_value_props_table.sql"
echo "3. Paste and run in SQL editor"
echo "4. Copy the contents of: supabase/migrations/008_create_positioning_design_assets_table.sql"
echo "5. Paste and run in SQL editor"
echo ""
echo "Or run this command to print the SQL:"
echo "  cat supabase/migrations/007_create_positioning_value_props_table.sql"
echo "  cat supabase/migrations/008_create_positioning_design_assets_table.sql"
