'use server'

import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const PLAN_PRICE: Record<string, number> = { START: 2990, PRO: 5990, BUSINESS: 12990 }

function cleanSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function createCompany(formData: FormData) {
  const { user } = await requireSuperAdmin()
  const admin = createAdminClient()

  const name = String(formData.get('name') || '').trim()
  const ownerName = String(formData.get('owner_name') || '').trim()
  const ownerEmail = String(formData.get('owner_email') || '').trim().toLowerCase()
  const phone = String(formData.get('phone') || '').trim()
  const segment = String(formData.get('segment') || '').trim()
  const plan = String(formData.get('plan') || 'PRO').toUpperCase()
  const slug = cleanSlug(String(formData.get('slug') || name))

  if (!name || !ownerName || !ownerEmail || !slug) {
    redirect('/admin/empresas/nova?error=' + encodeURIComponent('Preencha empresa, responsável e e-mail.'))
  }

  const { data: existingOrg } = await admin.from('organizations').select('id').eq('slug', slug).maybeSingle()
  if (existingOrg) redirect('/admin/empresas/nova?error=' + encodeURIComponent('Esse link público já está em uso.'))

  let ownerUserId: string | undefined
  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  ownerUserId = usersData.users.find(u => u.email?.toLowerCase() === ownerEmail)?.id

  if (!ownerUserId) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(ownerEmail, {
      redirectTo: `${appUrl}/auth/callback?next=/definir-senha`,
      data: { full_name: ownerName },
    })
    if (inviteError || !invited.user) {
      redirect('/admin/empresas/nova?error=' + encodeURIComponent(inviteError?.message || 'Não foi possível criar o acesso.'))
    }
    ownerUserId = invited.user.id
  }

  const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: org, error: orgError } = await admin.from('organizations').insert({
    name, slug, segment: segment || null, phone: phone || null,
    status: 'trial', plan_key: plan, trial_ends_at: trialEnds,
  }).select('id').single()

  if (orgError || !org) redirect('/admin/empresas/nova?error=' + encodeURIComponent(orgError?.message || 'Erro ao criar empresa.'))

  const { error: memberError } = await admin.from('organization_members').insert({
    organization_id: org.id, user_id: ownerUserId, role: 'owner', active: true,
  })
  if (memberError) redirect('/admin/empresas/nova?error=' + encodeURIComponent(memberError.message))

  await admin.from('profiles').update({ full_name: ownerName }).eq('id', ownerUserId)
  await admin.from('subscriptions').update({ plan_key: plan, amount_cents: PLAN_PRICE[plan] ?? 5990, status: 'trialing' }).eq('organization_id', org.id)
  await admin.from('audit_logs').insert({
    organization_id: org.id, actor_user_id: user.id, action: 'organization.created',
    entity_type: 'organization', entity_id: org.id,
    metadata: { plan, owner_email: ownerEmail },
  })

  redirect('/admin/empresas?created=1')
}
