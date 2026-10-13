# TAJO Agenda V1 — Frontend

Frontend demonstrável do primeiro MVP do TAJO Agenda.

## Rotas principais

- `/` — landing page comercial
- `/login` — login demonstrativo
- `/dashboard` — painel do cliente
- `/dashboard/agenda`
- `/dashboard/clientes`
- `/dashboard/servicos`
- `/dashboard/profissionais`
- `/dashboard/horarios`
- `/dashboard/notificacoes`
- `/dashboard/configuracoes`
- `/admin` — Super Admin TAJO
- `/admin/empresas`
- `/admin/assinaturas`
- `/admin/configuracoes`
- `/agendar/barbearia-central` — página pública de agendamento
- `/agendar/barbearia-central/confirmado`

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Publicar na Vercel

1. Envie o projeto para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Framework: Next.js.
4. Não há variáveis de ambiente nesta versão frontend.
5. Depois conecte `agenda.tajodigital.com.br` em Domains.

## Escopo desta versão

É frontend demonstrável. Não possui autenticação real, banco, pagamentos, WhatsApp ou Push real.

A próxima etapa é Supabase:
- Auth
- multi-tenant / organizations
- RLS
- appointments
- services
- professionals
- customers
- availability
- notification jobs
- push subscriptions
- subscriptions
- audit logs

## Direção visual

Paleta neutra (preto, branco, cinza e off-white) para permitir que negócios de diferentes nichos utilizem a mesma base visual sem conflito com suas marcas.
