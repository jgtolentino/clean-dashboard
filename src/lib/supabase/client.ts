/**
 * Supabase Client Configuration
 *
 * Provides a singleton Supabase client for the Scout Dashboard.
 * Supports both browser and server-side usage with proper TypeScript types.
 *
 * @see https://supabase.com/docs/reference/javascript/introduction
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate configuration
function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is not set')
  } else if (SUPABASE_URL === 'https://your-project.supabase.co') {
    errors.push('VITE_SUPABASE_URL contains placeholder value')
  }

  if (!SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set')
  } else if (SUPABASE_ANON_KEY === 'your-anon-key') {
    errors.push('VITE_SUPABASE_ANON_KEY contains placeholder value')
  }

  return { isValid: errors.length === 0, errors }
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get the Supabase client instance
 * Creates a singleton client on first call
 */
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const { isValid, errors } = validateConfig()

  if (!isValid) {
    console.warn('[Supabase] Configuration issues:', errors)
    // Return a client anyway for development, but it won't work without proper config
  }

  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'scout-dashboard-auth',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'scout-dashboard',
      },
    },
  })

  return supabaseInstance
}

/**
 * Default export for convenience
 * Usage: import supabase from '@/lib/supabase/client'
 */
export const supabase = getSupabase()

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const { isValid } = validateConfig()
  return isValid
}

/**
 * Get the current Supabase configuration status
 */
export function getSupabaseStatus(): {
  configured: boolean
  url: string
  hasKey: boolean
} {
  return {
    configured: isSupabaseConfigured(),
    url: SUPABASE_URL ? SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0] : 'not-set',
    hasKey: !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'your-anon-key',
  }
}

export default supabase
