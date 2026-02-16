# EdgeForce - AI-Powered Sports Betting Platform

**Domain:** edgeforce.gg (recommended)  
**Tagline:** "Beat Vegas. Backed by AI."

## 🎯 Business Overview

EdgeForce is an AI-powered sports betting prediction platform that provides data-driven picks, live injury analysis, and community-driven insights through Discord integration.

### Revenue Model
- **Free Tier:** 1 pick/day, public performance stats
- **Pro ($29/month):** 5-10 picks/day, parlay builder, injury alerts
- **Elite ($99/month):** 20+ picks/day, live adjustments, VIP Discord, 1-on-1 strategy

## 📋 MVP Roadmap (4 Weeks)

### Week 1: Foundation ✅
- [x] Project scaffolding
- [ ] Landing page with waitlist
- [ ] Brand identity (logo, colors)
- [ ] Database schema
- [ ] Authentication setup

### Week 2: Core Features
- [ ] Pick generation system
- [ ] Performance tracking dashboard
- [ ] Historical data integration
- [ ] Discord bot (basic)

### Week 3: AI Integration
- [ ] Fine-tune prediction model
- [ ] Automated pick posting
- [ ] Confidence scoring
- [ ] Injury alert system

### Week 4: Monetization
- [ ] Stripe subscription integration
- [ ] Tiered access control
- [ ] Payment webhooks
- [ ] Launch marketing site

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js
- **Payment:** Stripe
- **AI:** OpenAI API (GPT-4) + Custom ML

### Data Sources
- **Odds:** The Odds API
- **Stats:** ESPN API (unofficial)
- **Injuries:** RotoWire RSS
- **Historical:** Custom scraping + CSV archives

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **Discord:** Discord.js
- **Analytics:** Plausible
- **Monitoring:** Sentry

## 📊 Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  tier TEXT DEFAULT 'free', -- free, pro, elite
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Picks
CREATE TABLE picks (
  id UUID PRIMARY KEY,
  sport TEXT, -- NFL, NBA, MLB, NHL
  game TEXT,
  pick TEXT,
  odds DECIMAL,
  confidence INTEGER, -- 0-100
  reasoning TEXT,
  result TEXT, -- pending, win, loss, push
  posted_at TIMESTAMP DEFAULT NOW(),
  game_time TIMESTAMP
);

-- User picks (for tracking individual user performance)
CREATE TABLE user_picks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pick_id UUID REFERENCES picks(id),
  followed_at TIMESTAMP DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE performance (
  id UUID PRIMARY KEY,
  period TEXT, -- daily, weekly, monthly, all-time
  wins INTEGER,
  losses INTEGER,
  pushes INTEGER,
  roi DECIMAL,
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Brand Guidelines

### Colors
- **Primary:** Electric Blue `#0066FF`
- **Secondary:** Neon Green `#00FF88`
- **Dark:** `#0A0A0F`
- **Accent:** Gold `#FFD700`

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Mono:** JetBrains Mono

### Voice & Tone
- **Confident, not cocky**
- **Data-driven, transparent**
- **Community-focused**
- **No gambling addiction promotion**

## 🔒 Legal & Compliance

### Required Disclaimers
```
EdgeForce provides sports analysis and predictions for entertainment 
purposes only. Gambling involves risk. Past performance does not 
guarantee future results. Must be 21+ to access. We do not accept 
wagers or operate as a sportsbook.
```

### Terms of Service
- Track ALL picks publicly (no cherry-picking)
- Clear refund policy
- Age verification
- State-specific compliance
- Responsible gambling resources

## 📈 Marketing Strategy

### Phase 1: Build Audience (Month 1-2)
- Free daily picks on Twitter/X
- Reddit presence (r/sportsbook)
- YouTube breakdowns
- SEO content (betting guides)

### Phase 2: Convert (Month 2-3)
- Launch paid tiers
- Affiliate partnerships with sportsbooks
- Discord community growth
- Influencer collaborations

### Phase 3: Scale (Month 3-6)
- Podcast sponsorships
- TikTok/Instagram Reels
- Email nurture sequences
- Referral program

## 🎲 Sample Features

### Daily Pick Card
```typescript
interface DailyPick {
  id: string
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL'
  game: string // "Lakers vs Warriors"
  homeTeam: string
  awayTeam: string
  pick: string // "Warriors -4.5"
  pickType: 'spread' | 'moneyline' | 'over_under'
  odds: number // -110
  confidence: number // 0-100
  reasoning: string
  injuryImpact?: string
  weather?: string
  timestamp: Date
  gameTime: Date
}
```

### Performance Dashboard
- Win rate (overall, by sport)
- ROI tracking
- Units won/lost
- Best/worst sports
- Hot/cold streaks
- Monthly breakdown

### Discord Bot Commands
- `/pick` - Get today's top pick
- `/parlay` - Get suggested parlay
- `/stats` - View performance stats
- `/injuries` - Latest injury updates
- `/subscribe` - Upgrade to premium

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Domain purchased (edgeforce.gg)
- [ ] Landing page live
- [ ] Email list setup (ConvertKit/Mailchimp)
- [ ] Discord server created
- [ ] Social media accounts (@EdgeForce on X/Twitter)
- [ ] Legal disclaimers reviewed
- [ ] Stripe account setup

### Launch Day
- [ ] Open waitlist
- [ ] Post free pick on Twitter
- [ ] Launch Discord server
- [ ] Submit to Product Hunt
- [ ] Reddit announcement (r/sportsbook)

### Post-Launch
- [ ] Daily content schedule
- [ ] Weekly performance reports
- [ ] Community engagement
- [ ] Referral program
- [ ] Affiliate partnerships

## 📂 Project Structure

```
edgeforce/
├── apps/
│   └── web/                 # Next.js main app
│       ├── app/
│       │   ├── (auth)/      # Auth routes
│       │   ├── (dashboard)/ # User dashboard
│       │   ├── (marketing)/ # Public pages
│       │   ├── api/         # API routes
│       │   │   ├── picks/
│       │   │   ├── webhooks/
│       │   │   └── auth/
│       │   └── layout.tsx
│       ├── components/
│       │   ├── picks/       # Pick cards, tables
│       │   ├── dashboard/   # Charts, stats
│       │   └── ui/          # shadcn components
│       └── lib/
│           ├── ai/          # AI prediction logic
│           ├── discord/     # Discord bot
│           └── supabase/    # DB client
├── packages/
│   └── config/              # Shared configs
├── scripts/
│   ├── scrape-odds.ts       # Fetch betting lines
│   ├── scrape-injuries.ts   # Fetch injury reports
│   └── generate-picks.ts    # AI pick generation
└── data/
    └── historical/          # Historical game data
```

## 💡 Next Steps

1. **Branding:** Create logo and visual identity
2. **Landing Page:** Build waitlist page with value prop
3. **Database:** Set up Supabase and schema
4. **Discord:** Create server and bot
5. **First Pick:** Generate and post first AI pick

---

**Status:** Foundation complete ✅  
**Next:** Landing page + branding
