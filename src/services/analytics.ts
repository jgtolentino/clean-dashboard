// src/services/analytics.ts
// Analytics services for querying Odoo→Supabase mirror views
// All functions query odoo_mirror.v_* views (read-only)

import { supabase } from '@/lib/supabase';

/**
 * Fetch transaction trends over time
 * @param params - Date range and optional brand filters
 * @returns Transaction analytics data
 */
export async function fetchTransactionTrends(params: {
  from: string;
  to: string;
  brandIds?: string[];
}) {
  const query = supabase
    .from('odoo_mirror.v_transaction_trends')
    .select('*')
    .gte('txn_date', params.from)
    .lte('txn_date', params.to);

  if (params.brandIds?.length) {
    query.in('brand_id', params.brandIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch product mix analysis
 * @param params - Optional category filters
 * @returns Product distribution and sales data
 */
export async function fetchProductMix(params?: {
  categoryIds?: string[];
}) {
  const query = supabase
    .from('odoo_mirror.v_product_mix')
    .select('*');

  if (params?.categoryIds?.length) {
    query.in('category_id', params.categoryIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch consumer segments analysis
 * @returns Customer segmentation and behavior data
 */
export async function fetchConsumerSegments() {
  const { data, error } = await supabase
    .from('odoo_mirror.v_consumer_segments')
    .select('*')
    .order('avg_spend', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch geographic intelligence
 * @param params - Optional region filters
 * @returns Geographic sales intelligence data
 */
export async function fetchGeoRegionalIntel(params?: {
  regions?: string[];
}) {
  const query = supabase
    .from('odoo_mirror.v_georegional_intel')
    .select('*');

  if (params?.regions?.length) {
    query.in('region', params.regions);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch invoice summary with partner details
 * @param params - Optional filters for date range and partner
 * @returns Invoice summary data
 */
export async function fetchInvoiceSummary(params?: {
  from?: string;
  to?: string;
  partnerId?: number;
}) {
  const query = supabase
    .from('odoo_mirror.v_invoice_summary')
    .select('*');

  if (params?.from) {
    query.gte('date', params.from);
  }
  if (params?.to) {
    query.lte('date', params.to);
  }
  if (params?.partnerId) {
    query.eq('partner_id', params.partnerId);
  }

  const { data, error } = await query.order('date', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Fetch expense summary with employee details
 * @param params - Optional filters for date range and employee
 * @returns Expense summary data
 */
export async function fetchExpenseSummary(params?: {
  from?: string;
  to?: string;
  employeeId?: number;
}) {
  const query = supabase
    .from('odoo_mirror.v_expense_summary')
    .select('*');

  if (params?.from) {
    query.gte('date', params.from);
  }
  if (params?.to) {
    query.lte('date', params.to);
  }
  if (params?.employeeId) {
    query.eq('employee_id', params.employeeId);
  }

  const { data, error } = await query.order('date', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Fetch task summary with project details
 * @param params - Optional filters for project and priority
 * @returns Task summary data
 */
export async function fetchTaskSummary(params?: {
  projectId?: number;
  priority?: string;
}) {
  const query = supabase
    .from('odoo_mirror.v_task_summary')
    .select('*');

  if (params?.projectId) {
    query.eq('project_id', params.projectId);
  }
  if (params?.priority) {
    query.eq('priority', params.priority);
  }

  const { data, error } = await query.order('deadline', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Fetch revenue analysis by partner
 * @param params - Optional limit for top N partners
 * @returns Revenue by partner data
 */
export async function fetchRevenueByPartner(params?: {
  limit?: number;
}) {
  const query = supabase
    .from('odoo_mirror.v_revenue_by_partner')
    .select('*')
    .order('net_revenue', { ascending: false });

  if (params?.limit) {
    query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Fetch expense analysis by employee
 * @param params - Optional limit for top N employees
 * @returns Expense by employee data
 */
export async function fetchExpenseByEmployee(params?: {
  limit?: number;
}) {
  const query = supabase
    .from('odoo_mirror.v_expense_by_employee')
    .select('*')
    .order('total_expenses', { ascending: false });

  if (params?.limit) {
    query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
