# CLAUDE.md — Clean Dashboard (Scout Analytics Frontend)

---

## Data Source: Odoo → Supabase Mirror (Read-only)

**Architecture**: clean-dashboard is a **read-only consumer** of the Odoo→Supabase mirror.

**Data Flow**:
```
Odoo PG (prod) → supabase/etl → Supabase PG (mirror) → clean-dashboard (Vercel)
                                      │
                                      └─ odoo_mirror.* views
```

**Supabase Configuration**:
- Project: `spdtwktxdalcfigzeqrz` (shared with odoo-ce repo)
- Environment Variables:
  - `VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<public-anon-key-with-RLS>`
- Schema: `odoo_mirror.*` (replicated from Odoo via logical replication)

**Data Access Rules**:
1. Frontend must query **views only** (never base tables)
2. No direct writes from clean-dashboard to Odoo or Supabase
3. All writes go through back-end services / ETL (if ever added)
4. Use RLS-protected anon key for client-side access

**Available Views** (defined in `odoo-ce/db/migrations/odoo_mirror_schema.sql`):

| View | Purpose | Key Fields |
|------|---------|------------|
| `v_transaction_trends` | Transaction analytics over time | txn_date, brand_id, amount, category |
| `v_product_mix` | Product distribution and sales | product_id, category, sales_volume, revenue |
| `v_consumer_segments` | Customer segmentation and behavior | segment_id, customer_count, avg_spend, preferences |
| `v_georegional_intel` | Geographic sales intelligence | region, province, city, sales, market_share |
| `v_invoice_summary` | Invoice summary with partner details | invoice_number, date, amount, partner_name |
| `v_expense_summary` | Expense summary with employee details | description, amount, employee_name, state |
| `v_task_summary` | Project task summary | task_name, project_name, deadline, priority |
| `v_revenue_by_partner` | Revenue analysis by partner | partner_name, invoice_count, net_revenue |
| `v_expense_by_employee` | Expense analysis by employee | employee_name, expense_count, total_expenses |

**Frontend Data Service Pattern**:

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

// Transaction Trends Service
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

// Product Mix Service
export async function fetchProductMix(params: {
  categoryIds?: string[];
}) {
  const query = supabase
    .from('odoo_mirror.v_product_mix')
    .select('*');

  if (params.categoryIds?.length) {
    query.in('category_id', params.categoryIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Consumer Segments Service
export async function fetchConsumerSegments() {
  const { data, error } = await supabase
    .from('odoo_mirror.v_consumer_segments')
    .select('*')
    .order('avg_spend', { ascending: false });

  if (error) throw error;
  return data;
}

// Geographic Intelligence Service
export async function fetchGeoIntel(params: {
  regions?: string[];
}) {
  const query = supabase
    .from('odoo_mirror.v_georegional_intel')
    .select('*');

  if (params.regions?.length) {
    query.in('region', params.regions);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

**Replacing Mock Data**:

Before (mock data):
```typescript
// src/services/mockData.ts
export const transactionTrends = [
  { date: '2025-01', amount: 100000, ... },
  { date: '2025-02', amount: 120000, ... },
];
```

After (real Supabase data):
```typescript
// src/pages/TransactionTrends.tsx
import { fetchTransactionTrends } from '@/services/supabase';

const TransactionTrendsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['transaction-trends', { from, to, brandIds }],
    queryFn: () => fetchTransactionTrends({ from, to, brandIds }),
  });

  // Use real data from Supabase mirror
};
```

---

## Deployment Checklist

**Vercel Environment Variables**:
- [ ] `VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase>`
- [ ] `VITE_DATA_MODE=supabase` (ensure not using mock data)

**Supabase Configuration**:
- [ ] RLS policies allow `anon` role to SELECT from `odoo_mirror.v_*` views
- [ ] Views are populated with data (verify via `odoo-ce/scripts/verify-etl-replication.sql`)
- [ ] ETL pipeline is running (verify via `odoo-ce/scripts/verify-etl-health.sh`)

**Frontend Code**:
- [ ] Replace all mock data services with Supabase queries
- [ ] Update TypeScript types to match view schemas
- [ ] Test all dashboard pages with real data
- [ ] Handle loading states and errors gracefully
- [ ] Verify performance with production data volumes

---

## Security & Performance

**RLS Policies** (defined in `odoo-ce/db/migrations/odoo_mirror_schema.sql`):

```sql
-- Example RLS policy for anon access
ALTER TABLE odoo_mirror.v_transaction_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access" ON odoo_mirror.v_transaction_trends
FOR SELECT
TO anon
USING (true);  -- Adjust based on your security requirements
```

**Performance Optimization**:
- Use indexed columns in WHERE clauses
- Limit result sets with `.limit()` and pagination
- Cache frequently accessed data with React Query
- Use `.select()` to fetch only required fields
- Leverage Supabase connection pooling (port 6543)

**Query Examples**:

```typescript
// Good: Efficient query with limit and indexed columns
const { data } = await supabase
  .from('odoo_mirror.v_invoice_summary')
  .select('invoice_number, date, amount, partner_name')
  .gte('date', '2025-01-01')
  .order('date', { ascending: false })
  .limit(100);

// Bad: Full table scan without limit
const { data } = await supabase
  .from('odoo_mirror.v_invoice_summary')
  .select('*');
```

---

## Integration with odoo-ce Repository

**Shared Infrastructure**:
- Supabase project: `spdtwktxdalcfigzeqrz`
- Schema: `odoo_mirror.*` (managed in odoo-ce repo)
- ETL: `supabase/etl` (configured in odoo-ce repo)

**View Definitions**:
- Source: `odoo-ce/db/migrations/odoo_mirror_schema.sql`
- Any schema changes must be coordinated with odoo-ce repo
- Views are read-only from clean-dashboard perspective

**Verification**:
- Use `odoo-ce/scripts/verify-etl-replication.sql` to verify data availability
- Use `odoo-ce/scripts/verify-etl-health.sh` to check ETL pipeline health

---

## Development Workflow

**Local Development**:
```bash
# 1. Clone repo
git clone https://github.com/jgtolentino/clean-dashboard.git
cd clean-dashboard

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Set Supabase credentials
# Edit .env.local with real credentials

# 5. Start dev server
npm run dev
```

**Testing with Real Data**:
```bash
# 1. Verify Supabase mirror has data
cd ~/Documents/GitHub/odoo-ce
psql "$SUPABASE_URL" -f scripts/verify-etl-replication.sql

# 2. Test frontend queries
cd ~/Documents/GitHub/clean-dashboard
npm run dev
# Open http://localhost:5173
```

**Deployment**:
```bash
# 1. Commit changes
git add .
git commit -m "feat: integrate real Supabase data"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys on push
# 4. Verify environment variables in Vercel dashboard
```

---

## Troubleshooting

**No Data Showing**:
1. Verify Supabase credentials in Vercel environment variables
2. Check ETL pipeline health: `odoo-ce/scripts/verify-etl-health.sh`
3. Verify views are populated: `odoo-ce/scripts/verify-etl-replication.sql`
4. Check browser console for RLS policy errors

**RLS Policy Errors**:
```sql
-- Grant anon read access to all views
GRANT SELECT ON ALL TABLES IN SCHEMA odoo_mirror TO anon;
GRANT SELECT ON ALL VIEWS IN SCHEMA odoo_mirror TO anon;

-- Enable RLS and create policy
ALTER TABLE odoo_mirror.v_transaction_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read" ON odoo_mirror.v_transaction_trends
FOR SELECT TO anon USING (true);
```

**Performance Issues**:
1. Check query execution time in Supabase dashboard
2. Verify indexes exist on filtered columns
3. Use `.limit()` to reduce result set size
4. Implement pagination for large datasets

---

## References

- **odoo-ce Repository**: https://github.com/jgtolentino/odoo-ce
- **Odoo→Supabase Mirror Docs**: `odoo-ce/docs/ODOO_SUPABASE_MIRROR.md`
- **Mirror Schema**: `odoo-ce/db/migrations/odoo_mirror_schema.sql`
- **ETL Configuration**: `odoo-ce/etl/odoo_to_supabase/README.md`
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: 2026-01-14
**Maintained By**: InsightPulse AI Frontend Team
