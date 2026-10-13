create extension if not exists pgcrypto;

create type public.platform_role as enum ('user','super_admin');
create type public.member_role as enum ('owner','manager','staff');
create type public.organization_status as enum ('trial','active','suspended','cancelled');
create type public.appointment_status as enum ('scheduled','confirmed','completed','cancelled','no_show');
create type public.subscription_status as enum ('trialing','active','past_due','cancelled');
create type public.notification_job_status as enum ('pending','processing','sent','failed','skipped');
create type public.notification_channel as enum ('in_app','push','email','whatsapp');
create type public.notification_recipient as enum ('staff','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  platform_role public.platform_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  segment text,
  phone text,
  email text,
  description text,
  address_line text,
  city text,
  state text,
  timezone text not null default 'America/Sao_Paulo',
  status public.organization_status not null default 'trial',
  plan_key text not null default 'START',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'staff',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  duration_minutes integer not null check (duration_minutes between 5 and 1440),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes between 0 and 240),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  phone text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.professional_services (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  active boolean not null default true,
  primary key (professional_id, service_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone_display text not null,
  phone_normalized text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, phone_normalized)
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_interval_minutes integer not null default 30 check (slot_interval_minutes between 5 and 240),
  active boolean not null default true,
  check (end_time > start_time)
);

create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  status public.appointment_status not null default 'scheduled',
  start_at timestamptz not null,
  end_at timestamptz not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  customer_name_snapshot text not null,
  customer_phone_snapshot text not null,
  notes text,
  source text not null default 'dashboard' check (source in ('dashboard','public','import')),
  created_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create table public.notification_preferences (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  staff_new_appointment boolean not null default true,
  staff_cancelled boolean not null default true,
  staff_rescheduled boolean not null default true,
  staff_daily_summary boolean not null default true,
  staff_next_appointment boolean not null default false,
  customer_confirmation boolean not null default true,
  customer_reminder_48h boolean not null default true,
  customer_reminder_3h boolean not null default true,
  customer_request_confirmation boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'webpush',
  endpoint text,
  p256dh text,
  auth_key text,
  fcm_token text,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint),
  unique (fcm_token)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'general',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  recipient_type public.notification_recipient not null,
  channel public.notification_channel not null,
  job_type text not null,
  scheduled_for timestamptz not null,
  status public.notification_job_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  last_error text,
  dedupe_key text not null unique,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  plan_key text not null,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  status public.subscription_status not null default 'trialing',
  provider text,
  external_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organization_members_user_idx on public.organization_members(user_id) where active = true;
create index services_org_idx on public.services(organization_id) where active = true;
create index professionals_org_idx on public.professionals(organization_id) where active = true;
create index customers_org_idx on public.customers(organization_id);
create index appointments_org_start_idx on public.appointments(organization_id, start_at);
create index appointments_professional_start_idx on public.appointments(professional_id, start_at);
create index availability_professional_weekday_idx on public.availability_rules(professional_id, weekday) where active = true;
create index blocked_periods_professional_idx on public.blocked_periods(professional_id, start_at, end_at);
create index notification_jobs_due_idx on public.notification_jobs(status, scheduled_for) where status = 'pending';
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger services_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger professionals_updated_at before update on public.professionals for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();
create trigger notification_preferences_updated_at before update on public.notification_preferences for each row execute function public.set_updated_at();
create trigger push_subscriptions_updated_at before update on public.push_subscriptions for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email,''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
