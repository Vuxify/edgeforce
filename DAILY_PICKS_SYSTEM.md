# EdgeForce Daily Picks System

## ✅ What You Have Now

### 1. **Pick of the Day Generator** (`ml/scripts/daily_picks.py`)

Shows top betting picks with confidence and edge:

```bash
cd ~/projects/edgeforce/ml/scripts
source ~/.edgeforce-odds-api.env
python3 daily_picks.py basketball_nba
```

**Output:**
```
🥇 PICK #1
------------------------------------------------------------
Game:       Brooklyn Nets @ Cleveland Cavaliers
Time:       Fri Feb 20, 12:10 AM
Pick:       Cleveland Cavaliers -13.5
Odds:       1.89 (FanDuel)
Confidence: 60.9%
Edge:       +8.01% ✅ STRONG

⭐ PICK OF THE DAY ⭐
🎯 Cleveland Cavaliers -13.5
📊 Brooklyn Nets @ Cleveland Cavaliers
💪 Confidence: 60.9%
📈 Edge: +8.01%
⏰ Game Time: Fri Feb 20, 12:10 AM
```

### 2. **Features**

✅ **Top 5 Picks** - Ranked by edge (highest first)  
✅ **Pick of the Day** - Highest edge pick highlighted  
✅ **Confidence Scores** - Model's certainty (0-100%)  
✅ **Edge Calculation** - Model probability vs implied odds  
✅ **Smart Filtering** - Only shows picks with edge > 2%  
✅ **Beautiful Output** - Medals (🥇🥈🥉), emojis, formatted

### 3. **Edge Thresholds**

| Edge | Label | Action |
|------|-------|--------|
| < 2% | Skip | Don't bet (no edge) |
| 2-5% | ✅ GOOD | Decent bet |
| > 5% | ✅ STRONG | Excellent bet |

### 4. **What's Included**

- **Game info:** Teams, matchup, game time
- **Pick:** Team and line (e.g., Cavaliers -13.5)
- **Odds:** Decimal format with bookmaker
- **Confidence:** How sure the model is
- **Edge:** Advantage over the betting market

---

## 🚧 Current Status: DEMO MODE

**Using MOCK predictions** - Random confidence scores for demo

### Why Mock?
The real prediction system needs:
1. **Team stats database** - Recent performance, season stats
2. **Feature calculation** - Rolling averages, Elo ratings, rest days
3. **Real-time data** - Fetch stats for today's games
4. **Model integration** - Pass features through trained ensemble

### Demo vs Production

| Component | Demo (Now) | Production (Next) |
|-----------|------------|-------------------|
| Predictions | Random (50-68%) | Real ensemble (59%+ win rate) |
| Features | Mock | 28-40 calculated features |
| Team Stats | N/A | Load from database |
| Confidence | Random | Based on model certainty |
| Edge | Calculated correctly | Same (already correct) |

---

## 🔨 Making It Real (Next Steps)

### Phase 1: Feature Engineering (1-2 days)

Build the missing piece that connects games to predictions:

**1. Team Stats Database**
```python
# Store recent team performance
teams_stats = {
    'Cleveland Cavaliers': {
        'ppg_L5': 118.2,
        'def_L5': 105.8,
        'win_rate_L10': 0.800,
        'elo': 1620,
        'rest_days': 2
    }
}
```

**2. Feature Calculation**
```python
def calculate_features(home_team, away_team, game_date):
    """
    Calculate all 28 NFL features or 40 NBA features
    Returns: feature vector ready for model
    """
    features = {
        'home_ppg_L5': get_recent_ppg(home_team, 5),
        'away_ppg_L5': get_recent_ppg(away_team, 5),
        'home_elo': get_elo(home_team),
        'away_elo': get_elo(away_team),
        'elo_diff': home_elo - away_elo,
        'rest_advantage': home_rest - away_rest,
        # ... 22-34 more features
    }
    return features
```

**3. Real Model Predictions**
```python
def predict_game(features):
    """Use trained ensemble to predict"""
    # Load models (already done)
    xgb_pred = xgboost_model.predict_proba(features)
    lgb_pred = lightgbm_model.predict_proba(features)
    rf_pred = random_forest_model.predict_proba(features)
    lr_pred = logistic_model.predict_proba(features)
    
    # Ensemble average
    ensemble = (xgb_pred + lgb_pred + rf_pred + lr_pred) / 4
    
    return ensemble[1]  # Probability of home win
```

### Phase 2: Data Integration (1 day)

**Option A: Use Existing Historical Data**
- We have 1,088 NFL games + 6,907 NBA games
- Calculate season-long averages
- Use as baseline stats

**Option B: Scrape Current Stats**
- ESPN API for recent games
- Basketball-Reference for season stats
- Update daily with latest results

**Option C: Hybrid (Recommended)**
- Use historical data as baseline
- Add recent game results manually
- Full automation later

### Phase 3: Production Launch (1 day)

1. **Test with real NBA predictions** (season in progress)
2. **Post free picks to Discord** (prove model works)
3. **Track performance** (CLV, win rate, ROI)
4. **Build audience** before NFL season starts

---

## 📊 Example: Real Prediction Flow

### Current (Demo)
```
Game: Pacers @ Wizards
↓
Mock prediction: 62% home win
↓
Calculate edge vs odds
↓
Show pick if edge > 2%
```

### Production (Next)
```
Game: Pacers @ Wizards
↓
Fetch recent stats (last 10 games)
↓
Calculate features:
  - Wizards PPG L5: 108.2
  - Pacers DEF L5: 112.4
  - Elo ratings: 1580 vs 1520
  - Rest: 1 day vs 2 days
  - ... 36 more features
↓
Pass to ensemble models:
  - XGBoost: 58% home win
  - LightGBM: 60% home win
  - Random Forest: 62% home win
  - Logistic: 56% home win
  - Average: 59% home win
↓
Calculate edge: 59% - 51.3% (implied) = +7.7% STRONG
↓
Show pick: Wizards ML @ 1.95
```

---

## 🎯 Quick Start Guide

### To See Picks Right Now (Demo)

```bash
cd ~/projects/edgeforce/ml/scripts
source ~/.edgeforce-odds-api.env
python3 daily_picks.py basketball_nba
```

### To Make It Real

**Option 1: NBA Season (Now)**
- Fix NBA model (remove in-game stats)
- Add real feature engineering
- Start posting free picks
- Prove system works

**Option 2: Wait for NFL (September)**
- NFL model already proven (59% win rate)
- Build feature pipeline during off-season
- Launch when NFL season starts
- Less work, more confidence

**Option 3: Build Infrastructure**
- Focus on automation
- Discord bot integration
- Admin dashboard
- Performance tracking

---

## 💰 Revenue Impact

### With Real Predictions

**Free Tier (Audience Building)**
- Post 2 picks/day publicly
- Track performance transparently
- Build credibility and followers

**Paid Tiers (After Proving Model)**
- Free: 1 pick/day
- Pro $29/mo: 5-10 picks/day
- Elite $99/mo: Unlimited + early access

**At 300 paid users:**
- 250 Pro @ $29 = $7,250/month
- 50 Elite @ $99 = $4,950/month
- **Total: $12,200/month MRR**

---

## 🏆 Current Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| ML Models Trained | ✅ | 59% win rate on NFL |
| Odds API Integration | ✅ | 495 credits remaining |
| Daily Picks Generator | ✅ | UI complete, demo mode |
| Edge Calculation | ✅ | Working correctly |
| Confidence Scores | 🚧 | Mock (needs real features) |
| Feature Engineering | ❌ | Not built yet |
| Team Stats Database | ❌ | Not built yet |
| Discord Bot | ✅ | Built, needs integration |
| Admin Dashboard | ✅ | Deployed, needs picks API |

**Next Bottleneck:** Feature engineering pipeline  
**Estimated Time to Production:** 2-4 days with real features  
**Alternative:** Launch with NFL only (September) = fully ready

---

## 📝 Your Options

**A. Make NBA Real (2-4 days)**
- Build feature engineering
- Fix NBA model
- Launch with real picks
- Start building audience

**B. Wait for NFL (September)**
- NFL model proven (59% WR)
- More credibility
- Less urgent work
- Focus on marketing

**C. Hybrid**
- Post mock NBA picks "for entertainment"
- Build audience
- Fix for real later
- Launch NFL in September

**What do you want to focus on?** 🚀
