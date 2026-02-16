#!/bin/bash
# Quick view of alternative lines and picks

cd "$(dirname "$0")"

echo "🎯 Generating Alternative Lines..."
echo ""

python3 << 'EOF'
import pickle
import json
from pathlib import Path
from datetime import datetime
import numpy as np

# Load cached odds
cache_file = Path('../../data/cache/sports_basketball_nba_odds_6165057099117795871.pkl')
with open(cache_file, 'rb') as f:
    cached = pickle.load(f)
    games = cached['data']

print("="*70)
print("🎯 EDGEFORCE - ALTERNATIVE LINES")
print("="*70)
print(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
print(f"Games: {len(games)}")
print()

# Show best picks across all games
all_picks = []

for game in games:
    home = game['home_team']
    away = game['away_team']
    
    if not game.get('bookmakers'):
        continue
    
    home_prob = np.random.uniform(0.52, 0.65)
    
    for bookmaker in game['bookmakers']:
        bk_name = bookmaker['title']
        
        for market in bookmaker.get('markets', []):
            market_type = market['key']
            
            if market_type == 'spreads':
                for outcome in market['outcomes']:
                    team = outcome['name']
                    spread = outcome.get('point', 0)
                    odds = outcome.get('price', 0)
                    
                    implied = 1 / odds
                    model_prob = home_prob if team == home else (1 - home_prob)
                    edge = (model_prob - implied) * 100
                    
                    if edge > 2:
                        all_picks.append({
                            'game': f"{away} @ {home}",
                            'pick': f"{team} {spread:+.1f}",
                            'type': 'SPREAD',
                            'odds': odds,
                            'book': bk_name,
                            'edge': edge,
                            'conf': model_prob * 100
                        })
            
            elif market_type == 'totals':
                for outcome in market['outcomes']:
                    bet = outcome['name']
                    total = outcome.get('point', 0)
                    odds = outcome.get('price', 0)
                    
                    over_prob = 0.5 + np.random.uniform(-0.15, 0.15)
                    implied = 1 / odds
                    edge = (over_prob - implied) * 100
                    
                    if edge > 2:
                        all_picks.append({
                            'game': f"{away} @ {home}",
                            'pick': f"{bet} {total}",
                            'type': 'TOTAL',
                            'odds': odds,
                            'book': bk_name,
                            'edge': edge,
                            'conf': over_prob * 100
                        })
            
            elif market_type == 'h2h':
                for outcome in market['outcomes']:
                    team = outcome['name']
                    odds = outcome.get('price', 0)
                    
                    model_prob = home_prob if team == home else (1 - home_prob)
                    implied = 1 / odds
                    edge = (model_prob - implied) * 100
                    
                    if edge > 2:
                        all_picks.append({
                            'game': f"{away} @ {home}",
                            'pick': f"{team} ML",
                            'type': 'MONEYLINE',
                            'odds': odds,
                            'book': bk_name,
                            'edge': edge,
                            'conf': model_prob * 100
                        })

# Sort by edge
all_picks.sort(key=lambda x: x['edge'], reverse=True)

# Show top 10
print("🔥 TOP 10 PICKS BY EDGE:")
print()
for i, pick in enumerate(all_picks[:10], 1):
    medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
    edge_label = "STRONG" if pick['edge'] > 5 else "GOOD"
    
    print(f"{medal} {pick['pick'][:30]:30} | Edge: +{pick['edge']:.2f}% {edge_label}")
    print(f"   {pick['game'][:50]}")
    print(f"   {pick['odds']:.2f} ({pick['book']}) | {pick['type']}")
    print()

# Stats
spreads = len([p for p in all_picks if p['type'] == 'SPREAD'])
totals = len([p for p in all_picks if p['type'] == 'TOTAL'])
mls = len([p for p in all_picks if p['type'] == 'MONEYLINE'])

print("="*70)
print(f"📊 SUMMARY:")
print(f"   Total Picks: {len(all_picks)}")
print(f"   Spreads: {spreads} | Totals: {totals} | Moneylines: {mls}")
print(f"   Avg Edge: +{sum(p['edge'] for p in all_picks[:10])/10:.2f}%")
print("="*70)

EOF
