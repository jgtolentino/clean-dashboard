-- 002_ces_schema.sql
-- CES (Campaign Effectiveness Score) schema for Scout Dashboard
-- Replaces static CSV data with Supabase-powered views

-- 1) Schema
create schema if not exists ces;

-- 2) Base table – "full_flat" equivalent
-- This is the wide denormalized campaign dataset imported from the CES CSV
create table if not exists ces.full_flat (
  id                bigserial primary key,

  -- identifiers
  campaign_id       text    not null,
  campaign_name     text    not null,
  client_name       text    not null,
  brand_name        text    not null,
  product_category  text    not null,

  -- geography / market
  country           text    default 'Philippines',
  region            text,
  market_segment    text,

  -- channels
  channel           text,        -- e.g. TV, Digital, OOH
  subchannel        text,        -- e.g. FB, YT, TikTok
  placement         text,

  -- timing
  flight_start_date date,
  flight_end_date   date,
  reporting_date    date not null,

  -- media metrics
  impressions       numeric,
  reach             numeric,
  frequency         numeric,
  views             numeric,
  clicks            numeric,
  conversions       numeric,
  revenue           numeric,
  media_spend       numeric,

  -- derived KPIs (optional – can also be computed in views)
  ctr               numeric,  -- clicks / impressions
  cvr               numeric,  -- conversions / clicks
  cpm               numeric,  -- media_spend / impressions * 1000
  cpc               numeric,  -- media_spend / clicks
  cpa               numeric,  -- media_spend / conversions
  roi               numeric,  -- revenue / media_spend

  -- CES / effectiveness scores
  ces_score         numeric,
  ces_quality       numeric,
  ces_impact        numeric,
  ces_potential     numeric,

  -- creative metadata
  creative_id       text,
  creative_name     text,
  asset_url         text,
  audience_segment  text,
  device_type       text,

  -- provenance
  source_file       text default 'full_flat.csv',
  created_at        timestamptz not null default now()
);

comment on table ces.full_flat is 'Wide "full_flat" campaign dataset imported from the CES CSV used by the Vite dashboard.';

-- Create index for common query patterns
create index if not exists idx_full_flat_campaign_id on ces.full_flat(campaign_id);
create index if not exists idx_full_flat_brand_name on ces.full_flat(brand_name);
create index if not exists idx_full_flat_region on ces.full_flat(region);
create index if not exists idx_full_flat_channel on ces.full_flat(channel);
create index if not exists idx_full_flat_reporting_date on ces.full_flat(reporting_date);

-- 3) View – campaign-level summary for charts
create or replace view ces.v_campaign_performance as
select
  campaign_id,
  campaign_name,
  client_name,
  brand_name,
  product_category,
  region,
  channel,
  subchannel,
  min(flight_start_date) as flight_start_date,
  max(flight_end_date)   as flight_end_date,

  sum(impressions)  as impressions,
  sum(reach)        as reach,
  avg(frequency)    as frequency,
  sum(views)        as views,
  sum(clicks)       as clicks,
  sum(conversions)  as conversions,
  sum(revenue)      as revenue,
  sum(media_spend)  as media_spend,

  -- safe derived metrics
  case when sum(impressions) > 0 then sum(clicks) / sum(impressions) else null end as ctr,
  case when sum(clicks)      > 0 then sum(conversions) / sum(clicks) else null end as cvr,
  case when sum(impressions) > 0 then (sum(media_spend) / sum(impressions)) * 1000 else null end as cpm,
  case when sum(clicks)      > 0 then sum(media_spend) / sum(clicks) else null end as cpc,
  case when sum(conversions) > 0 then sum(media_spend) / sum(conversions) else null end as cpa,
  case when sum(media_spend) > 0 then sum(revenue) / sum(media_spend) else null end as roi,

  avg(ces_score)     as ces_score,
  avg(ces_quality)   as ces_quality,
  avg(ces_impact)    as ces_impact,
  avg(ces_potential) as ces_potential
from ces.full_flat
group by
  campaign_id,
  campaign_name,
  client_name,
  brand_name,
  product_category,
  region,
  channel,
  subchannel;

comment on view ces.v_campaign_performance is 'Aggregated per-campaign metrics used by the CES quadrant / KPI charts.';

-- 4) RLS configuration
alter table ces.full_flat enable row level security;

-- Allow authenticated users to read campaign data
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'ces'
      and tablename  = 'full_flat'
      and policyname = 'ces_full_flat_select_all_auth'
  ) then
    create policy ces_full_flat_select_all_auth
      on ces.full_flat
      for select
      using (auth.role() = 'authenticated');
  end if;
end$$;

-- Also allow anon access for public dashboards (optional, remove if not needed)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'ces'
      and tablename  = 'full_flat'
      and policyname = 'ces_full_flat_select_anon'
  ) then
    create policy ces_full_flat_select_anon
      on ces.full_flat
      for select
      using (auth.role() = 'anon');
  end if;
end$$;

-- 5) Privileges
grant usage on schema ces to authenticated, anon;
grant select on all tables in schema ces to authenticated, anon;

-- Ensure future tables/views also grant select
alter default privileges in schema ces
  grant select on tables to authenticated, anon;
alter default privileges in schema ces
  grant select on sequences to authenticated, anon;

-- 6) Expose views to PostgREST (Supabase API)
-- Views in custom schemas need to be explicitly exposed
-- This makes ces.v_campaign_performance accessible as /rest/v1/v_campaign_performance
-- Note: You may need to update your Supabase project settings to expose the 'ces' schema

-- Alternative: Create a public view that references the ces view
create or replace view public.v_campaign_performance as
select * from ces.v_campaign_performance;

create or replace view public.full_flat as
select * from ces.full_flat;

grant select on public.v_campaign_performance to authenticated, anon;
grant select on public.full_flat to authenticated, anon;
