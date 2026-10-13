create extension if not exists btree_gist;

alter table public.appointments
add constraint appointments_no_overlap
exclude using gist (
  professional_id with =,
  tstzrange(start_at, end_at, '[)') with &&
)
where (status in ('scheduled','confirmed'));

create or replace function public.validate_professional_service_org()
returns trigger
language plpgsql
as $$
declare
  v_prof_org uuid;
  v_service_org uuid;
begin
  select organization_id into v_prof_org from public.professionals where id = new.professional_id;
  select organization_id into v_service_org from public.services where id = new.service_id;
  if v_prof_org is null or v_service_org is null or new.organization_id <> v_prof_org or new.organization_id <> v_service_org then
    raise exception 'CROSS_TENANT_REFERENCE';
  end if;
  return new;
end;
$$;

create trigger professional_services_org_guard
before insert or update on public.professional_services
for each row execute function public.validate_professional_service_org();

create or replace function public.validate_appointment_org()
returns trigger
language plpgsql
as $$
declare
  v_customer_org uuid;
  v_prof_org uuid;
  v_service_org uuid;
begin
  select organization_id into v_customer_org from public.customers where id = new.customer_id;
  select organization_id into v_prof_org from public.professionals where id = new.professional_id;
  select organization_id into v_service_org from public.services where id = new.service_id;

  if new.organization_id <> v_customer_org or new.organization_id <> v_prof_org or new.organization_id <> v_service_org then
    raise exception 'CROSS_TENANT_REFERENCE';
  end if;

  if not exists (
    select 1 from public.professional_services ps
    where ps.organization_id = new.organization_id
      and ps.professional_id = new.professional_id
      and ps.service_id = new.service_id
      and ps.active = true
  ) then
    raise exception 'SERVICE_NOT_ASSIGNED_TO_PROFESSIONAL';
  end if;

  return new;
end;
$$;

create trigger appointments_org_guard
before insert or update of organization_id, customer_id, professional_id, service_id on public.appointments
for each row execute function public.validate_appointment_org();

create or replace function public.validate_availability_org()
returns trigger
language plpgsql
as $$
declare v_prof_org uuid;
begin
  select organization_id into v_prof_org from public.professionals where id = new.professional_id;
  if new.organization_id <> v_prof_org then raise exception 'CROSS_TENANT_REFERENCE'; end if;
  return new;
end;
$$;

create trigger availability_org_guard
before insert or update on public.availability_rules
for each row execute function public.validate_availability_org();
