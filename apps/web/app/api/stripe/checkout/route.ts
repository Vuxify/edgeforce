import { NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { tier, email, userId } = await request.json()
    
    // Validate tier
    if (!['pro', 'elite'].includes(tier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      )
    }
    
    const tierConfig = SUBSCRIPTION_TIERS[tier.toUpperCase() as 'PRO' | 'ELITE']
    
    if (!tierConfig.priceId) {
      return NextResponse.json(
        { success: false, error: 'Price ID not configured' },
        { status: 500 }
      )
    }
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          tier: tier,
          userId: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        tier: tier,
      },
    })
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
