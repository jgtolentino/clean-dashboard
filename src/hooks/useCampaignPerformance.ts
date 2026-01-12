/**
 * React Query hooks for campaign performance data
 * Replaces direct CSV imports with Supabase API calls
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type CampaignPerformance = {
  campaign_id: string
  campaign_name: string
  client_name: string
  brand_name: string
  product_category: string
  region: string | null
  channel: string | null
  subchannel: string | null
  flight_start_date: string | null
  flight_end_date: string | null

  impressions: number | null
  reach: number | null
  frequency: number | null
  views: number | null
  clicks: number | null
  conversions: number | null
  revenue: number | null
  media_spend: number | null

  ctr: number | null
  cvr: number | null
  cpm: number | null
  cpc: number | null
  cpa: number | null
  roi: number | null

  ces_score: number | null
  ces_quality: number | null
  ces_impact: number | null
  ces_potential: number | null
}

export type CampaignFilters = {
  brandName?: string
  region?: string
  channel?: string
  clientName?: string
  productCategory?: string
}

/**
 * Fetch campaign performance data from Supabase
 * Uses the v_campaign_performance view for aggregated metrics
 */
export function useCampaignPerformance(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaignPerformance', filters],
    queryFn: async (): Promise<CampaignPerformance[]> => {
      let query = supabase.from('v_campaign_performance').select('*')

      if (filters?.brandName) {
        query = query.eq('brand_name', filters.brandName)
      }
      if (filters?.region) {
        query = query.eq('region', filters.region)
      }
      if (filters?.channel) {
        query = query.eq('channel', filters.channel)
      }
      if (filters?.clientName) {
        query = query.eq('client_name', filters.clientName)
      }
      if (filters?.productCategory) {
        query = query.eq('product_category', filters.productCategory)
      }

      const { data, error } = await query

      if (error) {
        console.error('[useCampaignPerformance] Supabase error:', error)
        throw error
      }

      return data as CampaignPerformance[]
    },
    // Only run if we have a valid Supabase connection
    enabled: true,
  })
}

/**
 * Fetch a single campaign's detailed performance
 */
export function useCampaignDetail(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaignDetail', campaignId],
    enabled: !!campaignId,
    queryFn: async (): Promise<CampaignPerformance | null> => {
      if (!campaignId) return null

      const { data, error } = await supabase
        .from('v_campaign_performance')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle()

      if (error) {
        console.error('[useCampaignDetail] Supabase error:', error)
        throw error
      }

      return data as CampaignPerformance | null
    },
  })
}

/**
 * Fetch full_flat transaction data for detailed analysis
 * Supports pagination for large datasets
 */
export function useFullFlatData(options?: {
  limit?: number
  offset?: number
  filters?: CampaignFilters
}) {
  const { limit = 1000, offset = 0, filters } = options || {}

  return useQuery({
    queryKey: ['fullFlatData', limit, offset, filters],
    queryFn: async () => {
      let query = supabase
        .from('full_flat')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)

      if (filters?.brandName) {
        query = query.eq('brand_name', filters.brandName)
      }
      if (filters?.region) {
        query = query.eq('region', filters.region)
      }
      if (filters?.channel) {
        query = query.eq('channel', filters.channel)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('[useFullFlatData] Supabase error:', error)
        throw error
      }

      return {
        data: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
      }
    },
  })
}

/**
 * Fetch CES (Campaign Effectiveness Score) metrics
 */
export function useCESMetrics(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['cesMetrics', filters],
    queryFn: async () => {
      let query = supabase.from('v_campaign_performance').select(`
        campaign_id,
        campaign_name,
        brand_name,
        ces_score,
        ces_quality,
        ces_impact,
        ces_potential,
        roi
      `)

      if (filters?.brandName) {
        query = query.eq('brand_name', filters.brandName)
      }
      if (filters?.region) {
        query = query.eq('region', filters.region)
      }

      const { data, error } = await query

      if (error) {
        console.error('[useCESMetrics] Supabase error:', error)
        throw error
      }

      return data || []
    },
  })
}
