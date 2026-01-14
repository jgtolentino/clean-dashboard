# Supabase Documentation Catalogue

> Comprehensive reference for Supabase integration in Scout Dashboard
> Generated from official documentation at https://supabase.com/docs

---

## Table of Contents

1. [Core Features](#core-features)
2. [Authentication](#authentication)
3. [Database](#database)
4. [Storage](#storage)
5. [Realtime](#realtime)
6. [Edge Functions](#edge-functions)
7. [Client Library API Reference](#client-library-api-reference)
8. [Security Best Practices](#security-best-practices)
9. [Integration Patterns](#integration-patterns)

---

## Core Features

Supabase provides a complete backend platform built on PostgreSQL:

| Feature | Description | Package/API |
|---------|-------------|-------------|
| **Database** | Full PostgreSQL with extensions | `supabase.from()` |
| **Authentication** | User management & auth flows | `supabase.auth` |
| **Storage** | File storage with CDN | `supabase.storage` |
| **Realtime** | WebSocket subscriptions | `supabase.channel()` |
| **Edge Functions** | Serverless TypeScript/Deno | `supabase.functions` |
| **Vector/AI** | pgvector for embeddings | SQL extensions |

---

## Authentication

### Supported Auth Methods

```typescript
// Email/Password
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })

// Magic Link (Passwordless)
await supabase.auth.signInWithOtp({ email })

// OAuth Providers
await supabase.auth.signInWithOAuth({
  provider: 'google' | 'github' | 'azure' | 'facebook' | 'twitter'
})

// Phone/SMS
await supabase.auth.signInWithOtp({ phone })

// Anonymous
await supabase.auth.signInAnonymously()
```

### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
})
```

### Multi-Factor Authentication (MFA)

```typescript
// Enroll TOTP
const { data } = await supabase.auth.mfa.enroll({ factorType: 'totp' })

// Verify TOTP
await supabase.auth.mfa.verify({ factorId, code })

// Challenge MFA
await supabase.auth.mfa.challenge({ factorId })
```

### User Metadata

```typescript
// Update user metadata (user-editable)
await supabase.auth.updateUser({
  data: { full_name: 'John Doe', avatar_url: '...' }
})

// Access in RLS policies via auth.jwt()->'user_metadata'
// App metadata (admin-only) via auth.jwt()->'app_metadata'
```

---

## Database

### Query Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from('table')
  .select('column1, column2, relation(*)') // with joins
  .eq('column', 'value')
  .order('column', { ascending: false })
  .range(0, 9) // pagination
  .single() // expect single row

// INSERT
const { data, error } = await supabase
  .from('table')
  .insert({ column: 'value' })
  .select() // return inserted row

// UPDATE
const { data, error } = await supabase
  .from('table')
  .update({ column: 'new_value' })
  .eq('id', 1)
  .select()

// DELETE
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', 1)

// UPSERT
const { data, error } = await supabase
  .from('table')
  .upsert({ id: 1, column: 'value' })
  .select()
```

### Filter Operators

```typescript
.eq('column', 'value')        // equals
.neq('column', 'value')       // not equals
.gt('column', 0)              // greater than
.gte('column', 0)             // greater than or equal
.lt('column', 10)             // less than
.lte('column', 10)            // less than or equal
.like('column', '%pattern%')  // LIKE
.ilike('column', '%PATTERN%') // case-insensitive LIKE
.is('column', null)           // IS NULL
.in('column', ['a', 'b'])     // IN array
.contains('array_col', ['a']) // array contains
.containedBy('array_col', ['a', 'b']) // array contained by
.textSearch('column', 'query') // full-text search
.filter('column', 'operator', 'value') // custom filter
```

### Row Level Security (RLS)

```sql
-- Enable RLS on table
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users view own data" ON public.my_table
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users insert own data" ON public.my_table
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users update own data" ON public.my_table
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users delete own data" ON public.my_table
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### RLS Helper Functions

```sql
auth.uid()          -- Returns the current user's UUID
auth.jwt()          -- Returns the current JWT claims
auth.role()         -- Returns the current role (anon, authenticated)
auth.email()        -- Returns the current user's email
```

### Database Functions (RPC)

```typescript
// Call a database function
const { data, error } = await supabase.rpc('function_name', {
  param1: 'value1',
  param2: 'value2'
})
```

---

## Storage

### Bucket Operations

```typescript
// List buckets
const { data } = await supabase.storage.listBuckets()

// Get bucket
const { data } = await supabase.storage.getBucket('bucket-name')

// Create bucket
const { data } = await supabase.storage.createBucket('bucket-name', {
  public: false,
  fileSizeLimit: 1024 * 1024 * 10, // 10MB
  allowedMimeTypes: ['image/png', 'image/jpeg']
})
```

### File Operations

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('bucket')
  .upload('path/to/file.png', file, {
    cacheControl: '3600',
    upsert: false
  })

// Download file
const { data, error } = await supabase.storage
  .from('bucket')
  .download('path/to/file.png')

// Get public URL
const { data } = supabase.storage
  .from('bucket')
  .getPublicUrl('path/to/file.png')

// Create signed URL (temporary access)
const { data, error } = await supabase.storage
  .from('bucket')
  .createSignedUrl('path/to/file.png', 3600) // 1 hour

// List files
const { data, error } = await supabase.storage
  .from('bucket')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })

// Delete files
const { error } = await supabase.storage
  .from('bucket')
  .remove(['path/to/file1.png', 'path/to/file2.png'])

// Move/rename file
const { error } = await supabase.storage
  .from('bucket')
  .move('old/path.png', 'new/path.png')
```

### Image Transformations

```typescript
// Get transformed image URL
const { data } = supabase.storage
  .from('bucket')
  .getPublicUrl('image.png', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover', // 'cover' | 'contain' | 'fill'
      format: 'webp',
      quality: 80
    }
  })
```

---

## Realtime

### Channel Subscriptions

```typescript
// Subscribe to database changes
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: 'public',
      table: 'my_table',
      filter: 'column=eq.value' // optional filter
    },
    (payload) => {
      console.log('Change received:', payload)
      // payload.eventType, payload.new, payload.old
    }
  )
  .subscribe()

// Unsubscribe
await supabase.removeChannel(channel)
```

### Broadcast (Pub/Sub)

```typescript
// Send broadcast message
const channel = supabase.channel('room-1')

channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    channel.send({
      type: 'broadcast',
      event: 'cursor-pos',
      payload: { x: 100, y: 200 }
    })
  }
})

// Receive broadcast messages
channel.on('broadcast', { event: 'cursor-pos' }, (payload) => {
  console.log('Cursor position:', payload)
})
```

### Presence (Online Status)

```typescript
const channel = supabase.channel('room-1')

// Track user presence
channel.on('presence', { event: 'sync' }, () => {
  const presenceState = channel.presenceState()
  console.log('Online users:', presenceState)
})

channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('User joined:', key, newPresences)
})

channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('User left:', key, leftPresences)
})

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: 'user-123',
      online_at: new Date().toISOString()
    })
  }
})
```

---

## Edge Functions

### Invoking Functions

```typescript
// Invoke edge function
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param: 'value' },
  headers: { 'Custom-Header': 'value' }
})

// With response type
const { data, error } = await supabase.functions.invoke<ResponseType>(
  'function-name',
  { body: { param: 'value' } }
)
```

### Edge Function Structure (Deno)

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Create Supabase client with auth context
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    }
  )

  // Get user from JWT
  const { data: { user } } = await supabaseClient.auth.getUser()

  // Your logic here
  const { param } = await req.json()

  return new Response(
    JSON.stringify({ message: 'Hello', user, param }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## Client Library API Reference

### Initialization

```typescript
import { createClient } from '@supabase/supabase-js'

// Basic client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// With options
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage, // or custom storage
    storageKey: 'supabase-auth'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-custom-header': 'value' }
  }
})
```

### TypeScript Support

```typescript
// Generate types with CLI:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Now fully typed!
const { data } = await supabase.from('users').select('*')
// data is typed as Database['public']['Tables']['users']['Row'][]
```

---

## Security Best Practices

### Environment Variables

```bash
# .env.local (never commit!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server-side only (Edge Functions, API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEVER expose to client!
```

### Key Types

| Key | Exposure | Use Case |
|-----|----------|----------|
| `anon` key | Safe for browser | Client-side queries (RLS enforced) |
| `service_role` key | Server-only | Admin operations (bypasses RLS) |
| `publishable` key | Safe for browser | New format replacing anon key |

### RLS Best Practices

1. **Always enable RLS** on tables exposed via API
2. **Use `auth.uid()`** to scope data to current user
3. **Index RLS columns** for performance (e.g., `user_id`)
4. **Test policies** with different user roles
5. **Use security definer functions** for complex operations

---

## Integration Patterns

### React Query + Supabase

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query hook
export function useTransactions(filters: Filters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .match(filters)
      if (error) throw error
      return data
    }
  })
}

// Mutation hook
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTx: Transaction) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTx)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}
```

### Zustand + Supabase

```typescript
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  session: Session | null
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })

    supabase.auth.onAuthStateChange((_, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  }
}))
```

### Realtime Subscription Pattern

```typescript
import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeTable<T>(tableName: string, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData)

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === (payload.new as any).id ? payload.new as T : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item: any) => item.id !== (payload.old as any).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName])

  return data
}
```

---

## Quick Reference Links

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript API Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database/overview)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

*Last updated: January 2026*
