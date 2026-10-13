import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_public_appointment', {
    p_slug: String(body.slug || ''),
    p_service_id: body.serviceId,
    p_professional_id: body.professionalId,
    p_date: body.date,
    p_time: body.time,
    p_customer_name: String(body.customerName || ''),
    p_customer_phone: String(body.customerPhone || ''),
    p_notes: body.notes ? String(body.notes) : null,
  })

  if (error) {
    const known = error.message.includes('SLOT_NOT_AVAILABLE') ? 'Esse horário acabou de ficar indisponível. Escolha outro.' : 'Não foi possível concluir o agendamento.'
    return NextResponse.json({ error: known }, { status: 409 })
  }
  return NextResponse.json({ appointmentId: data }, { status: 201 })
}
