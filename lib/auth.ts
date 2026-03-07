import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { supabase } from './supabase'

export async function getUserFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('userId')?.value ?? null
}

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Check cookie first
  const userId = req.cookies.get('userId')?.value
  if (userId) return userId

  // Check Bearer token (for extension)
  const auth = req.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7)
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('apiToken', token)
      .single()
    return data?.id ?? null
  }

  return null
}
