import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

Deno.serve(async (req) => {
  const secret = Deno.env.get('TAJO_CRON_SECRET')
  if (!secret || req.headers.get('x-tajo-cron-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data: jobs, error } = await supabase
    .from('notification_jobs')
    .select('*')
    .eq('status', 'pending')
    .eq('recipient_type', 'staff')
    .eq('channel', 'push')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  let processed = 0

  for (const job of jobs ?? []) {
    const { data: claimed } = await supabase
      .from('notification_jobs')
      .update({ status: 'processing', attempts: job.attempts + 1 })
      .eq('id', job.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    if (!claimed) continue

    try {
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', job.organization_id)
        .eq('active', true)
      if (membersError) throw membersError

      const title = String(job.payload?.title || 'TAJO Agenda')
      const body = String(job.payload?.body || 'Você possui uma atualização na agenda.')
      if (members?.length) {
        const rows = members.map(m => ({
          organization_id: job.organization_id,
          user_id: m.user_id,
          title,
          body,
          type: job.job_type,
          metadata: { appointment_id: job.appointment_id, job_id: job.id },
        }))
        const { error: insertError } = await supabase.from('notifications').insert(rows)
        if (insertError) throw insertError
      }

      await supabase.from('notification_jobs').update({ status: 'sent', processed_at: new Date().toISOString(), last_error: null }).eq('id', job.id)
      processed++
    } catch (e) {
      await supabase.from('notification_jobs').update({ status: 'failed', processed_at: new Date().toISOString(), last_error: e instanceof Error ? e.message : String(e) }).eq('id', job.id)
    }
  }

  return Response.json({ ok: true, processed })
})
