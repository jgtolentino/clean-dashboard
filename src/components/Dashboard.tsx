import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

interface DashboardProps {
  session: Session | null
}

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}

export default function Dashboard({ session }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      getProfile()
    } else {
      // Demo mode - no session
      setProfile({
        id: 'demo-user',
        email: 'demo@suqianalytics.com',
        full_name: 'Demo User'
      })
      setFullName('Demo User')
      setLoading(false)
    }
  }, [session])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
      } else {
        // Create profile if doesn't exist
        const newProfile: Profile = {
          id: session!.user.id,
          email: session!.user.email!,
        }
        setProfile(newProfile)
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      alert('Demo mode - changes not saved')
      return
    }

    setSaving(true)

    try {
      const updates = {
        id: session.user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error

      setProfile({ ...profile!, full_name: fullName })
      alert('Profile updated!')
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Suqi Analytics</h1>
        <button onClick={handleSignOut} className="btn btn-secondary">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <div className="profile-card">
          <h2>Profile</h2>
          <form onSubmit={updateProfile}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                value={profile?.email || 'demo@suqianalytics.com'}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>User ID</h3>
            <p className="stat-value">{session?.user?.id?.slice(0, 8) || 'demo-use'}...</p>
          </div>
          <div className="stat-card">
            <h3>Email Confirmed</h3>
            <p className="stat-value">
              {session?.user?.email_confirmed_at ? '✅ Yes' : '✅ Demo'}
            </p>
          </div>
          <div className="stat-card">
            <h3>Last Sign In</h3>
            <p className="stat-value">
              {session?.user?.last_sign_in_at
                ? new Date(session.user.last_sign_in_at).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="stat-card">
            <h3>Created At</h3>
            <p className="stat-value">
              {session?.user?.created_at
                ? new Date(session.user.created_at).toLocaleDateString()
                : '2025-01-01'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
