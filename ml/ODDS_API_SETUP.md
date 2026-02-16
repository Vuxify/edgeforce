# The Odds API Configuration

**Account Email:** vuxchess@gmail.com  
**Plan:** FREE (500 credits/month)  
**API Key:** ✅ CONFIGURED (stored in ~/.edgeforce-odds-api.env)

## ✅ Setup Complete!

API tested successfully on 2026-02-16:
- Credits used: 1 / 500
- Requests made: 5
- NBA games found: 10 (active season)
- NFL games found: 0 (off-season)
- Caching: Working ✅
- Rate limiting: Working ✅

## Usage

Load API key:
```bash
source ~/.edgeforce-odds-api.env
```

Test API:
```bash
cd ~/projects/edgeforce/ml/scripts
python3 odds_api.py
```

## Usage Limits (Free Tier)

- **Monthly Credits:** 500
- **Conservative Daily Limit:** 15 credits (to ensure we don't run out)
- **Cache Duration:** 30 minutes (odds don't change that fast)
- **❌ NO Historical Data** - Free tier only has current/live odds
- **✅ Workaround:** We'll store odds ourselves to build historical database

## Credit Costs

| Endpoint | Credits | Notes |
|----------|---------|-------|
| Get Sports List | 1-2 | Only call once per day |
| Get Odds (2 bookmakers) | 3-5 | Minimal, for key games |
| Get Odds (all bookmakers) | 8-10 | Expensive, use sparingly |
| Historical Odds | ❌ NOT AVAILABLE | Paid tiers only ($30+/month) |

## Smart Usage Strategy

### Development Phase (Now)
- Test with 2-3 API calls total
- Verify NFL odds are available
- Cache aggressively (30 min)
- **Budget: 10 credits** for initial testing

### Production Phase (After Launch)
- Fetch odds once per day at 6 AM
- Only for games we're actually predicting
- Use 2-3 bookmakers max (FanDuel, DraftKings, Caesars)
- **Budget: 5-10 credits/day** = 150-300 credits/month

### Emergency Buffer
- Keep 50-100 credits unused
- For unexpected API needs
- For re-fetching if data issues

## API Wrapper Features

✅ **Smart Caching** - Stores responses for 30 minutes  
✅ **Rate Limiting** - Max 15 credits/day (configurable)  
✅ **Usage Tracking** - Logs every request  
✅ **Credit Monitoring** - Shows remaining credits  
✅ **Fallback Mode** - Returns None if quota exceeded  
✅ **Batch Efficiency** - Fetches multiple games in one call  

## Testing the API

Once you have the key, run:

```bash
cd ~/projects/edgeforce/ml/scripts
export ODDS_API_KEY='your_api_key_here'
python3 odds_api.py
```

This will:
1. Fetch sports list (~2 credits)
2. Fetch NFL odds for 2 bookmakers (~3 credits)
3. Show usage statistics
4. Cache responses for reuse

**Total test cost: ~5 credits**

## Integration with EdgeForce

Once tested, the API key will be used for:

1. **Daily Predictions** (6 AM)
   - Fetch current lines for today's games
   - Compare to model predictions
   - Calculate edge
   - Only bet when edge > 2%

2. **CLV Tracking** (Build Our Own Historical Data)
   - **Opening Lines:** Fetch odds when games announced (3-7 days before)
   - **Store Locally:** Save to database with timestamp
   - **Closing Lines:** Fetch again 1 hour before game starts
   - **Calculate CLV:** Compare our pick to closing line
   - **Track Performance:** Did we beat the closing line?

3. **Line Movement Tracking** (Optional)
   - Fetch odds 2-3x per day
   - Track line movement over time
   - Identify steam moves (sharp money)
   - Store in local database

### Building Historical Odds Database

Since free tier has no historical access, we store odds ourselves:

```python
# Pseudo-code for daily odds collection
Every day at 6 AM, 2 PM, 10 PM:
  1. Fetch current odds for games in next 7 days
  2. Store in database: game_id, bookmaker, line, timestamp
  3. Track changes over time
  4. Build historical line movement database
```

**Storage Cost:** Minimal (~1MB per month of odds data)

## Security

- API key stored in environment variable only
- Never committed to git
- Accessed only by odds_api.py
- Logs don't include API key

---

**Status:** ⏳ Awaiting API key from signup
