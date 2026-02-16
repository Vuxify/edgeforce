# EdgeForce Database Schema

## Setup Instructions

1. Go to https://supabase.com and create a new project
2. Name: `edgeforce`
3. Database password: (save securely)
4. Region: Choose closest to you
5. Copy connection string

## SQL Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Picks table
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL CHECK (sport IN ('NFL', 'NBA', 'MLB', 'NHL')),
  game TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  pick TEXT NOT NULL,
  pick_type TEXT CHECK (pick_type IN ('spread', 'moneyline', 'over_under')),
  odds DECIMAL NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  reasoning TEXT,
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'loss', 'push')),
  posted_at TIMESTAMP DEFAULT NOW(),
  game_time TIMESTAMP NOT NULL,
  tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'pro', 'elite'))
);

-- User picks (tracking)
CREATE TABLE user_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pick_id UUID REFERENCES picks(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, pick_id)
);

-- Performance tracking
CREATE TABLE performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pushes INTEGER DEFAULT 0,
  roi DECIMAL DEFAULT 0.0,
  units_won DECIMAL DEFAULT 0.0,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_picks_sport ON picks(sport);
CREATE INDEX idx_picks_game_time ON picks(game_time);
CREATE INDEX idx_picks_result ON picks(result);
CREATE INDEX idx_user_picks_user_id ON user_picks(user_id);
CREATE INDEX idx_user_picks_pick_id ON user_picks(pick_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_picks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Everyone can view picks (based on tier)
CREATE POLICY "Everyone can view picks" ON picks
  FOR SELECT USING (true);

-- Users can track their own picks
CREATE POLICY "Users can track picks" ON user_picks
  FOR ALL USING (auth.uid() = user_id);

-- Insert trigger to update users.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add to `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for direct connections if needed)
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

## Test Data (Development Only)

```sql
-- Insert sample picks
INSERT INTO picks (sport, game, home_team, away_team, pick, pick_type, odds, confidence, reasoning, game_time, tier_required)
VALUES
  ('NFL', 'Chiefs vs 49ers', 'Chiefs', '49ers', 'Chiefs -3.5', 'spread', -110, 75, 'Chiefs have home field advantage and better defensive stats', NOW() + INTERVAL '2 hours', 'free'),
  ('NBA', 'Lakers vs Warriors', 'Lakers', 'Warriors', 'Over 225.5', 'over_under', -110, 68, 'Both teams averaging high scoring recently', NOW() + INTERVAL '4 hours', 'pro'),
  ('MLB', 'Yankees vs Red Sox', 'Yankees', 'Red Sox', 'Yankees ML', 'moneyline', -150, 82, 'Ace pitcher on mound, favorable matchup', NOW() + INTERVAL '6 hours', 'elite');

-- Insert sample performance
INSERT INTO performance (period, wins, losses, pushes, roi, units_won)
VALUES
  ('all_time', 421, 204, 15, 23.4, 142.5),
  ('monthly', 67, 32, 2, 18.2, 24.3),
  ('weekly', 14, 8, 1, 15.7, 5.2),
  ('daily', 3, 1, 0, 22.1, 1.8);
```

## Client Setup

```bash
cd apps/web
npm install @supabase/supabase-js
```

## Usage Example

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fetch today's picks
export async function getTodaysPicks() {
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .gte('game_time', new Date().toISOString())
    .order('confidence', { ascending: false })
  
  if (error) throw error
  return data
}
```

## Next Steps After Setup

1. Run SQL schema in Supabase SQL Editor
2. Copy connection strings to .env.local
3. Test connection with a simple query
4. Insert test data for development
5. Build API routes to interact with database
