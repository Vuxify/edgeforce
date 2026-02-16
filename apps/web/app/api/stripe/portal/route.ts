import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // Get user's Stripe customer ID
    const { data: user, error } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()
    
    if (error || !user?.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })
    
    return NextResponse.json({
      success: true,
      url: session.url
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
