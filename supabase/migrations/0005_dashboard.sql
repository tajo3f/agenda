create or replace function public.get_dashboard_summary(p_org_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_org public.organizations%rowtype;
  v_today date;
  v_start timestamptz;
  v_end timestamptz;
  v_month_start timestamptz;
  v_month_end timestamptz;
  v_result jsonb;
begin
  if not (public.is_org_member(p_org_id) or public.is_super_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  select * into v_org from public.organizations where id = p_org_id;
  if not found then raise exception 'ORGANIZATION_NOT_FOUND'; end if;

  v_today := (now() at time zone v_org.timezone)::date;
  v_start := (v_today::timestamp at time zone v_org.timezone);
  v_end := ((v_today + 1)::timestamp at time zone v_org.timezone);
  v_month_start := (date_trunc('month', v_today::timestamp) at time zone v_org.timezone);
  v_month_end := ((date_trunc('month', v_today::timestamp) + interval '1 month') at time zone v_org.timezone);

  select jsonb_build_object(
    'today_count', (select count(*) from public.appointments a where a.organization_id=p_org_id and a.start_at>=v_start and a.start_at<v_end and a.status not in ('cancelled','no_show')),
    'confirmed_count', (select count(*) from public.appointments a where a.organization_id=p_org_id and a.start_at>=v_start and a.start_at<v_end and a.status='confirmed'),
    'scheduled_count', (select count(*) from public.appointments a where a.organization_id=p_org_id and a.start_at>=v_start and a.start_at<v_end and a.status='scheduled'),
    'revenue_cents', coalesce((select sum(a.price_cents) from public.appointments a where a.organization_id=p_org_id and a.start_at>=v_start and a.start_at<v_end and a.status in ('scheduled','confirmed','completed')),0),
    'month_customers', (select count(distinct a.customer_id) from public.appointments a where a.organization_id=p_org_id and a.start_at>=v_month_start and a.start_at<v_month_end and a.status not in ('cancelled','no_show')),
    'upcoming', coalesce((select jsonb_agg(x order by x.start_at) from (
      select a.id, a.start_at, a.status, a.price_cents, a.customer_name_snapshot,
             s.name as service_name, p.display_name as professional_name
      from public.appointments a
      join public.services s on s.id=a.service_id
      join public.professionals p on p.id=a.professional_id
      where a.organization_id=p_org_id and a.start_at>=now() and a.start_at<v_end and a.status in ('scheduled','confirmed')
      order by a.start_at limit 8
    ) x), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_dashboard_summary(uuid) to authenticated;

create or replace function public.get_admin_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_super_admin() then raise exception 'FORBIDDEN'; end if;
  return jsonb_build_object(
    'active_companies', (select count(*) from public.organizations where status='active'),
    'trial_companies', (select count(*) from public.organizations where status='trial'),
    'mrr_cents', coalesce((select sum(amount_cents) from public.subscriptions where status in ('active','trialing')),0),
    'appointments_month', (select count(*) from public.appointments where start_at >= date_trunc('month', now()) and status not in ('cancelled','no_show')),
    'past_due', (select count(*) from public.subscriptions where status='past_due')
  );
end;
$$;

grant execute on function public.get_admin_summary() to authenticated;
