#!/usr/bin/env node
/**
 * Minimal verification script for Supabase connection
 * Tests connection to odoo_mirror.v_transaction_trends view
 *
 * Usage: node scripts/verify-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - VITE_SUPABASE_URL');
  if (!supabaseAnonKey) console.error('  - VITE_SUPABASE_ANON_KEY');
  console.error('\nCreate .env.local with:');
  console.error('  VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY=<your-anon-key>');
  process.exit(1);
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log('🔍 Supabase Connection Verification\n');
console.log('Configuration:');
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

async function verify() {
  try {
    // Test 1: Query v_transaction_trends (sample 5 rows)
    console.log('Test 1: Query v_transaction_trends (sample 5 rows)');
    const { data: trends, error: trendsError } = await supabase
      .from('odoo_mirror.v_transaction_trends')
      .select('*')
      .limit(5);

    if (trendsError) {
      console.error('❌ Failed to query v_transaction_trends');
      console.error(`   Error: ${trendsError.message}`);
      console.error(`   Code: ${trendsError.code}`);
      console.error(`   Details: ${JSON.stringify(trendsError.details, null, 2)}`);

      if (trendsError.code === 'PGRST202') {
        console.error('\n⚠️  Likely causes:');
        console.error('   1. View odoo_mirror.v_transaction_trends does not exist');
        console.error('   2. RLS policy blocks anon access to view');
        console.error('   3. Schema not applied: db/migrations/odoo_mirror_schema.sql');
      }
      return false;
    }

    console.log(`✅ Success! Retrieved ${trends?.length || 0} rows`);
    if (trends && trends.length > 0) {
      console.log('   Sample row:');
      console.log(`   ${JSON.stringify(trends[0], null, 2)}`);
    } else {
      console.log('   ⚠️  View exists but contains no data (ETL may not be running)');
    }
    console.log('');

    // Test 2: Query v_invoice_summary (sample 5 rows)
    console.log('Test 2: Query v_invoice_summary (sample 5 rows)');
    const { data: invoices, error: invoicesError } = await supabase
      .from('odoo_mirror.v_invoice_summary')
      .select('*')
      .limit(5);

    if (invoicesError) {
      console.error('❌ Failed to query v_invoice_summary');
      console.error(`   Error: ${invoicesError.message}`);
      return false;
    }

    console.log(`✅ Success! Retrieved ${invoices?.length || 0} rows`);
    console.log('');

    // Test 3: Query v_expense_summary (sample 5 rows)
    console.log('Test 3: Query v_expense_summary (sample 5 rows)');
    const { data: expenses, error: expensesError } = await supabase
      .from('odoo_mirror.v_expense_summary')
      .select('*')
      .limit(5);

    if (expensesError) {
      console.error('❌ Failed to query v_expense_summary');
      console.error(`   Error: ${expensesError.message}`);
      return false;
    }

    console.log(`✅ Success! Retrieved ${expenses?.length || 0} rows`);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ All tests passed!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Replace mock data services with analytics.ts');
    console.log('  2. Update TypeScript types to match view schemas');
    console.log('  3. Test dashboard pages with real data');
    console.log('═══════════════════════════════════════');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error during verification:');
    console.error(error);
    return false;
  }
}

// Run verification
verify().then(success => {
  process.exit(success ? 0 : 1);
});
