import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')
  const serviceId = url.searchParams.get('serviceId')
  const professionalId = url.searchParams.get('professionalId')
  const date = url.searchParams.get('date')
  if (!slug || !serviceId || !professionalId || !date) return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_slug: slug, p_service_id: serviceId, p_professional_id: professionalId, p_date: date,
  })
  if (error) return NextResponse.json({ error: 'Não foi possível consultar horários.' }, { status: 400 })
  return NextResponse.json({ slots: data ?? [] })
}
