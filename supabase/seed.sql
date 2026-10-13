-- Demonstração pública. Rode somente se quiser manter /agendar/barbearia-central como exemplo real.
with org as (
  insert into public.organizations(name,slug,segment,phone,description,city,state,status,plan_key)
  values('Barbearia Central','barbearia-central','Barbearia','(27) 99999-9999','Cortes, barba e cuidados masculinos com atendimento profissional.','Afonso Cláudio','ES','active','PRO')
  on conflict (slug) do update set name = excluded.name
  returning id
), svc as (
  insert into public.services(organization_id,name,price_cents,duration_minutes)
  select org.id, x.name, x.price, x.duration from org cross join (values
    ('Corte tradicional',3500,30),('Corte + barba',5500,50),('Barba',2500,20),('Design de sobrancelhas',4500,25)
  ) as x(name,price,duration)
  returning id, organization_id
), prof as (
  insert into public.professionals(organization_id,display_name)
  select id,'João Ferreira' from org returning id, organization_id
)
insert into public.professional_services(organization_id,professional_id,service_id)
select prof.organization_id, prof.id, svc.id from prof cross join svc
on conflict do nothing;

insert into public.availability_rules(organization_id,professional_id,weekday,start_time,end_time,slot_interval_minutes)
select p.organization_id,p.id,d,'08:00','12:00',30 from public.professionals p cross join generate_series(1,6) d where p.display_name='João Ferreira'
union all
select p.organization_id,p.id,d,'13:00','18:00',30 from public.professionals p cross join generate_series(1,5) d where p.display_name='João Ferreira';
