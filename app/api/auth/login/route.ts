import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, passwordHash, apiToken')
    .eq('email', email)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 })

  // Return token in body so the Chrome extension can use it directly
  return NextResponse.json({ ok: true, token: user.apiToken })
}
