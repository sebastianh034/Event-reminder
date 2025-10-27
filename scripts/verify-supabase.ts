/**
 * Supabase Connection Verification Script
 * Run this to verify your Supabase connection is working
 *
 * Usage: npx ts-node scripts/verify-supabase.ts
 */

import { supabase } from '../utils/supabase';

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase Connection...\n');

  // Test 1: Check Supabase client is initialized
  console.log('✅ Supabase client initialized');
  console.log(`   URL: ${supabase.supabaseUrl}`);

  // Test 2: Check database connection
  console.log('\n📊 Testing database connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count');

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('❌ Database tables not created yet');
        console.log('   → Run the SQL migration in Supabase dashboard');
        console.log('   → See: supabase/migrations/001_initial_schema.sql');
      } else {
        console.log('❌ Database connection error:', error.message);
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('✅ Profiles table exists');
    }
  } catch (e) {
    console.log('❌ Failed to connect to database');
    console.error(e);
  }

  // Test 3: Check auth configuration
  console.log('\n🔐 Testing auth configuration...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.log('❌ Auth error:', error.message);
    } else {
      console.log('✅ Auth service is accessible');
      if (session) {
        console.log('✅ Active session found');
        console.log(`   User: ${session.user.email}`);
      } else {
        console.log('ℹ️  No active session (not signed in)');
      }
    }
  } catch (e) {
    console.log('❌ Failed to check auth status');
    console.error(e);
  }

  // Test 4: Check all required tables
  console.log('\n📋 Checking required tables...');
  const tables = ['profiles', 'push_tokens', 'artists', 'followed_artists', 'events'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0);

      if (error) {
        console.log(`❌ ${table} - not found`);
      } else {
        console.log(`✅ ${table} - exists`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error checking`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📝 NEXT STEPS:');
  console.log('='.repeat(50));
  console.log('1. If tables don\'t exist:');
  console.log('   → Open Supabase Dashboard');
  console.log('   → Go to SQL Editor');
  console.log('   → Run: supabase/migrations/001_initial_schema.sql');
  console.log('');
  console.log('2. Test authentication:');
  console.log('   → Run your app: npm start');
  console.log('   → Create a test account');
  console.log('   → Verify user appears in Supabase dashboard');
  console.log('');
  console.log('3. Configure email templates:');
  console.log('   → Supabase Dashboard → Auth → Email Templates');
  console.log('   → Update "Reset Password" redirect URL');
  console.log('');
  console.log('📚 See SUPABASE_SETUP_INSTRUCTIONS.md for details');
  console.log('='.repeat(50));
}

// Run the verification
verifySupabaseConnection()
  .then(() => {
    console.log('\n✨ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
