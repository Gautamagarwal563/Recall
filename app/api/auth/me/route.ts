import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('email, plan')
    .eq('id', userId)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Count saves this calendar month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('saves')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .gte('createdAt', startOfMonth.toISOString())

  return NextResponse.json({
    email: user.email,
    plan: user.plan ?? 'free',
    savesThisMonth: count ?? 0,
  })
}
