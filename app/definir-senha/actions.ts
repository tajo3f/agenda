'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function setPassword(formData: FormData) {
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')
  if (password.length < 8) redirect('/definir-senha?error=' + encodeURIComponent('Use pelo menos 8 caracteres.'))
  if (password !== confirm) redirect('/definir-senha?error=' + encodeURIComponent('As senhas não coincidem.'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?error=' + encodeURIComponent('Abra novamente o convite enviado por e-mail.'))
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect('/definir-senha?error=' + encodeURIComponent(error.message))
  redirect('/dashboard')
}
