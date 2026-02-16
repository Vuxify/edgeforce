import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      '1 pick per day',
      'Public statistics',
      'Community Discord access',
      'Basic performance tracking'
    ],
    limits: {
      daily_picks: 1,
      historical_picks: 30
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO, // Set in Stripe dashboard
    features: [
      '5-10 picks per day',
      'Parlay builder',
      'Injury alerts',
      'Pro Discord channel',
      'Email notifications',
      'Advanced analytics'
    ],
    limits: {
      daily_picks: 10,
      historical_picks: 365
    }
  },
  ELITE: {
    id: 'elite',
    name: 'Elite',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ELITE, // Set in Stripe dashboard
    features: [
      'Unlimited picks',
      'Live game adjustments',
      'VIP Discord channel',
      'Priority support',
      'Monthly 1-on-1 strategy call',
      'API access',
      'Custom bankroll tracking'
    ],
    limits: {
      daily_picks: Infinity,
      historical_picks: Infinity
    }
  }
}

// Helper to get tier by ID
export function getTier(tierId: string) {
  return Object.values(SUBSCRIPTION_TIERS).find(t => t.id === tierId)
}

// Helper to check if user can access a pick
export function canAccessPick(userTier: string, pickTier: string) {
  const tierOrder = ['free', 'pro', 'elite']
  const userIndex = tierOrder.indexOf(userTier.toLowerCase())
  const pickIndex = tierOrder.indexOf(pickTier.toLowerCase())
  
  return userIndex >= pickIndex
}
