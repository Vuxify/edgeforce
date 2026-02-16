# EdgeForce Deployment Guide

Complete guide to deploy EdgeForce to production on Vercel.

## Pre-Deployment Checklist

### 1. Domain Registration
- [ ] Purchase domain: **edgeforce.gg** (~$15-30/year)
- Recommended registrars: Namecheap, GoDaddy, Google Domains
- Alternative: getedgeforce.com if .gg unavailable

### 2. Database Setup (Supabase)
- [ ] Create Supabase project
- [ ] Run SQL schema from `DATABASE_SETUP.md`
- [ ] Copy connection strings
- [ ] Enable RLS policies
- [ ] Insert test performance data

### 3. Stripe Configuration
- [ ] Create Stripe account
- [ ] Create Pro ($29) and Elite ($99) products
- [ ] Copy Price IDs
- [ ] Set up webhook endpoint
- [ ] Enable customer portal
- [ ] Switch to live keys (production only)

### 4. Discord Bot Setup
- [ ] Create Discord application
- [ ] Get bot token
- [ ] Create server and channels
- [ ] Invite bot to server
- [ ] Note channel IDs

### 5. Admin Access
- [ ] Generate admin password hash:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword', 10))"
  ```

## Deployment Steps

### 1. Connect GitHub to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" → "Project"
4. Import `Vuxify/edgeforce` repository
5. Configure build settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### 2. Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (secret)

# Stripe (from Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_live_... (secret)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ELITE=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (secret)

# Admin (bcrypt hash of your admin password)
ADMIN_PASSWORD_HASH=$2a$10$... (secret)

# Discord (optional, for notifications)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (secret)

# Site URL
NEXT_PUBLIC_BASE_URL=https://edgeforce.gg
```

**Important:** Mark sensitive values as "Secret" in Vercel

### 3. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Verify deployment at temporary URL: `https://edgeforce-xxx.vercel.app`

### 4. Configure Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Add domain: `edgeforce.gg`
3. Follow DNS configuration instructions:
   - Add A record: `76.76.21.21`
   - Add CNAME for `www`: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)
5. Verify SSL certificate is active

### 5. Update Stripe Webhook

After deployment:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to: `https://edgeforce.gg/api/stripe/webhook`
3. Test webhook with Stripe CLI:
   ```bash
   stripe trigger checkout.session.completed
   ```

### 6. Deploy Discord Bot

Discord bot runs separately (not on Vercel):

**Option A: Railway.app (Recommended)**
1. Sign up at https://railway.app
2. Create new project from GitHub
3. Select `bot` directory
4. Add environment variables:
   ```env
   DISCORD_BOT_TOKEN=...
   DISCORD_CLIENT_ID=...
   PICKS_CHANNEL_ID=...
   API_BASE_URL=https://edgeforce.gg
   ```
5. Deploy

**Option B: VPS (DigitalOcean, Linode)**
```bash
# SSH into server
ssh root@your-server-ip

# Clone repo
git clone https://github.com/Vuxify/edgeforce.git
cd edgeforce/bot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Add tokens

# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name edgeforce-bot
pm2 save
pm2 startup
```

**Option C: Heroku**
```bash
heroku create edgeforce-bot
heroku config:set DISCORD_BOT_TOKEN=...
git subtree push --prefix bot heroku main
```

## Post-Deployment Testing

### 1. Website
- [ ] Visit https://edgeforce.gg
- [ ] Landing page loads correctly
- [ ] Logo and branding appear
- [ ] Navigation works

### 2. API Endpoints
```bash
# Test games API
curl https://edgeforce.gg/api/sports/games

# Test prediction API
curl https://edgeforce.gg/api/predict

# Test stats API
curl https://edgeforce.gg/api/stats
```

### 3. Admin Dashboard
- [ ] Visit https://edgeforce.gg/admin
- [ ] Login with admin password
- [ ] Dashboard loads with stats
- [ ] Picks table renders
- [ ] Analytics tab shows data

### 4. Stripe Integration
- [ ] Visit pricing page (create one if needed)
- [ ] Click "Subscribe to Pro"
- [ ] Checkout redirects to Stripe
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Verify webhook receives event
- [ ] Check user upgraded in database

### 5. Discord Bot
- [ ] Bot shows online in Discord
- [ ] Run `/pick` command
- [ ] Run `/stats` command
- [ ] Verify embeds display correctly
- [ ] Wait for scheduled post (or trigger manually)

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor build status
- Check function logs
- Track bandwidth usage
- View analytics

### Supabase Dashboard
- Monitor database size
- Check active connections
- Review query performance
- Set up backup schedule

### Stripe Dashboard
- Track revenue (MRR)
- Monitor failed payments
- Review webhook logs
- Watch churn rate

### Discord Bot Health
- Check uptime
- Monitor error logs
- Verify scheduled posts run
- Track command usage

## Troubleshooting

### Build Fails on Vercel
- Check `vercel.json` configuration
- Verify Root Directory is `apps/web`
- Check all dependencies are in package.json
- Review build logs for specific errors

### Database Connection Errors
- Verify Supabase URL and keys are correct
- Check RLS policies aren't blocking queries
- Ensure service role key is used for admin operations

### Stripe Webhook Not Working
- Verify webhook secret matches Vercel env var
- Check webhook endpoint URL is correct
- Review Stripe webhook logs
- Ensure raw body is passed to verification

### Discord Bot Offline
- Check bot token is valid
- Verify bot has proper intents enabled
- Review bot error logs
- Ensure API_BASE_URL points to production

### Admin Dashboard 401 Error
- Regenerate bcrypt hash of password
- Update ADMIN_PASSWORD_HASH in Vercel
- Redeploy to apply changes

## Continuous Deployment

Vercel automatically deploys on git push:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push

# Vercel deploys automatically
# Preview URL generated for each branch
# Production deployed on main branch
```

## Performance Optimization

### 1. Enable Caching
- API routes with 15-minute revalidation
- Static pages cached at edge
- Database query results cached in-memory

### 2. Image Optimization
- Use Next.js Image component
- Enable Vercel Image Optimization
- Compress images before upload

### 3. Database Indexes
```sql
-- Already created in schema, verify:
CREATE INDEX idx_picks_sport ON picks(sport);
CREATE INDEX idx_picks_game_time ON picks(game_time);
```

### 4. Rate Limiting
- Implement rate limiting on API routes
- Use Vercel Edge Config for IP blocking
- Monitor for abuse patterns

## Backup Strategy

### Database (Supabase)
- Automatic backups (daily)
- Manual backups before schema changes
- Export picks data weekly to CSV

### Code (GitHub)
- All code in version control
- Protected main branch
- Require PR reviews

### Environment Variables
- Document all env vars
- Store securely (1Password, Vercel dashboard)
- Never commit to git

## Cost Estimate

**Monthly costs:**
- Vercel Pro: $20/month (optional, free tier works)
- Supabase Pro: $25/month (optional, free tier works)
- Domain: $2-3/month (amortized)
- Stripe: 2.9% + $0.30 per transaction
- Discord Bot hosting: $5-10/month
- The Odds API (optional): $29/month

**Minimum to start:** ~$10-15/month  
**Recommended:** ~$50-75/month with Pro plans

## Launch Checklist

- [ ] Domain connected and SSL active
- [ ] All environment variables configured
- [ ] Database schema deployed with test data
- [ ] Stripe products created and live keys active
- [ ] Webhook endpoint configured and tested
- [ ] Discord bot deployed and online
- [ ] Admin dashboard accessible
- [ ] All API endpoints responding
- [ ] Test subscription flow end-to-end
- [ ] Performance monitoring set up
- [ ] Error tracking configured (Sentry optional)
- [ ] Backup strategy in place
- [ ] Social media accounts created (Twitter, Discord server)
- [ ] Legal pages ready (Terms, Privacy Policy)
- [ ] Analytics tracking installed (Plausible/Google)

## Going Live

1. Switch Stripe to live mode
2. Update environment variables with live keys
3. Redeploy on Vercel
4. Announce on Discord/Twitter
5. Monitor closely for 24-48 hours
6. Be ready to rollback if issues arise

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs

## Success Metrics

Track after launch:
- Daily active users
- Subscription conversion rate (Free → Pro/Elite)
- Churn rate (target: <5%/month)
- Win rate of picks (target: >54%)
- Discord engagement
- Revenue (MRR)

---

**You're ready to launch EdgeForce! 🚀**
