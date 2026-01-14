/**
 * Supabase Query Hooks
 *
 * React Query integration for Supabase data fetching.
 * Provides type-safe hooks with caching, refetching, and optimistic updates.
 *
 * @see https://tanstack.com/query/latest
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { supabase } from './client'
import type {
  Database,
  Transaction,
  SalesData,
  ConsumerData,
  Profile,
  Store,
} from './types'

// Query keys factory
export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (filters: TransactionFilters) => [...queryKeys.transactions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
    kpis: (filters?: TransactionFilters) => [...queryKeys.transactions.all, 'kpis', filters] as const,
  },
  sales: {
    all: ['sales'] as const,
    list: (filters: SalesFilters) => [...queryKeys.sales.all, 'list', filters] as const,
    byRegion: (region: string) => [...queryKeys.sales.all, 'region', region] as const,
    byCategory: (category: string) => [...queryKeys.sales.all, 'category', category] as const,
  },
  consumers: {
    all: ['consumers'] as const,
    list: (filters?: ConsumerFilters) => [...queryKeys.consumers.all, 'list', filters] as const,
  },
  filters: {
    regions: ['filters', 'regions'] as const,
    cities: (region: string) => ['filters', 'cities', region] as const,
    barangays: (city: string) => ['filters', 'barangays', city] as const,
    categories: ['filters', 'categories'] as const,
    brands: (category: string) => ['filters', 'brands', category] as const,
    skus: (brand: string) => ['filters', 'skus', brand] as const,
  },
  stores: {
    all: ['stores'] as const,
    list: (filters?: StoreFilters) => [...queryKeys.stores.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.stores.all, 'detail', id] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    detail: (id: string) => [...queryKeys.profiles.all, 'detail', id] as const,
  },
}

// Filter types
export interface TransactionFilters {
  startDate?: string
  endDate?: string
  region?: string
  city?: string
  barangay?: string
  category?: string
  brand?: string
  sku?: string
  store?: number
  limit?: number
  offset?: number
}

export interface SalesFilters {
  dateRange?: { start: Date | null; end: Date | null }
  region?: string | null
  city?: string | null
  barangay?: string | null
  category?: string | null
  brand?: string | null
  sku?: string | null
}

export interface ConsumerFilters {
  region?: string
  ageGroup?: string
  gender?: string
}

export interface StoreFilters {
  region?: string
  city?: string
}

// KPI summary type
export interface KpiSummary {
  totalTransactions: number
  totalRevenue: number
  uniqueStores: number
  uniqueBrands: number
  uniqueDevices: number
  dateRange: { min: string | null; max: string | null }
}

// ============================================
// Transaction Hooks
// ============================================

/**
 * Fetch paginated transactions
 */
export function useTransactions(
  filters: TransactionFilters = {},
  options?: UseQueryOptions<Transaction[], Error>
) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('scout_gold_transactions_flat')
        .select('*')

      if (filters.startDate) {
        query = query.gte('date_ph', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('date_ph', filters.endDate)
      }
      if (filters.region) {
        query = query.eq('storelocationmaster', filters.region)
      }
      if (filters.city) {
        query = query.eq('location', filters.city)
      }
      if (filters.barangay) {
        query = query.eq('barangay', filters.barangay)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand)
      }
      if (filters.sku) {
        query = query.eq('sku', filters.sku)
      }
      if (filters.store) {
        query = query.eq('store', filters.store)
      }

      query = query
        .order('date_ph', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)

      const { data, error } = await query

      if (error) throw error
      return (data || []) as Transaction[]
    },
    ...options,
  })
}

/**
 * Fetch transaction KPIs
 */
export function useTransactionKpis(
  filters?: TransactionFilters,
  options?: UseQueryOptions<KpiSummary, Error>
) {
  return useQuery({
    queryKey: queryKeys.transactions.kpis(filters),
    queryFn: async () => {
      let query = supabase
        .from('scout_gold_transactions_flat')
        .select('transaction_id, total_price, store, brand, device, date_ph')

      if (filters?.startDate) {
        query = query.gte('date_ph', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date_ph', filters.endDate)
      }
      if (filters?.region) {
        query = query.eq('storelocationmaster', filters.region)
      }

      const { data, error } = await query

      if (error) throw error

      const rows = data || []
      const uniqueStores = new Set(rows.map((r) => r.store)).size
      const uniqueBrands = new Set(rows.map((r) => r.brand)).size
      const uniqueDevices = new Set(rows.map((r) => r.device)).size
      const totalRevenue = rows.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0)
      const dates = rows.map((r) => r.date_ph).filter(Boolean).sort()

      return {
        totalTransactions: rows.length,
        totalRevenue,
        uniqueStores,
        uniqueBrands,
        uniqueDevices,
        dateRange: {
          min: dates[0] || null,
          max: dates[dates.length - 1] || null,
        },
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// ============================================
// Sales Data Hooks
// ============================================

/**
 * Fetch sales data with filters
 */
export function useSalesData(
  filters: SalesFilters = {},
  options?: UseQueryOptions<SalesData[], Error>
) {
  return useQuery({
    queryKey: queryKeys.sales.list(filters),
    queryFn: async () => {
      let query = supabase.from('sales_data').select('*')

      if (filters.dateRange?.start) {
        query = query.gte('date', filters.dateRange.start.toISOString())
      }
      if (filters.dateRange?.end) {
        query = query.lte('date', filters.dateRange.end.toISOString())
      }
      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.barangay) {
        query = query.eq('barangay', filters.barangay)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.brand) {
        query = query.eq('brand', filters.brand)
      }
      if (filters.sku) {
        query = query.eq('sku', filters.sku)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as SalesData[]
    },
    ...options,
  })
}

// ============================================
// Consumer Data Hooks
// ============================================

/**
 * Fetch consumer data
 */
export function useConsumerData(
  filters: ConsumerFilters = {},
  options?: UseQueryOptions<ConsumerData[], Error>
) {
  return useQuery({
    queryKey: queryKeys.consumers.list(filters),
    queryFn: async () => {
      let query = supabase.from('consumer_data').select('*')

      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      if (filters.ageGroup) {
        query = query.eq('age_group', filters.ageGroup)
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as ConsumerData[]
    },
    ...options,
  })
}

// ============================================
// Filter Options Hooks
// ============================================

/**
 * Fetch unique regions
 */
export function useRegions() {
  return useQuery({
    queryKey: queryKeys.filters.regions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_data')
        .select('region')
        .order('region')

      if (error) throw error

      const uniqueRegions = [...new Set(data?.map((d) => d.region) || [])]
      return uniqueRegions.map((r) => ({ value: r, label: r }))
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - regions don't change often
  })
}

/**
 * Fetch cities for a region
 */
export function useCities(region: string | null) {
  return useQuery({
    queryKey: queryKeys.filters.cities(region || ''),
    queryFn: async () => {
      if (!region) return []

      const { data, error } = await supabase
        .from('sales_data')
        .select('city')
        .eq('region', region)
        .order('city')

      if (error) throw error

      const uniqueCities = [...new Set(data?.map((d) => d.city) || [])]
      return uniqueCities.map((c) => ({ value: c, label: c }))
    },
    enabled: !!region,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Fetch barangays for a city
 */
export function useBarangays(city: string | null) {
  return useQuery({
    queryKey: queryKeys.filters.barangays(city || ''),
    queryFn: async () => {
      if (!city) return []

      const { data, error } = await supabase
        .from('sales_data')
        .select('barangay')
        .eq('city', city)
        .order('barangay')

      if (error) throw error

      const uniqueBarangays = [...new Set(data?.map((d) => d.barangay) || [])]
      return uniqueBarangays.map((b) => ({ value: b, label: b }))
    },
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Fetch unique categories
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.filters.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_data')
        .select('category')
        .order('category')

      if (error) throw error

      const uniqueCategories = [...new Set(data?.map((d) => d.category) || [])]
      return uniqueCategories.map((c) => ({ value: c, label: c }))
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Fetch brands for a category
 */
export function useBrands(category: string | null) {
  return useQuery({
    queryKey: queryKeys.filters.brands(category || ''),
    queryFn: async () => {
      if (!category) return []

      const { data, error } = await supabase
        .from('sales_data')
        .select('brand')
        .eq('category', category)
        .order('brand')

      if (error) throw error

      const uniqueBrands = [...new Set(data?.map((d) => d.brand) || [])]
      return uniqueBrands.map((b) => ({ value: b, label: b }))
    },
    enabled: !!category,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Fetch SKUs for a brand
 */
export function useSkus(brand: string | null) {
  return useQuery({
    queryKey: queryKeys.filters.skus(brand || ''),
    queryFn: async () => {
      if (!brand) return []

      const { data, error } = await supabase
        .from('sales_data')
        .select('sku')
        .eq('brand', brand)
        .order('sku')

      if (error) throw error

      const uniqueSkus = [...new Set(data?.map((d) => d.sku) || [])]
      return uniqueSkus.map((s) => ({ value: s, label: s }))
    },
    enabled: !!brand,
    staleTime: 30 * 60 * 1000,
  })
}

// ============================================
// Store Hooks
// ============================================

/**
 * Fetch stores
 */
export function useStores(
  filters: StoreFilters = {},
  options?: UseQueryOptions<Store[], Error>
) {
  return useQuery({
    queryKey: queryKeys.stores.list(filters),
    queryFn: async () => {
      let query = supabase.from('stores').select('*')

      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return (data || []) as Store[]
    },
    ...options,
  })
}

/**
 * Fetch single store
 */
export function useStore(
  storeId: string | null,
  options?: UseQueryOptions<Store, Error>
) {
  return useQuery({
    queryKey: queryKeys.stores.detail(storeId || ''),
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID required')

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) throw error
      return data as Store
    },
    enabled: !!storeId,
    ...options,
  })
}

// ============================================
// Profile Hooks
// ============================================

/**
 * Fetch user profile
 */
export function useProfile(
  userId: string | null,
  options?: UseQueryOptions<Profile, Error>
) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    ...options,
  })
}

/**
 * Update user profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) })
    },
  })
}

// ============================================
// RPC / Custom Queries
// ============================================

/**
 * Execute custom SQL query (for AI assistant)
 */
export function useExecuteQuery() {
  return useMutation({
    mutationFn: async (sql: string) => {
      const { data, error } = await supabase.rpc('execute_sql', { query: sql })

      if (error) throw error
      return data
    },
  })
}
