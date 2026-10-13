# TAJO Agenda V2 — Configuração Supabase

## 1. Criar o projeto
Crie um projeto no Supabase e guarde:
- Project URL
- Publishable key
- Service role key / secret key

Nunca coloque a service role no navegador, em `NEXT_PUBLIC_*` ou no GitHub.

## 2. Variáveis locais
Copie `.env.example` para `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
TAJO_CRON_SECRET=gere-um-segredo-longo
```

Na Vercel, use `NEXT_PUBLIC_APP_URL=https://agenda.tajodigital.com.br`.

## 3. Banco
No SQL Editor, execute na ordem:
1. `supabase/migrations/0001_core.sql`
2. `supabase/migrations/0002_security.sql`
3. `supabase/migrations/0003_booking_and_notifications.sql`
4. `supabase/migrations/0004_integrity.sql`

Opcional para demonstração:
5. `supabase/seed.sql`

## 4. Criar o Super Admin TAJO
1. Authentication > Users > crie sua conta.
2. Rode `supabase/admin_setup.sql`, trocando `SEU_EMAIL_ADMIN_AQUI`.
3. Faça login em `/login`.
4. Seu acesso a `/admin` será liberado pelo backend.

Nunca exponha um botão para alguém escolher `super_admin`.

## 5. Criar clientes
No Super Admin acesse:
`/admin/empresas/nova`

O fluxo cria:
- usuário proprietário via convite;
- organização;
- membership `owner`;
- trial de 7 dias;
- assinatura base;
- preferências de notificação;
- audit log.

## 6. Agendamento público
A rota pública é:
`/agendar/[slug]`

Exemplo do seed:
`/agendar/barbearia-central`

Ela usa RPCs de segurança:
- `get_public_booking_page`
- `get_available_slots`
- `create_public_appointment`

O visitante não recebe acesso direto às tabelas de clientes ou agendamentos.

## 7. Notificações
Ao criar um agendamento, o banco gera jobs:
- aviso interno ao estabelecimento: imediato;
- confirmação do cliente: imediato (fila WhatsApp preparada);
- lembrete: 48h antes (fila WhatsApp preparada);
- lembrete: 3h antes (fila WhatsApp preparada).

`process-notifications` processa os jobs de equipe e cria notificações internas.

### Deploy da Edge Function
Com Supabase CLI:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy process-notifications --no-verify-jwt
supabase secrets set TAJO_CRON_SECRET="SEU_SEGREDO"
```

## 8. Cron
No Supabase Dashboard > Integrations > Cron, configure uma chamada HTTP a cada minuto para:

`https://SEU-PROJETO.supabase.co/functions/v1/process-notifications`

Header:
`x-tajo-cron-secret: SEU_SEGREDO`

O Supabase suporta Cron/pg_cron para invocar Edge Functions de forma periódica.

## 9. Push real no celular
A base já possui:
- `push_subscriptions`;
- `notifications`;
- fila `notification_jobs`;
- preferências por empresa.

A entrega Web Push/FCM é a próxima camada de transporte. Não coloquei credenciais fictícias no projeto. Para produção, conectar FCM/Web Push à tabela `notifications` e registrar os tokens do PWA.

## 10. WhatsApp
Os jobs do cliente já são criados como `channel = whatsapp`, mas não são enviados nesta versão porque ainda não há credencial/API oficial da Meta configurada.

Ao integrar WhatsApp Cloud API, crie um worker separado para os jobs `recipient_type=customer AND channel=whatsapp`.

## 11. GitHub/Vercel
```bash
npm install
npm run build
```

Depois:
1. subir ao GitHub;
2. importar na Vercel;
3. cadastrar as variáveis;
4. adicionar `agenda.tajodigital.com.br`;
5. configurar DNS conforme a Vercel informar.

## Segurança implementada
- RLS em todas as tabelas de negócio;
- isolamento por `organization_id`;
- `service_role` apenas server-side;
- papéis `owner`, `manager`, `staff`;
- `super_admin` separado;
- proteção contra elevação de privilégio no perfil;
- validação cross-tenant;
- exclusão de agendamentos sobrepostos no Postgres;
- RPC controlada para agendamento público;
- audit log administrativo.
