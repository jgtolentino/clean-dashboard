/**
 * Supabase Realtime Utilities
 *
 * Provides hooks and utilities for real-time subscriptions to database changes,
 * broadcast messaging, and presence tracking.
 *
 * @see https://supabase.com/docs/guides/realtime
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
} from '@supabase/supabase-js'
import { supabase } from './client'
import type { Database } from './types'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']

// Realtime event types
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimePayload<T> {
  eventType: RealtimeEvent
  new: T | null
  old: T | null
  errors: string[] | null
}

/**
 * Hook to subscribe to real-time changes on a table
 *
 * @example
 * ```tsx
 * const { data, isConnected } = useRealtimeTable('sales_data', initialSales)
 * ```
 */
export function useRealtimeTable<T extends TableName>(
  tableName: T,
  initialData: TableRow<T>[] = [],
  options?: {
    event?: RealtimeEvent
    filter?: string
    onInsert?: (record: TableRow<T>) => void
    onUpdate?: (record: TableRow<T>, oldRecord: TableRow<T>) => void
    onDelete?: (oldRecord: TableRow<T>) => void
  }
): {
  data: TableRow<T>[]
  isConnected: boolean
  error: Error | null
} {
  const [data, setData] = useState<TableRow<T>[]>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Update data when initialData changes
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    const channelName = `realtime-${tableName}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on<TableRow<T>>(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: options?.event || '*',
          schema: 'public',
          table: tableName,
          filter: options?.filter,
        } as any,
        (payload: RealtimePostgresChangesPayload<TableRow<T>>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT' && newRecord) {
            setData((prev) => [...prev, newRecord])
            options?.onInsert?.(newRecord)
          } else if (eventType === 'UPDATE' && newRecord) {
            setData((prev) =>
              prev.map((item) =>
                (item as any).id === (newRecord as any).id ? newRecord : item
              )
            )
            options?.onUpdate?.(newRecord, oldRecord as TableRow<T>)
          } else if (eventType === 'DELETE' && oldRecord) {
            setData((prev) =>
              prev.filter((item) => (item as any).id !== (oldRecord as any).id)
            )
            options?.onDelete?.(oldRecord as TableRow<T>)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError(new Error('Failed to subscribe to realtime channel'))
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError(new Error('Realtime subscription timed out'))
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [tableName, options?.event, options?.filter])

  return { data, isConnected, error }
}

/**
 * Hook for broadcast messaging (pub/sub)
 *
 * @example
 * ```tsx
 * const { broadcast, messages } = useBroadcast('dashboard-updates')
 * broadcast({ type: 'filter-change', filters: {...} })
 * ```
 */
export function useBroadcast<T = any>(
  channelName: string,
  eventName: string = 'message'
): {
  broadcast: (payload: T) => Promise<void>
  messages: T[]
  isConnected: boolean
} {
  const [messages, setMessages] = useState<T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase.channel(channelName)

    channel
      .on('broadcast', { event: eventName }, (payload) => {
        setMessages((prev) => [...prev, payload.payload as T])
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [channelName, eventName])

  const broadcast = useCallback(
    async (payload: T) => {
      if (channelRef.current && isConnected) {
        await channelRef.current.send({
          type: 'broadcast',
          event: eventName,
          payload,
        })
      }
    },
    [eventName, isConnected]
  )

  return { broadcast, messages, isConnected }
}

/**
 * Hook for presence tracking (who's online)
 *
 * @example
 * ```tsx
 * const { users, track, isConnected } = usePresence('dashboard-room', {
 *   userId: user.id,
 *   name: user.name
 * })
 * ```
 */
export interface PresenceState<T = any> {
  [key: string]: T[]
}

export function usePresence<T extends { user_id: string }>(
  channelName: string,
  userState?: T
): {
  users: PresenceState<T>
  track: (state: T) => Promise<void>
  untrack: () => Promise<void>
  isConnected: boolean
} {
  const [users, setUsers] = useState<PresenceState<T>>({})
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userState?.user_id || 'anonymous',
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<T>()
        setUsers(state as PresenceState<T>)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          if (userState) {
            await channel.track(userState)
          }
        } else {
          setIsConnected(false)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [channelName])

  const track = useCallback(async (state: T) => {
    if (channelRef.current) {
      await channelRef.current.track(state)
    }
  }, [])

  const untrack = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack()
    }
  }, [])

  return { users, track, untrack, isConnected }
}

/**
 * Create a custom realtime channel for advanced use cases
 */
export function createRealtimeChannel(
  channelName: string,
  options?: {
    config?: {
      broadcast?: { self?: boolean; ack?: boolean }
      presence?: { key?: string }
    }
  }
): RealtimeChannel {
  return supabase.channel(channelName, options)
}

/**
 * Remove a realtime channel
 */
export async function removeRealtimeChannel(
  channel: RealtimeChannel
): Promise<void> {
  await supabase.removeChannel(channel)
}

/**
 * Get all active realtime channels
 */
export function getActiveChannels(): RealtimeChannel[] {
  return supabase.getChannels()
}

/**
 * Remove all realtime channels
 */
export async function removeAllChannels(): Promise<void> {
  await supabase.removeAllChannels()
}
