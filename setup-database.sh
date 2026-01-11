#!/bin/bash

echo "🚀 Clean Dashboard - Database Setup"
echo "===================================="
echo ""
echo "This script will set up the profiles table in your Supabase database."
echo ""
echo "Project: spdtwktxdalcfigzeqrz"
echo "URL: https://spdtwktxdalcfigzeqrz.supabase.co"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo ""
    echo "Option 1: Using Supabase CLI (Recommended)"
    echo "==========================================="
    echo "Run: supabase db push"
    echo ""
fi

echo "Option 2: Using psql directly"
echo "=============================="
echo ""
echo "You'll need your database password from:"
echo "https://supabase.com/dashboard/project/spdtwktxdalcfigzeqrz/settings/database"
echo ""
echo "Then run:"
echo "psql 'postgresql://postgres.spdtwktxdalcfigzeqrz:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres' -f supabase/migrations/001_profiles_table.sql"
echo ""

echo "Option 3: Using Supabase Dashboard"
echo "==================================="
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/spdtwktxdalcfigzeqrz/editor"
echo "2. Click 'SQL Editor'"
echo "3. Copy and paste the contents of: supabase/migrations/001_profiles_table.sql"
echo "4. Click 'Run'"
echo ""

echo "After setting up the database, run: npm run dev"
