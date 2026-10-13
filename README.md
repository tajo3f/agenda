# TAJO Agenda V2 — Frontend + Supabase

Primeira base full-stack do TAJO Agenda.

## Incluído
- Next.js + TypeScript
- Supabase Auth com sessão por cookies
- arquitetura SaaS multi-tenant
- Super Admin TAJO
- owner / manager / staff
- RLS por organização
- serviços, profissionais e clientes
- regras de disponibilidade e bloqueios
- agendamento público real por RPC
- proteção contra conflito/sobreposição
- fila de notificações
- Edge Function para notificações internas
- estrutura preparada para Push/FCM e WhatsApp oficial
- criação de empresa/cliente pelo Super Admin

## Comece aqui
Leia `SETUP_SUPABASE.md`.

## Rotas
- `/` — landing page
- `/login` — autenticação Supabase
- `/dashboard` — empresa
- `/admin` — Super Admin TAJO
- `/admin/empresas/nova` — provisionar novo cliente
- `/agendar/[slug]` — agendamento público real

## Importante
A entrega de Push no sistema operacional e o envio de WhatsApp dependem de credenciais externas (FCM/Web Push e Meta WhatsApp Cloud API). A fila e o modelo de dados já estão preparados; credenciais não são simuladas nem embutidas no código.
