import { supabase } from '@/lib/supabaseClient'

export async function fetchProfile(userId) {
  if (!supabase || !userId) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, created_at')
    .eq('id', userId)
    .maybeSingle()

  return { data, error: error?.message ?? null }
}

export async function signInWithEmail(email, password) {
  if (!supabase) return { data: null, error: 'App is not connected to Supabase.' }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error: error?.message ?? null }
}

export async function signUpWithEmail({ email, password, name }) {
  if (!supabase) return { data: null, error: 'App is not connected to Supabase.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  return { data, error: error?.message ?? null }
}

export async function signOut() {
  if (!supabase) return { error: 'App is not connected to Supabase.' }
  const { error } = await supabase.auth.signOut()
  return { error: error?.message ?? null }
}

export async function updateProfile(userId, { name, phone }) {
  if (!supabase || !userId) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: name.trim(),
      phone: phone?.trim() ? phone.trim() : null,
    })
    .eq('id', userId)
    .select('id, name, email, phone, role, created_at')
    .single()

  return { data, error: error?.message ?? null }
}
