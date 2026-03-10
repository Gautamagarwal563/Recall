import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const status = sub.status

    // Only set to pro if subscription is active
    if (status === 'active' || status === 'trialing') {
      // Find user by stripeCustomerId or by metadata
      const { data: userByCustomer } = await supabase
        .from('users')
        .select('id')
        .eq('stripeCustomerId', customerId)
        .single()

      if (userByCustomer) {
        await supabase
          .from('users')
          .update({ plan: 'pro', stripeSubscriptionId: sub.id })
          .eq('id', userByCustomer.id)
      }
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId) {
      await supabase
        .from('users')
        .update({ plan: 'pro', stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    const { data: userByCustomer } = await supabase
      .from('users')
      .select('id')
      .eq('stripeCustomerId', customerId)
      .single()

    if (userByCustomer) {
      await supabase
        .from('users')
        .update({ plan: 'free', stripeSubscriptionId: null })
        .eq('id', userByCustomer.id)
    }
  }

  return NextResponse.json({ received: true })
}
