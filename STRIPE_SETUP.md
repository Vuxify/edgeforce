# Stripe Integration Guide

Complete guide for setting up Stripe subscriptions for EdgeForce.

## Overview

Three subscription tiers with 7-day free trials:
- **Free:** $0 - 1 pick/day, public stats
- **Pro:** $29/month - 5-10 picks/day, parlay builder
- **Elite:** $99/month - Unlimited picks, VIP access

## Setup Steps

### 1. Create Stripe Account

1. Go to https://stripe.com and sign up
2. Complete business verification
3. Activate your account

### 2. Create Products in Stripe Dashboard

**Pro Tier:**
- Name: EdgeForce Pro
- Price: $29/month (recurring)
- Copy Price ID → `price_...`

**Elite Tier:**
- Name: EdgeForce Elite
- Price: $99/month (recurring)
- Copy Price ID → `price_...`

### 3. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://edgeforce.gg/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy Webhook Secret → `whsec_...`

### 4. Environment Variables

Add to `.env.local`:

```env
# Stripe Keys (from Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_...  # Or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from Products → Pricing)
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ELITE=price_...

# Webhook Secret (from Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your site URL
NEXT_PUBLIC_BASE_URL=https://edgeforce.gg  # Or http://localhost:3000 for dev
```

### 5. Enable Customer Portal

1. Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable portal
3. Configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to update subscriptions
4. Set return URL: `https://edgeforce.gg/dashboard`

## API Endpoints

### Create Checkout Session

```bash
POST /api/stripe/checkout
Content-Type: application/json

{
  "tier": "pro",
  "email": "user@example.com",
  "userId": "uuid-here"
}

Response:
{
  "success": true,
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Access Customer Portal

```bash
POST /api/stripe/portal
Content-Type: application/json

{
  "userId": "uuid-here"
}

Response:
{
  "success": true,
  "url": "https://billing.stripe.com/..."
}
```

### Webhook Handler

```bash
POST /api/stripe/webhook
Stripe-Signature: ...

# Stripe sends events automatically
# Handles: subscription create/update/delete, payments
```

## Frontend Integration

### Pricing Page

```typescript
'use client'

import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

async function handleSubscribe(tier: 'pro' | 'elite') {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier,
      email: user.email,
      userId: user.id
    })
  })
  
  const { url } = await response.json()
  
  // Redirect to Stripe Checkout
  window.location.href = url
}
```

### Manage Subscription

```typescript
async function openCustomerPortal() {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id })
  })
  
  const { url } = await response.json()
  window.location.href = url
}
```

## Database Schema

Users table includes:

```sql
stripe_customer_id TEXT  -- Stripe customer ID
tier TEXT                 -- free, pro, or elite
subscription_status TEXT  -- active, past_due, canceled, etc.
```

## Webhook Events

### checkout.session.completed
- User completes payment
- Create/update user record
- Set tier and customer ID

### customer.subscription.updated
- Subscription renewed
- Tier changed
- Update user tier and status

### customer.subscription.deleted
- User canceled
- Downgrade to free tier

### invoice.payment_succeeded
- Monthly payment successful
- Keep subscription active

### invoice.payment_failed
- Payment declined
- Mark as `past_due`
- Send notification email

## Testing

### Test Mode

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

## Production Checklist

- [ ] Stripe account verified
- [ ] Pro/Elite products created
- [ ] Price IDs added to `.env`
- [ ] Webhook configured and secret added
- [ ] Customer portal enabled
- [ ] Switch to live API keys
- [ ] Test full subscription flow
- [ ] Test cancellation flow
- [ ] Test failed payment handling
- [ ] Monitor webhook logs

## Monitoring

### Stripe Dashboard
- Revenue tracking
- Failed payments
- Churn rate
- MRR (Monthly Recurring Revenue)

### Webhook Logs
- Success/failure rates
- Event processing time
- Error patterns

## Security

- ✅ Webhook signature verification
- ✅ Idempotent event handling
- ✅ Secure API keys (never expose secret key)
- ✅ HTTPS only in production
- ✅ Rate limiting on checkout endpoint

## Cost Structure

**Stripe Fees:**
- 2.9% + $0.30 per transaction
- No monthly fees, no setup costs

**Example Revenue:**
- 100 Pro users × $29 = $2,900/month
- 20 Elite users × $99 = $1,980/month
- Total: $4,880/month
- Stripe fees: ~$150/month
- Net: ~$4,730/month

## Support & Resources

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Stripe Status: https://status.stripe.com
- Test Cards: https://stripe.com/docs/testing

## Troubleshooting

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure raw body is passed to `constructEvent`

### "No active subscription found"
- User hasn't completed checkout
- Check `stripe_customer_id` is set in database

### "Price ID not configured"
- Add `STRIPE_PRICE_PRO` and `STRIPE_PRICE_ELITE` to `.env`
- Verify Price IDs in Stripe Dashboard

## Next Steps

1. Create Stripe account and configure products
2. Add environment variables to Vercel
3. Test checkout flow with test card
4. Build pricing page UI
5. Add "Manage Subscription" button to dashboard
6. Monitor first real subscriptions!
