#!/usr/bin/env python3
"""
Generate NBA picks and output as JSON for API consumption
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from daily_picks import DailyPicksGenerator

def generate_json_picks(sport='basketball_nba'):
    """Generate picks and return as JSON"""
    
    # Check for API key
    if not os.environ.get('ODDS_API_KEY'):
        return {
            'success': False,
            'error': 'ODDS_API_KEY not set',
            'picks': [],
            'potd': None,
            'stats': {
                'total_picks': 0,
                'avg_confidence': 0,
                'avg_edge': 0
            }
        }
    
    try:
        # Generate picks
        generator = DailyPicksGenerator(sport=sport)
        picks_list = generator.generate_picks()
        
        if len(picks_list) == 0:
            return {
                'success': True,
                'generated_at': datetime.now().isoformat(),
                'message': 'No games with sufficient edge today',
                'picks': [],
                'potd': None,
                'stats': {
                    'total_picks': 0,
                    'avg_confidence': 0,
                    'avg_edge': 0
                }
            }
        
        # Filter picks with edge > 2%
        good_picks = [p for p in picks_list if p['edge'] > 2.0]
        
        if len(good_picks) == 0:
            return {
                'success': True,
                'generated_at': datetime.now().isoformat(),
                'message': 'No picks meet minimum edge threshold (2%)',
                'picks': [],
                'potd': None,
                'stats': {
                    'total_picks': 0,
                    'avg_confidence': 0,
                    'avg_edge': 0
                }
            }
        
        # Convert to API format
        api_picks = []
        for i, pick in enumerate(good_picks, 1):
            api_picks.append({
                'id': i,
                'rank': i,
                'isPotd': i == 1,
                'sport': 'NBA',
                'matchup': pick['matchup'],
                'pickTeam': pick['pick_team'],
                'pickLine': pick['pick_line'],
                'odds': pick['pick_odds'],
                'oddsFormat': 'decimal',
                'bookmaker': pick['bookmaker'],
                'confidence': round(pick['confidence'], 1),
                'edge': round(pick['edge'], 2),
                'gameTime': pick['commence_time'].isoformat(),
                'analysis': f"Model confidence: {pick['confidence']:.1f}%. Edge over market: {pick['edge']:.2f}%. Home win probability: {pick['home_win_prob']:.1f}%."
            })
        
        # Stats
        stats = {
            'total_picks': len(api_picks),
            'avg_confidence': sum(p['confidence'] for p in api_picks) / len(api_picks),
            'avg_edge': sum(p['edge'] for p in api_picks) / len(api_picks)
        }
        
        return {
            'success': True,
            'generated_at': datetime.now().isoformat(),
            'picks': api_picks,
            'potd': api_picks[0] if len(api_picks) > 0 else None,
            'stats': stats
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'picks': [],
            'potd': None,
            'stats': {
                'total_picks': 0,
                'avg_confidence': 0,
                'avg_edge': 0
            }
        }


if __name__ == '__main__':
    # Get sport from command line
    sport = sys.argv[1] if len(sys.argv) > 1 else 'basketball_nba'
    
    # Generate picks
    result = generate_json_picks(sport)
    
    # Output as JSON
    print(json.dumps(result, indent=2))
