create extension if not exists "pgcrypto";

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  trade_date date not null,
  pair text not null check (pair in ('EUR/USD', 'Gold (XAU/USD)', 'Other')),
  custom_pair text,
  direction text not null check (direction in ('Buy', 'Sell')),
  result text check (result in ('Win', 'Loss', 'Breakeven') or result is null),
  profit_loss numeric,
  rr_achieved numeric,

  bias_bullish_identified boolean not null default false,
  bias_bearish_identified boolean not null default false,
  premium_zone_marked boolean not null default false,
  discount_zone_marked boolean not null default false,
  major_liquidity_target_identified boolean not null default false,

  equal_highs_identified boolean not null default false,
  equal_lows_identified boolean not null default false,
  previous_day_high_identified boolean not null default false,
  previous_day_low_identified boolean not null default false,
  session_liquidity_identified boolean not null default false,
  liquidity_swept boolean not null default false,
  liquidity_likely_to_be_swept boolean not null default false,

  session_london boolean not null default false,
  session_new_york boolean not null default false,
  session_asian boolean not null default false,
  avoiding_low_liquidity_session boolean not null default false,

  mss_occurred boolean not null default false,
  bos_occurred boolean not null default false,
  displacement_candle_present boolean not null default false,

  entry_fvg boolean not null default false,
  entry_order_block boolean not null default false,
  entry_breaker_block boolean not null default false,
  entry_mitigation_block boolean not null default false,
  entry_not_chasing_price boolean not null default false,

  stop_loss_placed_correctly boolean not null default false,
  risk_fixed_0_5_percent boolean not null default false,
  risk_fixed_1_percent boolean not null default false,
  minimum_rr_1_2 boolean not null default false,
  rr_1_3_plus boolean not null default false,
  rr_1_4_plus boolean not null default false,

  no_major_high_impact_news boolean not null default false,
  aware_of_usd_news boolean not null default false,
  news_checked_before_entry boolean not null default false,

  not_revenge_trading boolean not null default false,
  not_recovering_losses boolean not null default false,
  following_trading_plan boolean not null default false,
  emotion_controlled boolean not null default false,
  patient_entry boolean not null default false,

  entry_thoughts text,
  exit_thoughts text,
  daily_reflection text not null default '',
  before_trade_screenshot_url text,
  after_trade_screenshot_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trade_screenshots (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  screenshot_type text not null check (screenshot_type in ('before', 'after')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trade_id, screenshot_type)
);

create index if not exists trades_trade_date_idx on public.trades(trade_date desc);
create index if not exists trades_pair_idx on public.trades(pair);
create index if not exists trades_result_idx on public.trades(result);
create index if not exists trade_screenshots_trade_id_idx on public.trade_screenshots(trade_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trades_set_updated_at on public.trades;
create trigger trades_set_updated_at
before update on public.trades
for each row execute function public.set_updated_at();

drop trigger if exists trade_screenshots_set_updated_at on public.trade_screenshots;
create trigger trade_screenshots_set_updated_at
before update on public.trade_screenshots
for each row execute function public.set_updated_at();

alter table public.trades enable row level security;
alter table public.trade_screenshots enable row level security;

-- Personal-use permissive policies for anon-key prototypes.
-- For authenticated multi-user use, replace these with auth.uid()-scoped policies.
drop policy if exists "Allow read trades" on public.trades;
create policy "Allow read trades" on public.trades for select using (true);

drop policy if exists "Allow write trades" on public.trades;
create policy "Allow write trades" on public.trades for all using (true) with check (true);

drop policy if exists "Allow read screenshots" on public.trade_screenshots;
create policy "Allow read screenshots" on public.trade_screenshots for select using (true);

drop policy if exists "Allow write screenshots" on public.trade_screenshots;
create policy "Allow write screenshots" on public.trade_screenshots for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow screenshot reads" on storage.objects;
create policy "Allow screenshot reads"
on storage.objects for select
using (bucket_id = 'trade-screenshots');

drop policy if exists "Allow screenshot uploads" on storage.objects;
create policy "Allow screenshot uploads"
on storage.objects for insert
with check (
  bucket_id = 'trade-screenshots'
  and (
    lower(right(name, 4)) in ('.png', '.jpg', 'webp')
    or lower(right(name, 5)) = '.jpeg'
  )
);

drop policy if exists "Allow screenshot updates" on storage.objects;
create policy "Allow screenshot updates"
on storage.objects for update
using (bucket_id = 'trade-screenshots')
with check (bucket_id = 'trade-screenshots');

drop policy if exists "Allow screenshot deletes" on storage.objects;
create policy "Allow screenshot deletes"
on storage.objects for delete
using (bucket_id = 'trade-screenshots');
