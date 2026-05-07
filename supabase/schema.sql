create extension if not exists pgcrypto;

create table if not exists public."UserProfile" (
  "id" text primary key,
  "email" text,
  "displayName" text,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create table if not exists public."AssetCategory" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null,
  "name" text not null,
  "color" text,
  "description" text,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create table if not exists public."Asset" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null,
  "name" text not null,
  "symbol" text,
  "categoryId" text not null,
  "strategyRole" text not null default 'CORE',
  "estimatedValue" decimal(65, 30),
  "targetWeight" decimal(65, 30),
  "note" text,
  "isArchived" boolean not null default false,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create table if not exists public."Investment" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null,
  "assetId" text not null,
  "type" text not null,
  "tradeDate" timestamp(3) not null,
  "amount" decimal(65, 30) not null,
  "quantity" decimal(65, 30),
  "price" decimal(65, 30),
  "fee" decimal(65, 30),
  "note" text,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create table if not exists public."PortfolioSnapshot" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null,
  "snapshotDate" timestamp(3) not null,
  "totalValue" decimal(65, 30) not null,
  "principal" decimal(65, 30) not null,
  "profit" decimal(65, 30) not null,
  "roi" decimal(65, 30) not null,
  "note" text,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create table if not exists public."InvestmentGoal" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null,
  "name" text not null,
  "startDate" timestamp(3) not null,
  "targetDate" timestamp(3) not null,
  "targetAmount" decimal(65, 30) not null,
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

alter table public."UserProfile" alter column "updatedAt" set default current_timestamp;
alter table public."AssetCategory" alter column "id" set default gen_random_uuid()::text;
alter table public."AssetCategory" alter column "updatedAt" set default current_timestamp;
alter table public."Asset" alter column "id" set default gen_random_uuid()::text;
alter table public."Asset" alter column "updatedAt" set default current_timestamp;
alter table public."Investment" alter column "id" set default gen_random_uuid()::text;
alter table public."Investment" alter column "updatedAt" set default current_timestamp;
alter table public."PortfolioSnapshot" alter column "id" set default gen_random_uuid()::text;
alter table public."PortfolioSnapshot" alter column "updatedAt" set default current_timestamp;
alter table public."InvestmentGoal" alter column "id" set default gen_random_uuid()::text;
alter table public."InvestmentGoal" alter column "updatedAt" set default current_timestamp;

create unique index if not exists "AssetCategory_id_userId_key" on public."AssetCategory" ("id", "userId");
create unique index if not exists "AssetCategory_userId_name_key" on public."AssetCategory" ("userId", "name");
create index if not exists "AssetCategory_userId_idx" on public."AssetCategory" ("userId");

create unique index if not exists "Asset_id_userId_key" on public."Asset" ("id", "userId");
create index if not exists "Asset_userId_idx" on public."Asset" ("userId");
create index if not exists "Asset_userId_categoryId_idx" on public."Asset" ("userId", "categoryId");
create index if not exists "Asset_userId_strategyRole_idx" on public."Asset" ("userId", "strategyRole");

create unique index if not exists "Investment_id_userId_key" on public."Investment" ("id", "userId");
create index if not exists "Investment_userId_idx" on public."Investment" ("userId");
create index if not exists "Investment_userId_assetId_idx" on public."Investment" ("userId", "assetId");
create index if not exists "Investment_userId_tradeDate_idx" on public."Investment" ("userId", "tradeDate");
create index if not exists "Investment_userId_type_idx" on public."Investment" ("userId", "type");

create unique index if not exists "PortfolioSnapshot_id_userId_key" on public."PortfolioSnapshot" ("id", "userId");
create unique index if not exists "PortfolioSnapshot_userId_snapshotDate_key" on public."PortfolioSnapshot" ("userId", "snapshotDate");
create index if not exists "PortfolioSnapshot_userId_snapshotDate_idx" on public."PortfolioSnapshot" ("userId", "snapshotDate");

create unique index if not exists "InvestmentGoal_id_userId_key" on public."InvestmentGoal" ("id", "userId");
create index if not exists "InvestmentGoal_userId_targetDate_idx" on public."InvestmentGoal" ("userId", "targetDate");

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'Asset_categoryId_userId_fkey') then
    alter table public."Asset"
      add constraint "Asset_categoryId_userId_fkey"
      foreign key ("categoryId", "userId")
      references public."AssetCategory" ("id", "userId")
      on delete restrict
      on update cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'Investment_assetId_userId_fkey') then
    alter table public."Investment"
      add constraint "Investment_assetId_userId_fkey"
      foreign key ("assetId", "userId")
      references public."Asset" ("id", "userId")
      on delete restrict
      on update cascade;
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = current_timestamp;
  return new;
end;
$$;

drop trigger if exists "UserProfile_set_updated_at" on public."UserProfile";
create trigger "UserProfile_set_updated_at"
before update on public."UserProfile"
for each row execute function public.set_updated_at();

drop trigger if exists "AssetCategory_set_updated_at" on public."AssetCategory";
create trigger "AssetCategory_set_updated_at"
before update on public."AssetCategory"
for each row execute function public.set_updated_at();

drop trigger if exists "Asset_set_updated_at" on public."Asset";
create trigger "Asset_set_updated_at"
before update on public."Asset"
for each row execute function public.set_updated_at();

drop trigger if exists "Investment_set_updated_at" on public."Investment";
create trigger "Investment_set_updated_at"
before update on public."Investment"
for each row execute function public.set_updated_at();

drop trigger if exists "PortfolioSnapshot_set_updated_at" on public."PortfolioSnapshot";
create trigger "PortfolioSnapshot_set_updated_at"
before update on public."PortfolioSnapshot"
for each row execute function public.set_updated_at();

drop trigger if exists "InvestmentGoal_set_updated_at" on public."InvestmentGoal";
create trigger "InvestmentGoal_set_updated_at"
before update on public."InvestmentGoal"
for each row execute function public.set_updated_at();

alter table public."UserProfile" enable row level security;
alter table public."AssetCategory" enable row level security;
alter table public."Asset" enable row level security;
alter table public."Investment" enable row level security;
alter table public."PortfolioSnapshot" enable row level security;
alter table public."InvestmentGoal" enable row level security;

drop policy if exists "Users manage own profile" on public."UserProfile";
create policy "Users manage own profile"
on public."UserProfile"
for all
to authenticated
using ("id" = auth.uid()::text)
with check ("id" = auth.uid()::text);

drop policy if exists "Users manage own categories" on public."AssetCategory";
create policy "Users manage own categories"
on public."AssetCategory"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "Users manage own assets" on public."Asset";
create policy "Users manage own assets"
on public."Asset"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "Users manage own investments" on public."Investment";
create policy "Users manage own investments"
on public."Investment"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "Users manage own snapshots" on public."PortfolioSnapshot";
create policy "Users manage own snapshots"
on public."PortfolioSnapshot"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "Users manage own goals" on public."InvestmentGoal";
create policy "Users manage own goals"
on public."InvestmentGoal"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public."UserProfile" to authenticated;
grant select, insert, update, delete on public."AssetCategory" to authenticated;
grant select, insert, update, delete on public."Asset" to authenticated;
grant select, insert, update, delete on public."Investment" to authenticated;
grant select, insert, update, delete on public."PortfolioSnapshot" to authenticated;
grant select, insert, update, delete on public."InvestmentGoal" to authenticated;
