# Historical Odds Workaround (Free Tier)

## Problem
The Odds API free tier (500 credits/month) does **NOT** include historical odds access. Historical data requires paid tiers ($30+/month).

## Solution
We build our own historical odds database by fetching and storing current odds regularly.

## Implementation

### 1. Store Current Odds (`store_odds.py`)
- Fetches current odds from The Odds API
- Stores to local JSON files with timestamp
- Tracks all markets: h2h (moneyline), spreads, totals
- Uses only 3 bookmakers to save credits (FanDuel, DraftKings, Caesars)

**Usage:**
```bash
cd ~/projects/edgeforce/ml/scripts
source ~/.edgeforce-odds-api.env
python3 store_odds.py basketball_nba
```

**Cost:** 4-5 credits per fetch (~400 games total)

### 2. Recommended Schedule

Run the odds fetcher 2-3x per day to capture line movement:

```bash
# Opening lines (when games announced)
6:00 AM - Fetch today's + next 7 days games

# Mid-day update (track movement)
2:00 PM - Fetch again, see how lines moved

# Closing lines (before games start)
10:00 PM - Final fetch before most games tip off
```

**Daily cost:** 12-15 credits (sustainable on free tier)

### 3. Data Storage Structure

```
data/odds/
├── basketball_nba/
│   ├── basketball_nba_20260216_060000.json  (opening lines)
│   ├── basketball_nba_20260216_140000.json  (mid-day)
│   └── basketball_nba_20260216_220000.json  (closing lines)
└── americanfootball_nfl/
    └── (same structure for NFL season)
```

Each JSON file contains:
- Timestamp of fetch
- Sport and number of games
- Full odds data for all games
- Multiple bookmakers per game
- All markets (moneyline, spreads, totals)

**Example data:**
```json
{
  "fetched_at": "2026-02-16T14:45:00",
  "sport": "basketball_nba",
  "num_games": 10,
  "games": [
    {
      "id": "abc123",
      "commence_time": "2026-02-20T00:00:00Z",
      "home_team": "Washington Wizards",
      "away_team": "Indiana Pacers",
      "bookmakers": [
        {
          "key": "draftkings",
          "title": "DraftKings",
          "markets": [
            {
              "key": "h2h",
              "outcomes": [
                {"name": "Indiana Pacers", "price": 1.7},
                {"name": "Washington Wizards", "price": 2.2}
              ]
            },
            {
              "key": "spreads",
              "outcomes": [
                {"name": "Indiana Pacers", "point": -3.5, "price": 1.91},
                {"name": "Washington Wizards", "point": 3.5, "price": 1.91}
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. CLV (Closing Line Value) Tracking

With our historical database, we can calculate CLV:

**Process:**
1. Fetch opening line when game announced (e.g., Monday for Thursday game)
2. Model makes prediction on Tuesday
3. Fetch closing line 1 hour before game (Thursday 6 PM)
4. Compare our pick to closing line

**Formula:**
```python
CLV = (Closing Line for our pick) - (Opening Line for our pick)

If we picked Indiana -3.5:
- Opening: Indiana -3.5 @ -110
- Closing: Indiana -4.5 @ -110
- CLV = -4.5 - (-3.5) = -1.0 point (GOOD! We got better value)
```

**Good CLV:** Positive (we got better odds than closing)  
**Bad CLV:** Negative (market moved against us)

### 5. Automation with Cron

Set up automated fetching during NFL/NBA seasons:

```bash
# Add to crontab (macOS)
# Fetch odds 3x daily during seasons
0 6 * * * cd ~/projects/edgeforce/ml/scripts && source ~/.edgeforce-odds-api.env && python3 store_odds.py basketball_nba
0 14 * * * cd ~/projects/edgeforce/ml/scripts && source ~/.edgeforce-odds-api.env && python3 store_odds.py basketball_nba
0 22 * * * cd ~/projects/edgeforce/ml/scripts && source ~/.edgeforce-odds-api.env && python3 store_odds.py basketball_nba
```

**Cost per day:** ~15 credits  
**Monthly cost:** ~450 credits (within 500 limit)

### 6. Benefits of Our Approach

✅ **Free:** No need to upgrade to paid tier  
✅ **Complete Control:** We own the data  
✅ **Customizable:** Store exactly what we need  
✅ **No Limits:** Can query local data as much as we want  
✅ **Line Movement:** Track how lines move over time  
✅ **CLV Tracking:** Validate model performance vs market  

### 7. Storage Requirements

**Per fetch:** ~30 KB (10 NBA games with 3 bookmakers)  
**Per day:** ~90 KB (3 fetches)  
**Per month:** ~2.7 MB  
**Per year:** ~32 MB

**Negligible storage cost!**

---

## Status

✅ **Script Created:** `store_odds.py`  
✅ **First Fetch:** 10 NBA games stored (4 credits used)  
✅ **Credits Remaining:** 495 / 500 (99%)  
✅ **File Size:** 29.4 KB per fetch  

**Ready for automated collection during NFL/NBA seasons!**
