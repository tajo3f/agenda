import 'server-only'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

export async function getCurrentTenant() {
  const { supabase, user } = await requireUser()
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) redirect('/?sem_empresa=1')

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .single()

  if (!organization) redirect('/?sem_empresa=1')
  return { supabase, user, membership, organization }
}
