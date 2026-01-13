import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Integration', () => {
  it('creates supabase client', () => {
    const supabase = createClient(
      'https://test.supabase.co',
      'test-key'
    );
    
    expect(supabase).toBeDefined();
  });

  it('has correct configuration', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });
});
