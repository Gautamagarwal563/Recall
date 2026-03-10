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

  const passwordHash = await bcrypt.hash(password, 10)
  const apiToken = crypto.randomUUID()

  const { data, error } = await supabase
    .from('users')
    .insert({ email, passwordHash, apiToken })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', data.id, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 })

  return NextResponse.json({ ok: true, token: apiToken, plan: 'free' })
}
