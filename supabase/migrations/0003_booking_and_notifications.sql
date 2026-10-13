create or replace function public.get_public_booking_page(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'slug', o.slug,
      'segment', o.segment,
      'description', o.description,
      'city', o.city,
      'state', o.state,
      'timezone', o.timezone
    ),
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'price_cents', s.price_cents,
        'duration_minutes', s.duration_minutes
      ) order by s.name)
      from public.services s
      where s.organization_id = o.id and s.active = true
    ), '[]'::jsonb),
    'professionals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'bio', p.bio,
        'service_ids', coalesce((
          select jsonb_agg(ps.service_id)
          from public.professional_services ps
          where ps.professional_id = p.id and ps.active = true
        ), '[]'::jsonb)
      ) order by p.display_name)
      from public.professionals p
      where p.organization_id = o.id and p.active = true
    ), '[]'::jsonb)
  )
  from public.organizations o
  where o.slug = lower(p_slug)
    and o.status in ('trial','active');
$$;

grant execute on function public.get_public_booking_page(text) to anon, authenticated;

create or replace function public.get_available_slots(
  p_slug text,
  p_service_id uuid,
  p_professional_id uuid,
  p_date date
)
returns table(slot_time time, start_at timestamptz, end_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_org public.organizations%rowtype;
  v_service public.services%rowtype;
  v_weekday int;
begin
  select * into v_org from public.organizations
  where slug = lower(p_slug) and status in ('trial','active');
  if not found then return; end if;

  select * into v_service from public.services
  where id = p_service_id and organization_id = v_org.id and active = true;
  if not found then return; end if;

  if not exists (
    select 1 from public.professionals p
    join public.professional_services ps on ps.professional_id = p.id and ps.service_id = v_service.id and ps.active = true
    where p.id = p_professional_id and p.organization_id = v_org.id and p.active = true
  ) then return; end if;

  v_weekday := extract(dow from p_date)::int;

  return query
  with rules as (
    select ar.*,
      ((p_date::text || ' ' || ar.start_time::text)::timestamp at time zone v_org.timezone) as window_start,
      ((p_date::text || ' ' || ar.end_time::text)::timestamp at time zone v_org.timezone) as window_end
    from public.availability_rules ar
    where ar.organization_id = v_org.id
      and ar.professional_id = p_professional_id
      and ar.weekday = v_weekday
      and ar.active = true
  ), generated as (
    select gs as slot_start,
      gs + make_interval(mins => v_service.duration_minutes + v_service.buffer_after_minutes) as slot_end,
      r.window_end
    from rules r
    cross join lateral generate_series(
      r.window_start,
      r.window_end - make_interval(mins => v_service.duration_minutes + v_service.buffer_after_minutes),
      make_interval(mins => r.slot_interval_minutes)
    ) gs
  )
  select (g.slot_start at time zone v_org.timezone)::time,
         g.slot_start,
         g.slot_start + make_interval(mins => v_service.duration_minutes)
  from generated g
  where g.slot_start > now() + interval '5 minutes'
    and not exists (
      select 1 from public.blocked_periods b
      where b.organization_id = v_org.id
        and (b.professional_id is null or b.professional_id = p_professional_id)
        and tstzrange(b.start_at, b.end_at, '[)') && tstzrange(g.slot_start, g.slot_end, '[)')
    )
    and not exists (
      select 1 from public.appointments a
      where a.organization_id = v_org.id
        and a.professional_id = p_professional_id
        and a.status in ('scheduled','confirmed')
        and tstzrange(a.start_at, a.end_at, '[)') && tstzrange(g.slot_start, g.slot_end, '[)')
    )
  order by g.slot_start;
end;
$$;

grant execute on function public.get_available_slots(text,uuid,uuid,date) to anon, authenticated;

create or replace function public.create_public_appointment(
  p_slug text,
  p_service_id uuid,
  p_professional_id uuid,
  p_date date,
  p_time time,
  p_customer_name text,
  p_customer_phone text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org public.organizations%rowtype;
  v_service public.services%rowtype;
  v_customer_id uuid;
  v_phone text;
  v_start timestamptz;
  v_end timestamptz;
  v_id uuid;
begin
  if length(trim(coalesce(p_customer_name,''))) < 2 then raise exception 'INVALID_NAME'; end if;
  v_phone := regexp_replace(coalesce(p_customer_phone,''), '\D', '', 'g');
  if length(v_phone) < 10 then raise exception 'INVALID_PHONE'; end if;

  select * into v_org from public.organizations
  where slug = lower(p_slug) and status in ('trial','active');
  if not found then raise exception 'ORGANIZATION_NOT_AVAILABLE'; end if;

  if (
    select count(*)
    from public.appointments a
    join public.customers c on c.id = a.customer_id
    where a.organization_id = v_org.id
      and c.phone_normalized = v_phone
      and a.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'RATE_LIMITED';
  end if;

  select * into v_service from public.services
  where id = p_service_id and organization_id = v_org.id and active = true;
  if not found then raise exception 'SERVICE_NOT_AVAILABLE'; end if;

  if not exists (
    select 1 from public.professionals p
    join public.professional_services ps on ps.professional_id = p.id and ps.service_id = v_service.id and ps.active = true
    where p.id = p_professional_id and p.organization_id = v_org.id and p.active = true
  ) then raise exception 'PROFESSIONAL_NOT_AVAILABLE'; end if;

  v_start := ((p_date::text || ' ' || p_time::text)::timestamp at time zone v_org.timezone);
  v_end := v_start + make_interval(mins => v_service.duration_minutes + v_service.buffer_after_minutes);
  if v_start <= now() + interval '5 minutes' then raise exception 'PAST_OR_TOO_CLOSE'; end if;

  perform pg_advisory_xact_lock(hashtext(p_professional_id::text || p_date::text));

  if not exists (
    select 1 from public.get_available_slots(p_slug, p_service_id, p_professional_id, p_date) s
    where s.start_at = v_start
  ) then raise exception 'SLOT_NOT_AVAILABLE'; end if;

  insert into public.customers(organization_id, full_name, phone_display, phone_normalized)
  values(v_org.id, trim(p_customer_name), trim(p_customer_phone), v_phone)
  on conflict (organization_id, phone_normalized)
  do update set full_name = excluded.full_name, phone_display = excluded.phone_display, updated_at = now()
  returning id into v_customer_id;

  insert into public.appointments(
    organization_id, customer_id, professional_id, service_id, status,
    start_at, end_at, price_cents, customer_name_snapshot, customer_phone_snapshot,
    notes, source
  ) values (
    v_org.id, v_customer_id, p_professional_id, p_service_id, 'scheduled',
    v_start, v_end, v_service.price_cents, trim(p_customer_name), trim(p_customer_phone),
    nullif(trim(coalesce(p_notes,'')), ''), 'public'
  ) returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_public_appointment(text,uuid,uuid,date,time,text,text,text) to anon, authenticated;

create or replace function public.queue_appointment_notifications()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pref public.notification_preferences%rowtype;
  v_org_name text;
begin
  select * into v_pref from public.notification_preferences where organization_id = new.organization_id;
  select name into v_org_name from public.organizations where id = new.organization_id;

  if tg_op = 'INSERT' then
    if coalesce(v_pref.staff_new_appointment, true) then
      insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
      values(new.organization_id, new.id, 'staff', 'push', 'new_appointment', now(),
        jsonb_build_object('title','Novo agendamento','body',new.customer_name_snapshot || ' agendou um horário.','appointment_id',new.id),
        new.id::text || ':staff:new');
    end if;

    if coalesce(v_pref.customer_confirmation, true) then
      insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
      values(new.organization_id, new.id, 'customer', 'whatsapp', 'customer_confirmation', now(),
        jsonb_build_object('business_name',v_org_name,'customer_name',new.customer_name_snapshot,'appointment_id',new.id),
        new.id::text || ':customer:confirmation');
    end if;

    if coalesce(v_pref.customer_reminder_48h, true) and new.start_at - interval '48 hours' > now() then
      insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
      values(new.organization_id, new.id, 'customer', 'whatsapp', 'reminder_48h', new.start_at - interval '48 hours',
        jsonb_build_object('business_name',v_org_name,'appointment_id',new.id), new.id::text || ':customer:48h');
    end if;

    if coalesce(v_pref.customer_reminder_3h, true) and new.start_at - interval '3 hours' > now() then
      insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
      values(new.organization_id, new.id, 'customer', 'whatsapp', 'reminder_3h', new.start_at - interval '3 hours',
        jsonb_build_object('business_name',v_org_name,'appointment_id',new.id), new.id::text || ':customer:3h');
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status = 'cancelled' and old.status is distinct from new.status then
      update public.notification_jobs set status = 'skipped', processed_at = now()
      where appointment_id = new.id and status = 'pending';
      if coalesce(v_pref.staff_cancelled, true) then
        insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
        values(new.organization_id, new.id, 'staff', 'push', 'appointment_cancelled', now(),
          jsonb_build_object('title','Agendamento cancelado','body','Um horário ficou disponível.','appointment_id',new.id),
          new.id::text || ':staff:cancelled')
        on conflict (dedupe_key) do nothing;
      end if;
    elsif new.start_at is distinct from old.start_at then
      update public.notification_jobs set status = 'skipped', processed_at = now()
      where appointment_id = new.id and status = 'pending';
      if coalesce(v_pref.staff_rescheduled, true) then
        insert into public.notification_jobs(organization_id, appointment_id, recipient_type, channel, job_type, scheduled_for, payload, dedupe_key)
        values(new.organization_id, new.id, 'staff', 'push', 'appointment_rescheduled', now(),
          jsonb_build_object('title','Agendamento remarcado','body',new.customer_name_snapshot || ' alterou o horário.','appointment_id',new.id),
          new.id::text || ':staff:rescheduled:' || extract(epoch from new.start_at)::bigint);
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger appointments_queue_notifications_insert
after insert on public.appointments
for each row execute function public.queue_appointment_notifications();

create trigger appointments_queue_notifications_update
after update on public.appointments
for each row execute function public.queue_appointment_notifications();

create or replace function public.bootstrap_organization_defaults()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.notification_preferences(organization_id) values(new.id) on conflict do nothing;
  insert into public.subscriptions(organization_id, plan_key, amount_cents, status)
  values(new.id, new.plan_key, 0, case when new.status = 'trial' then 'trialing'::public.subscription_status else 'active'::public.subscription_status end)
  on conflict (organization_id) do nothing;
  return new;
end;
$$;

create trigger organizations_bootstrap_defaults
after insert on public.organizations
for each row execute function public.bootstrap_organization_defaults();
