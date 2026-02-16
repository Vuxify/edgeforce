# EdgeForce

AI-powered sports betting predictions platform. Beat Vegas with data-driven edge.

![Status](https://img.shields.io/badge/status-ready_to_deploy-success)
![Issues](https://img.shields.io/badge/issues-8%2F8_complete-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

EdgeForce is a comprehensive sports betting platform that uses custom machine learning models to generate profitable betting predictions. Built with transparency and data-driven analysis at its core.

**Features:**
- 🧠 Custom ML prediction engine (XGBoost/LightGBM)
- 📊 Real-time sports data aggregation
- 💎 Three-tier subscription system (Free/Pro/Elite)
- 🤖 Discord bot with automated pick posting
- 📈 Admin dashboard with analytics
- 💳 Stripe payment integration
- 🎨 Beautiful glassmorphism UI

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Vuxify/edgeforce.git
cd edgeforce

# Run setup script
./scripts/deploy-setup.sh

# Start development
cd apps/web && npm run dev    # Web app on :3000
cd bot && node index.js        # Discord bot
```

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components
- **Animations:** Framer Motion (planned)

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Simple password-based admin auth
- **Payments:** Stripe
- **API:** Next.js API Routes

### ML/Data
- **Model:** Python (XGBoost) - currently mock, production TODO
- **Data Sources:** Mock data (production: web scraping + The Odds API)
- **Features:** Team stats, win rates, home/away, rest days

### Integrations
- **Discord:** discord.js v14 bot
- **Payments:** Stripe Checkout + Webhooks
- **Hosting:** Vercel (web), Railway/VPS (bot)

## 🏗️ Project Structure

```
edgeforce/
├── apps/
│   └── web/              # Next.js web application
│       ├── app/
│       │   ├── admin/    # Admin dashboard
│       │   ├── api/      # API routes
│       │   │   ├── picks/
│       │   │   ├── predict/
│       │   │   ├── sports/
│       │   │   └── stripe/
│       │   ├── page.tsx  # Landing page
│       │   └── layout.tsx
│       ├── lib/          # Utilities
│       └── components/   # React components
├── bot/                  # Discord bot
│   └── index.js
├── ml/                   # Machine learning
│   ├── scripts/          # Python prediction models
│   └── models/           # Trained models (future)
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
    ├── DATABASE_SETUP.md
    ├── SPORTS_DATA_API.md
    ├── STRIPE_SETUP.md
    └── DEPLOYMENT.md
```

## 🎮 Features

### 1. ML Prediction Engine
- Custom sports betting model
- Confidence scoring (30-95%)
- Feature-based predictions
- Reasoning generation
- API endpoint: `/api/predict`

### 2. Sports Data API
- Games aggregation (NFL/NBA/MLB/NHL)
- Live odds tracking
- Team statistics
- Mock data currently, production scraping ready

### 3. Admin Dashboard
- Password-protected access
- Pick management (create/edit/view)
- Performance analytics
- Win/loss tracking
- ROI calculations

### 4. Discord Bot
- Slash commands: `/pick`, `/stats`, `/picks`
- Scheduled daily posts (9 AM)
- Rich embeds with brand colors
- Role-based access (Free/Pro/Elite)

### 5. Stripe Subscriptions
- Three tiers: Free ($0), Pro ($29), Elite ($99)
- 7-day free trial
- Automatic billing
- Customer portal
- Webhook event handling

## 💰 Subscription Tiers

| Feature | Free | Pro | Elite |
|---------|------|-----|-------|
| **Price** | $0 | $29/mo | $99/mo |
| **Daily Picks** | 1 | 5-10 | Unlimited |
| **Historical Data** | 30 days | 1 year | All time |
| **Discord Access** | Public | Pro channel | VIP channel |
| **Parlay Builder** | ❌ | ✅ | ✅ |
| **Injury Alerts** | ❌ | ✅ | ✅ |
| **Live Updates** | ❌ | ❌ | ✅ |
| **Strategy Calls** | ❌ | ❌ | ✅ (monthly) |
| **API Access** | ❌ | ❌ | ✅ |

## 🎯 Performance Targets

- **Win Rate:** >54% (break-even: 52.4% at -110 odds)
- **ROI:** >5% (excellent: >10%)
- **Confidence Calibration:** Predicted probability ≈ actual win rate
- **Picks Tracked:** All picks public, no cherry-picking

## 📊 API Endpoints

### Sports Data
```bash
GET  /api/sports/games       # Today's games
GET  /api/sports/odds        # Betting lines
GET  /api/sports/stats       # Team statistics
```

### Predictions
```bash
POST /api/predict            # Generate prediction
GET  /api/picks              # Today's picks
GET  /api/stats              # Performance stats
```

### Stripe
```bash
POST /api/stripe/checkout    # Create payment session
POST /api/stripe/webhook     # Handle Stripe events
POST /api/stripe/portal      # Manage subscription
```

### Admin
```bash
POST /api/admin/login        # Admin login
```

## 🚀 Deployment

### Prerequisites
- [ ] Domain: edgeforce.gg ($15-30/year)
- [ ] Supabase account (database)
- [ ] Stripe account (payments)
- [ ] Discord bot token
- [ ] Vercel account (hosting)

### Deploy Web App
```bash
# 1. Connect GitHub repo to Vercel
# 2. Configure environment variables (see DEPLOYMENT.md)
# 3. Set Root Directory to: apps/web
# 4. Deploy!

# Manual deploy:
npx vercel --prod
```

### Deploy Discord Bot
```bash
# Option 1: Railway.app (recommended)
# Option 2: VPS with PM2
# Option 3: Heroku

# See DEPLOYMENT.md for detailed instructions
```

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_PASSWORD_HASH`
- `DISCORD_BOT_TOKEN`

See `.env.example` files for complete list.

## 📚 Documentation

- [Database Setup](DATABASE_SETUP.md) - Supabase schema and configuration
- [Sports Data API](SPORTS_DATA_API.md) - Data collection guide
- [Stripe Integration](STRIPE_SETUP.md) - Payment system setup
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [ML System](ml/README.md) - Prediction model documentation

## 🛠️ Development

```bash
# Install dependencies
npm install
cd apps/web && npm install
cd bot && npm install

# Start web app (dev)
cd apps/web
npm run dev

# Start Discord bot (dev)
cd bot
node index.js

# Run ML prediction (test)
cd ml/scripts
python3 predict.py '{"sport":"NFL","home_team":"Chiefs","away_team":"49ers"}'
```

## 🧪 Testing

```bash
# Test API endpoints
curl http://localhost:3000/api/sports/games
curl http://localhost:3000/api/predict
curl http://localhost:3000/api/stats

# Test Discord bot commands
/pick
/stats
/picks

# Test Stripe (use test card: 4242 4242 4242 4242)
```

## 📈 Roadmap

### Phase 1: MVP (COMPLETE ✅)
- [x] Landing page with waitlist
- [x] Database schema
- [x] Admin dashboard
- [x] Mock ML predictions
- [x] Discord bot
- [x] Stripe integration
- [x] Deployment configuration

### Phase 2: Production ML (In Progress)
- [ ] Collect 3+ seasons historical data
- [ ] Build feature engineering pipeline
- [ ] Train real XGBoost model
- [ ] Backtest on historical data
- [ ] Deploy production model

### Phase 3: Data Integration
- [ ] ESPN API scraping
- [ ] Basketball-Reference scraping
- [ ] The Odds API integration ($29/mo)
- [ ] Injury alert system
- [ ] Redis caching layer

### Phase 4: Advanced Features
- [ ] Parlay builder
- [ ] Live betting adjustments
- [ ] Mobile app (React Native)
- [ ] API for Elite users
- [ ] Bankroll tracking tool

### Phase 5: Marketing & Growth
- [ ] Social media automation
- [ ] Influencer partnerships
- [ ] SEO optimization
- [ ] Email marketing
- [ ] Referral program

## 💰 Revenue Model

**Target:** 1,000 users @ avg $20/month = **$20k MRR**

**Example breakdown:**
- 700 Free users (0%)
- 250 Pro users @ $29 = $7,250/mo
- 50 Elite users @ $99 = $4,950/mo
- **Total: $12,200/month**

**Costs:**
- Vercel: $20/mo
- Supabase: $25/mo
- The Odds API: $29/mo
- Discord Bot hosting: $10/mo
- Domain: $2/mo
- Stripe fees: ~3%
- **Total: ~$450/month**

**Net profit: ~$11,750/month** at 300 paid users

## ⚖️ Legal & Compliance

- **Not a sportsbook** - Analysis/entertainment service only
- **21+ age gate** required
- **Public pick tracking** - All picks posted publicly, no cherry-picking
- **Transparent performance** - Real-time win/loss stats
- **Clear disclaimers** - Gambling can be addictive, bet responsibly

## 📞 Support

- **GitHub Issues:** [Open an issue](https://github.com/Vuxify/edgeforce/issues)
- **Discord Community:** Coming soon
- **Email:** support@edgeforce.gg (setup pending)

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built with [OpenClaw](https://openclaw.ai) AI assistant
- Inspired by FiveThirtyEight's sports models
- Community feedback from r/sportsbook

---

**Ready to beat Vegas? Let's build EdgeForce! 🚀**

[Live Demo](https://edgeforce.gg) (coming soon) | [Documentation](./DEPLOYMENT.md) | [API Reference](./SPORTS_DATA_API.md)
