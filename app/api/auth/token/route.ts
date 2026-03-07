import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const userId = await getUserFromCookie()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('users')
    .select('apiToken')
    .eq('id', userId)
    .single()

  return NextResponse.json({ token: data?.apiToken })
}
