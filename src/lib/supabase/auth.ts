/**
 * Supabase Auth Utilities
 *
 * Provides hooks and functions for authentication in a Vite/React application.
 * Compatible with React 18+ and works client-side only.
 *
 * @see https://supabase.com/docs/guides/auth
 */

import { useEffect, useState, useCallback } from 'react'
import {
  User,
  Session,
  AuthError,
  AuthChangeEvent,
  Provider,
} from '@supabase/supabase-js'
import { supabase } from './client'
import type { Profile, UserRole } from './types'

// Auth state interface
export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: AuthError | null
}

// Sign up options
export interface SignUpOptions {
  email: string
  password: string
  metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
}

// Sign in options
export interface SignInOptions {
  email: string
  password: string
}

/**
 * Hook to manage authentication state
 *
 * @example
 * ```tsx
 * const { user, profile, loading, signIn, signOut } = useAuth()
 *
 * if (loading) return <Spinner />
 * if (!user) return <LoginPage />
 * return <Dashboard user={user} profile={profile} />
 * ```
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  })

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('[Auth] Failed to fetch profile:', error.message)
        return null
      }

      return data as Profile
    } catch (err) {
      console.error('[Auth] Profile fetch error:', err)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          if (mounted) {
            setState((prev) => ({ ...prev, error, loading: false }))
          }
          return
        }

        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            error: null,
          })
        } else if (mounted) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      } catch (err) {
        console.error('[Auth] Init error:', err)
        if (mounted) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return

        console.log('[Auth] State change:', event)

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Sign up with email/password
  const signUp = useCallback(async (options: SignUpOptions) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signUp({
      email: options.email,
      password: options.password,
      options: {
        data: options.metadata,
      },
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }))
      throw error
    }

    return data
  }, [])

  // Sign in with email/password
  const signIn = useCallback(async (options: SignInOptions) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }))
      throw error
    }

    return data
  }, [])

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    setState((prev) => ({ ...prev, loading: false, error: error || null }))

    if (error) throw error
    return data
  }, [])

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: Provider) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }))
      throw error
    }

    return data
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { error } = await supabase.auth.signOut()

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error }))
      throw error
    }
  }, [])

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single()

    if (error) throw error

    setState((prev) => ({ ...prev, profile: data as Profile }))
    return data as Profile
  }, [state.user])

  // Update user metadata
  const updateUserMetadata = useCallback(async (metadata: Record<string, any>) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    })

    if (error) throw error
    return data.user
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
    return data
  }, [])

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
    return data
  }, [])

  // Refresh session
  const refreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) throw error
    return data.session
  }, [])

  return {
    // State
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,

    // Auth methods
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,

    // Profile methods
    updateProfile,
    updateUserMetadata,

    // Password methods
    resetPassword,
    updatePassword,

    // Session methods
    refreshSession,
  }
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(requiredRole: UserRole | UserRole[]): boolean {
  const { profile } = useAuth()

  if (!profile) return false

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(profile.role)
}

/**
 * Hook to protect routes/components
 *
 * @example
 * ```tsx
 * const { isAllowed, isLoading } = useProtectedRoute(['executive', 'regional_manager'])
 *
 * if (isLoading) return <Spinner />
 * if (!isAllowed) return <Navigate to="/unauthorized" />
 * return <AdminPanel />
 * ```
 */
export function useProtectedRoute(allowedRoles?: UserRole[]) {
  const { user, profile, loading } = useAuth()

  const isAllowed = (() => {
    if (!user) return false
    if (!allowedRoles || allowedRoles.length === 0) return true
    if (!profile) return false
    return allowedRoles.includes(profile.role)
  })()

  return {
    isAllowed,
    isLoading: loading,
    user,
    profile,
  }
}

/**
 * Get current user (non-hook version for use outside components)
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get current session (non-hook version)
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated (non-hook version)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}
