import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUserFromRequest } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('stripeCustomerId')
    .eq('id', userId)
    .single()

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
