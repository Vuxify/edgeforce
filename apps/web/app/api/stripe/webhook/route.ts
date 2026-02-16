import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id
  const tier = session.metadata?.tier
  
  if (!userId || !tier) {
    console.error('Missing userId or tier in checkout session')
    return
  }
  
  // Update user in database
  await supabase
    .from('users')
    .upsert({
      id: userId,
      email: session.customer_email,
      stripe_customer_id: session.customer as string,
      tier: tier,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
  
  console.log(`Subscription activated for user ${userId}: ${tier}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const status = subscription.status
  const tier = subscription.metadata.tier
  
  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }
  
  // Update subscription status
  await supabase
    .from('users')
    .update({
      subscription_status: status,
      tier: tier || 'free',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
  
  console.log(`Subscription updated for customer ${customerId}: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  // Downgrade to free tier
  await supabase
    .from('users')
    .update({
      tier: 'free',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  console.log(`Subscription canceled for customer ${customerId}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // Payment successful - ensure subscription is active
  await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  console.log(`Payment succeeded for customer ${customerId}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // Payment failed - mark subscription as past_due
  await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  console.log(`Payment failed for customer ${customerId}`)
  
  // TODO: Send email notification to user
}
