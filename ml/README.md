# EdgeForce ML System

## Overview

Custom machine learning system for sports betting predictions using feature engineering and gradient boosting.

## Current Implementation

**Status:** Mock prediction engine (v0.1)
- Generates predictions based on team statistics
- Calculates confidence scores (30-95%)
- Provides reasoning for picks
- Supports NFL, NBA, MLB, NHL

**Production TODO:**
- Train real XGBoost/LightGBM models on historical data
- Implement proper feature engineering pipeline
- Add backtesting framework
- Integrate live odds data
- Build model retraining scheduler

## Architecture

```
┌─────────────────┐
│   Web App API   │ (/api/predict)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Python Model   │ (ml/scripts/predict.py)
│   (XGBoost)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Feature Store  │ (team stats, odds, injuries)
└─────────────────┘
```

## Usage

### Via API

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sport": "NFL",
    "home_team": "Chiefs",
    "away_team": "49ers",
    "home_stats": {"win_rate": 0.75, "ppg": 28.5},
    "away_stats": {"win_rate": 0.65, "ppg": 24.3}
  }'
```

### Direct Python

```bash
cd ml/scripts
python3 predict.py '{"sport":"NFL","home_team":"Chiefs","away_team":"49ers","home_stats":{"win_rate":0.75},"away_stats":{"win_rate":0.65}}'
```

## Model Features

### Current Features (v0.1)
- Team win rate
- Home/away advantage
- Rest days between games

### Planned Features (v1.0)
- **Team Performance:**
  - Points per game (offense/defense)
  - Yards per play
  - Turnover differential
  - Third down conversion %
  - Red zone efficiency

- **Situational:**
  - Back-to-back games
  - Travel distance
  - Divisional matchup
  - Season timing

- **Market:**
  - Opening vs current line
  - Line movement
  - Public betting %
  - Reverse line movement

- **Injuries:**
  - Key player availability
  - Lineup changes

## Confidence Scoring

Confidence ranges:
- **85-95%**: High confidence, strong edge
- **70-84%**: Good confidence, solid pick
- **55-69%**: Medium confidence, slight edge
- **30-54%**: Low confidence, avoid

Formula:
```python
base = 50
+ (win_rate - 0.5) * 40  # Performance bonus
+ 5 (if home team)        # Home advantage
+ 3 (if rest >= 3 days)   # Rest bonus
- 3 (if rest <= 1 day)    # Fatigue penalty
```

## Training Pipeline (TODO)

### 1. Data Collection
```bash
npm run collect-data -- --sport NFL --seasons 3
```

### 2. Feature Engineering
```bash
python3 scripts/build_features.py --input data/raw --output data/features
```

### 3. Model Training
```bash
python3 scripts/train.py --features data/features --output models/nfl_model.pkl
```

### 4. Backtesting
```bash
python3 scripts/backtest.py --model models/nfl_model.pkl --data data/test
```

### 5. Deployment
```bash
# Model automatically loaded by predict.py
cp models/nfl_model.pkl ml/models/production/
```

## Performance Targets

- **Win Rate:** >54% (break-even at -110 odds: 52.4%)
- **ROI:** >5% (excellent: >10%)
- **Calibration:** Predicted probability ≈ actual win rate
- **Sample Size:** 500+ picks minimum for evaluation

## Data Sources

### Current (Mock)
- Hardcoded team statistics
- Random seed for testing

### Production (Planned)
- **Games:** ESPN unofficial API, Basketball-Reference scraping
- **Odds:** The Odds API ($29/month) or scraping
- **Injuries:** RotoWire RSS, Twitter API
- **Stats:** Pro-Football-Reference, Basketball-Reference

## Model Monitoring

Track daily:
- Picks generated
- Average confidence
- Win rate (7/30 day rolling)
- ROI
- Calibration drift

## Retraining Schedule

- **Daily:** Update features with latest games
- **Weekly:** Retrain on last 3 seasons + current
- **Monthly:** Full evaluation and tuning
- **Quarterly:** Architecture review

## Files

- `scripts/predict.py` - Main prediction script (current)
- `scripts/train.py` - Model training (TODO)
- `scripts/collect_data.py` - Data collection (TODO)
- `scripts/build_features.py` - Feature engineering (TODO)
- `scripts/backtest.py` - Backtesting framework (TODO)
- `models/` - Trained model storage
- `data/` - Historical data storage

## Dependencies

### Python (Required)
```bash
pip install numpy pandas scikit-learn xgboost lightgbm
```

### Node.js (Already installed)
```bash
cd ml && npm install
```

## Next Steps

1. Collect 3+ seasons of historical NFL/NBA data
2. Build feature engineering pipeline
3. Train real XGBoost model
4. Backtest on historical data (target >54% win rate)
5. Deploy production model
6. Set up monitoring and retraining

## Notes

- Current implementation is a **proof of concept**
- Real ML model requires 10,000+ historical games for training
- Expect 1-2 weeks to build production-ready model
- Budget ~$30/month for data APIs (The Odds API)
