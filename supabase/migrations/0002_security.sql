create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.platform_role = 'super_admin'
  );
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
      and m.active = true
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles public.member_role[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_super_admin() or exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
      and m.active = true
      and m.role = any(p_roles)
  );
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, public.member_role[]) from public;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.member_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.customers enable row level security;
alter table public.availability_rules enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.appointments enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

grant select on public.organizations to authenticated;
grant update (name, slug, segment, phone, email, description, address_line, city, state, timezone) on public.organizations to authenticated;

grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.professionals to authenticated;
grant select, insert, update, delete on public.professional_services to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.availability_rules to authenticated;
grant select, insert, update, delete on public.blocked_periods to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, update on public.notification_preferences to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select, update on public.notifications to authenticated;
grant select on public.notification_jobs to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.audit_logs to authenticated;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_super_admin());

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy organizations_select_member on public.organizations
for select to authenticated
using (public.is_org_member(id) or public.is_super_admin());

create policy organizations_update_manager on public.organizations
for update to authenticated
using (public.has_org_role(id, array['owner','manager']::public.member_role[]))
with check (public.has_org_role(id, array['owner','manager']::public.member_role[]));

create policy members_select_same_org on public.organization_members
for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());

create policy members_insert_owner on public.organization_members
for insert to authenticated
with check (public.has_org_role(organization_id, array['owner']::public.member_role[]));

create policy members_update_owner on public.organization_members
for update to authenticated
using (public.has_org_role(organization_id, array['owner']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner']::public.member_role[]));

create policy members_delete_owner on public.organization_members
for delete to authenticated
using (public.has_org_role(organization_id, array['owner']::public.member_role[]));

create policy services_select_member on public.services for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy services_insert_manager on public.services for insert to authenticated
with check (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));
create policy services_update_manager on public.services for update to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));
create policy services_delete_manager on public.services for delete to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy professionals_select_member on public.professionals for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy professionals_write_manager on public.professionals for all to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy professional_services_select_member on public.professional_services for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy professional_services_write_manager on public.professional_services for all to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy customers_select_member on public.customers for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy customers_insert_member on public.customers for insert to authenticated
with check (public.is_org_member(organization_id) or public.is_super_admin());
create policy customers_update_member on public.customers for update to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin())
with check (public.is_org_member(organization_id) or public.is_super_admin());
create policy customers_delete_manager on public.customers for delete to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy availability_select_member on public.availability_rules for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy availability_write_member on public.availability_rules for all to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin())
with check (public.is_org_member(organization_id) or public.is_super_admin());

create policy blocked_select_member on public.blocked_periods for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy blocked_write_member on public.blocked_periods for all to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin())
with check (public.is_org_member(organization_id) or public.is_super_admin());

create policy appointments_select_member on public.appointments for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy appointments_insert_member on public.appointments for insert to authenticated
with check (public.is_org_member(organization_id) or public.is_super_admin());
create policy appointments_update_member on public.appointments for update to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin())
with check (public.is_org_member(organization_id) or public.is_super_admin());
create policy appointments_delete_manager on public.appointments for delete to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy preferences_select_member on public.notification_preferences for select to authenticated
using (public.is_org_member(organization_id) or public.is_super_admin());
create policy preferences_update_manager on public.notification_preferences for update to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]))
with check (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy push_own on public.push_subscriptions for select to authenticated
using (user_id = auth.uid() or public.is_super_admin());
create policy push_insert_own on public.push_subscriptions for insert to authenticated
with check (user_id = auth.uid() and public.is_org_member(organization_id));
create policy push_update_own on public.push_subscriptions for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_delete_own on public.push_subscriptions for delete to authenticated
using (user_id = auth.uid());

create policy notifications_own on public.notifications for select to authenticated
using (user_id = auth.uid() or public.is_super_admin());
create policy notifications_update_own on public.notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy jobs_select_manager on public.notification_jobs for select to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy subscriptions_select_manager on public.subscriptions for select to authenticated
using (public.has_org_role(organization_id, array['owner','manager']::public.member_role[]));

create policy audit_select_manager on public.audit_logs for select to authenticated
using (public.is_super_admin() or (organization_id is not null and public.has_org_role(organization_id, array['owner','manager']::public.member_role[])));
