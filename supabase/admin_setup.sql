-- 1) Crie sua conta normalmente em Authentication > Users no Supabase.
-- 2) Troque o e-mail abaixo pelo e-mail da sua conta TAJO e rode este comando uma vez.
update public.profiles p
set platform_role = 'super_admin', updated_at = now()
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('SEU_EMAIL_ADMIN_AQUI');

-- Conferência:
select u.email, p.platform_role
from auth.users u join public.profiles p on p.id = u.id
where p.platform_role = 'super_admin';
