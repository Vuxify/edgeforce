# Sports Data API

Custom API for fetching sports games, odds, and team statistics.

## Status

**Current:** Mock data for proof-of-concept  
**Production:** Requires web scraping or paid API subscriptions

## Endpoints

### 1. Get Games

```bash
GET /api/sports/games?sport=NFL&date=2024-02-16
```

**Query Parameters:**
- `sport` (optional): Filter by sport (NFL, NBA, MLB, NHL)
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "games": [
    {
      "id": "nfl-chiefs-49ers",
      "sport": "NFL",
      "home_team": "Kansas City Chiefs",
      "away_team": "San Francisco 49ers",
      "game_time": "2024-02-16T20:00:00Z",
      "status": "scheduled"
    }
  ],
  "count": 1
}
```

### 2. Get Odds

```bash
GET /api/sports/odds?game_id=nfl-chiefs-49ers
```

**Query Parameters:**
- `game_id` (required): Game identifier

**Response:**
```json
{
  "success": true,
  "game_id": "nfl-chiefs-49ers",
  "odds": [
    {
      "bookmaker": "DraftKings",
      "spread": { "home": -3.5, "away": 3.5, "odds": -110 },
      "moneyline": { "home": -180, "away": +150 },
      "total": { "over": 47.5, "under": 47.5, "odds": -110 }
    }
  ],
  "consensus": {
    "spread": "-3.3",
    "total": "47.8",
    "bookmakers": 2
  }
}
```

### 3. Get Team Stats

```bash
GET /api/sports/stats?team_id=chiefs
```

**Query Parameters:**
- `team_id` (optional): Team identifier. If omitted, returns all teams.

**Response:**
```json
{
  "success": true,
  "stats": {
    "team_id": "chiefs",
    "team_name": "Kansas City Chiefs",
    "sport": "NFL",
    "wins": 12,
    "losses": 3,
    "win_rate": 0.80,
    "points_per_game": 28.5,
    "home_record": "7-1",
    "last_10": "8-2"
  }
}
```

## Data Sources

### Current (Mock)
- Hardcoded sample data
- 3 games across NFL/NBA/MLB
- 4 teams with realistic stats

### Production Options

#### Option A: Free (Web Scraping)
**Pros:** No cost  
**Cons:** Fragile, slower, rate limits

- **Games:** ESPN.com schedule pages
- **Stats:** Basketball-Reference.com, Pro-Football-Reference.com
- **Odds:** OddsPortal (historical), BetOnline archives

**Implementation:**
```javascript
import * as cheerio from 'cheerio'
import axios from 'axios'

async function scrapeESPN() {
  const html = await axios.get('https://www.espn.com/nfl/schedule')
  const $ = cheerio.load(html.data)
  // Parse games from HTML
}
```

#### Option B: Paid APIs
**Pros:** Reliable, fast, complete  
**Cons:** Monthly cost

1. **The Odds API** ($29-$99/month)
   - Real-time odds from 50+ bookmakers
   - 500-10,000 requests/month
   - https://the-odds-api.com/

2. **SportsDataIO** ($199+/month)
   - Comprehensive stats, scores, odds
   - Professional grade
   - https://sportsdata.io/

3. **SportRadar** ($500+/month)
   - Enterprise solution
   - Live data, player tracking
   - https://sportradar.com/

#### Option C: Hybrid (Recommended)
- Free scraping for stats (updated daily)
- The Odds API for live odds ($29/month)
- ESPN unofficial API for games (free)

## Implementation Roadmap

### Phase 1: Mock Data (DONE ✅)
- Static game/odds/stats responses
- API structure in place
- Testing endpoints ready

### Phase 2: Free Scraping (Week 1)
```bash
# Create scrapers
ml/scrapers/
├── espn_games.js      # Schedule scraping
├── basketball_ref.js  # NBA stats
├── football_ref.js    # NFL stats
└── odds_portal.js     # Historical odds
```

### Phase 3: Paid APIs (Week 2)
```bash
# Integrate The Odds API
npm install @the-odds-api/client
# Add API key to .env
THE_ODDS_API_KEY=your_key_here
```

### Phase 4: Caching (Week 3)
```bash
# Add Redis or in-memory cache
npm install ioredis
# Cache responses for 15 minutes
```

## Usage in ML Model

```typescript
// Fetch game data
const games = await fetch('/api/sports/games?sport=NFL').then(r => r.json())

// Get odds for prediction
const odds = await fetch(`/api/sports/odds?game_id=${game.id}`).then(r => r.json())

// Fetch team stats
const homeStats = await fetch(`/api/sports/stats?team_id=${game.home_team}`).then(r => r.json())
const awayStats = await fetch(`/api/sports/stats?team_id=${game.away_team}`).then(r => r.json())

// Generate prediction
const prediction = await fetch('/api/predict', {
  method: 'POST',
  body: JSON.stringify({
    sport: game.sport,
    home_team: game.home_team,
    away_team: game.away_team,
    home_stats: homeStats.stats,
    away_stats: awayStats.stats,
    odds: odds.consensus
  })
})
```

## Rate Limiting

**Current:** None (mock data)

**Production:**
- In-memory cache: 15-minute TTL
- Rate limit: 100 requests/minute per IP
- Scraping: 1 request/second to avoid blocks

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found
- `500` - Server error

## Testing

```bash
# Test games endpoint
curl http://localhost:3000/api/sports/games

# Test odds endpoint
curl http://localhost:3000/api/sports/odds?game_id=nfl-chiefs-49ers

# Test stats endpoint
curl http://localhost:3000/api/sports/stats?team_id=chiefs
```

## Next Steps

1. Choose data source strategy (free, paid, or hybrid)
2. Implement scrapers or integrate paid APIs
3. Add caching layer (Redis or in-memory)
4. Set up daily data refresh cron job
5. Monitor API health and data freshness
6. Implement rate limiting and error recovery

## Cost Estimate

**Free tier (scraping only):**
- $0/month
- Time investment: ~1 week to build scrapers
- Maintenance: ~2 hours/month

**Recommended tier:**
- The Odds API: $29/month
- Free scraping for stats
- Total: $29/month + 1 week setup

**Professional tier:**
- SportsDataIO: $199/month
- Everything included
- Fastest to production
