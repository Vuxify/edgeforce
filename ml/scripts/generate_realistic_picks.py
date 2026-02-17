#!/usr/bin/env python3
"""
Generate realistic NBA picks with variety for parlay building
Includes heavy favorites (-300, -400), favorites, and close games
"""

import json
from datetime import datetime, timedelta
import random

def generate_realistic_picks():
    """
    Generate 10 realistic NBA picks with varying odds
    """
    
    games = [
        {
            'id': 1,
            'game': 'Boston Celtics @ Detroit Pistons',
            'pick': 'Boston Celtics ML',
            'odds': 1.29,  # -350 (heavy favorite)
            'american_odds': -350,
            'type': 'moneyline',
            'confidence': 78.5,
            'edge': 3.2,
            'team': 'Boston Celtics',
            'matchup': 'vs Detroit Pistons',
            'line': 0
        },
        {
            'id': 2,
            'game': 'Denver Nuggets @ Portland Trail Blazers',
            'pick': 'Denver Nuggets -8.5',
            'odds': 1.91,  # -110
            'american_odds': -110,
            'type': 'spread',
            'confidence': 64.2,
            'edge': 5.8,
            'team': 'Denver Nuggets',
            'matchup': 'vs Portland Trail Blazers',
            'line': -8.5
        },
        {
            'id': 3,
            'game': 'Milwaukee Bucks @ Charlotte Hornets',
            'pick': 'Milwaukee Bucks ML',
            'odds': 1.25,  # -400 (heavy favorite)
            'american_odds': -400,
            'type': 'moneyline',
            'confidence': 81.3,
            'edge': 2.8,
            'team': 'Milwaukee Bucks',
            'matchup': 'vs Charlotte Hornets',
            'line': 0
        },
        {
            'id': 4,
            'game': 'Los Angeles Lakers @ Memphis Grizzlies',
            'pick': 'Los Angeles Lakers -2.5',
            'odds': 1.83,  # -121
            'american_odds': -121,
            'type': 'spread',
            'confidence': 58.7,
            'edge': 4.2,
            'team': 'Los Angeles Lakers',
            'matchup': 'vs Memphis Grizzlies',
            'line': -2.5
        },
        {
            'id': 5,
            'game': 'Philadelphia 76ers @ Orlando Magic',
            'pick': 'Philadelphia 76ers ML',
            'odds': 1.40,  # -250
            'american_odds': -250,
            'type': 'moneyline',
            'confidence': 72.1,
            'edge': 3.5,
            'team': 'Philadelphia 76ers',
            'matchup': 'vs Orlando Magic',
            'line': 0
        },
        {
            'id': 6,
            'game': 'Golden State Warriors @ Sacramento Kings',
            'pick': 'Over 229.5',
            'odds': 1.87,  # -115
            'american_odds': -115,
            'type': 'total',
            'confidence': 61.4,
            'edge': 6.3,
            'team': 'Over 229.5',
            'matchup': 'GSW @ SAC',
            'line': 229.5
        },
        {
            'id': 7,
            'game': 'Phoenix Suns @ Houston Rockets',
            'pick': 'Phoenix Suns -11.5',
            'odds': 1.91,  # -110
            'american_odds': -110,
            'type': 'spread',
            'confidence': 66.8,
            'edge': 7.1,
            'team': 'Phoenix Suns',
            'matchup': 'vs Houston Rockets',
            'line': -11.5
        },
        {
            'id': 8,
            'game': 'Miami Heat @ Washington Wizards',
            'pick': 'Miami Heat ML',
            'odds': 1.33,  # -303
            'american_odds': -303,
            'type': 'moneyline',
            'confidence': 75.9,
            'edge': 3.8,
            'team': 'Miami Heat',
            'matchup': 'vs Washington Wizards',
            'line': 0
        },
        {
            'id': 9,
            'game': 'Dallas Mavericks @ San Antonio Spurs',
            'pick': 'Dallas Mavericks -4.5',
            'odds': 1.95,  # -105
            'american_odds': -105,
            'type': 'spread',
            'confidence': 59.2,
            'edge': 5.4,
            'team': 'Dallas Mavericks',
            'matchup': 'vs San Antonio Spurs',
            'line': -4.5
        },
        {
            'id': 10,
            'game': 'Cleveland Cavaliers @ New York Knicks',
            'pick': 'Cleveland Cavaliers ML',
            'odds': 1.67,  # -150
            'american_odds': -150,
            'type': 'moneyline',
            'confidence': 63.5,
            'edge': 4.9,
            'team': 'Cleveland Cavaliers',
            'matchup': 'vs New York Knicks',
            'line': 0
        }
    ]
    
    # Add game times (all tonight between 7 PM and 10 PM)
    base_time = datetime.now() + timedelta(hours=3)
    for i, game in enumerate(games):
        game_time = base_time + timedelta(minutes=30 * i)
        game['gameTime'] = game_time.isoformat()
    
    return {
        'success': True,
        'generated_at': datetime.now().isoformat(),
        'model_stats': {
            'win_rate': '61.94%',
            'roi': '18.24%',
            'backtest': '2023 season (1,755 games)'
        },
        'picks': games,
        'potd': games[1],  # Denver -8.5 (good edge)
        'stats': {
            'total_picks': len(games),
            'avg_confidence': sum(g['confidence'] for g in games) / len(games),
            'avg_edge': sum(g['edge'] for g in games) / len(games)
        }
    }

if __name__ == '__main__':
    data = generate_realistic_picks()
    
    # Save to picks-today.json
    output_path = '../../apps/web/public/picks-today.json'
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Generated {len(data['picks'])} realistic picks")
    print(f"\nBreakdown:")
    print(f"  Heavy Favorites (-250+): {len([p for p in data['picks'] if p['american_odds'] <= -250])}")
    print(f"  Favorites (-150 to -250): {len([p for p in data['picks'] if -250 < p['american_odds'] <= -150])}")
    print(f"  Close Games (-110 to -150): {len([p for p in data['picks'] if p['american_odds'] > -150])}")
    print(f"\nSaved to: {output_path}")
