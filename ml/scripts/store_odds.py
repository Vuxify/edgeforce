#!/usr/bin/env python3
"""
Store Odds Locally - Build Historical Database
Since free tier has no historical data, we fetch and store current odds regularly
"""

import os
import json
from datetime import datetime
from pathlib import Path
from odds_api import OddsAPIClient

def store_odds(sport='americanfootball_nfl', output_dir='../../data/odds'):
    """
    Fetch current odds and store with timestamp
    Call this 2-3x per day to track line movement
    """
    
    # Initialize API client
    api_key = os.environ.get('ODDS_API_KEY')
    if not api_key:
        print("❌ ODDS_API_KEY not set")
        return
    
    client = OddsAPIClient(api_key)
    
    # Create output directory
    output_path = Path(__file__).parent / output_dir / sport
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📊 Fetching {sport} odds...")
    
    # Fetch odds (conservative - only 3 major bookmakers)
    odds = client.get_odds(
        sport=sport,
        regions='us',
        markets='h2h,spreads,totals',  # Get all major markets
        bookmakers='fanduel,draftkings,caesars'  # Top 3 books
    )
    
    if not odds:
        print("❌ Failed to fetch odds or quota exceeded")
        return
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{sport}_{timestamp}.json"
    filepath = output_path / filename
    
    # Store odds with metadata
    data = {
        'fetched_at': datetime.now().isoformat(),
        'sport': sport,
        'num_games': len(odds),
        'games': odds
    }
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Stored {len(odds)} games to {filepath}")
    print(f"   File size: {filepath.stat().st_size / 1024:.1f} KB")
    
    # Print summary
    if len(odds) > 0:
        print(f"\n📋 Sample games:")
        for i, game in enumerate(odds[:3]):
            commence = datetime.fromisoformat(game['commence_time'].replace('Z', '+00:00'))
            print(f"   {i+1}. {game['away_team']} @ {game['home_team']}")
            print(f"      Starts: {commence.strftime('%b %d, %I:%M %p')}")
            print(f"      Bookmakers: {len(game.get('bookmakers', []))}")
    
    # Show usage
    print()
    client.print_usage()
    
    return filepath


def get_historical_odds(sport='americanfootball_nfl', days=7):
    """
    Load historical odds from local storage
    """
    odds_dir = Path(__file__).parent / '../../data/odds' / sport
    
    if not odds_dir.exists():
        print(f"❌ No historical odds found for {sport}")
        return []
    
    # Load all JSON files
    files = sorted(odds_dir.glob('*.json'))
    
    if not files:
        print(f"❌ No odds files found in {odds_dir}")
        return []
    
    print(f"\n📚 Found {len(files)} historical odds files for {sport}")
    
    historical = []
    for filepath in files[-days:]:  # Last N days
        with open(filepath, 'r') as f:
            data = json.load(f)
            historical.append({
                'filepath': str(filepath),
                'fetched_at': data['fetched_at'],
                'num_games': data['num_games'],
                'games': data['games']
            })
    
    return historical


def track_line_movement(game_id, historical_odds):
    """
    Track how a specific game's lines moved over time
    """
    movements = []
    
    for snapshot in historical_odds:
        game = next((g for g in snapshot['games'] if g['id'] == game_id), None)
        if game:
            movements.append({
                'timestamp': snapshot['fetched_at'],
                'bookmakers': game.get('bookmakers', [])
            })
    
    return movements


def calculate_clv(opening_line, closing_line, pick_side):
    """
    Calculate Closing Line Value (CLV)
    
    CLV = (Closing Line for our pick) - (Opening Line for our pick)
    
    Positive CLV = We got better odds than closing (GOOD!)
    Negative CLV = We got worse odds than closing (BAD!)
    """
    if pick_side == 'home':
        clv = closing_line - opening_line
    else:  # away
        clv = opening_line - closing_line
    
    return clv


if __name__ == '__main__':
    import sys
    
    # Check for API key
    if not os.environ.get('ODDS_API_KEY'):
        print("❌ Set ODDS_API_KEY environment variable")
        print("   source ~/.edgeforce-odds-api.env")
        sys.exit(1)
    
    # Determine sport from command line or default to NFL
    sport = sys.argv[1] if len(sys.argv) > 1 else 'basketball_nba'
    
    # Store current odds
    print("="*60)
    print("STORING CURRENT ODDS FOR HISTORICAL TRACKING")
    print("="*60)
    
    filepath = store_odds(sport=sport)
    
    if filepath:
        print(f"\n✅ Success! Odds stored to {filepath}")
        print("\n💡 Tips:")
        print("   - Run this 2-3x per day to track line movement")
        print("   - Opening lines: Run when games announced")
        print("   - Closing lines: Run 1 hour before game starts")
        print("   - Build cron job: Daily at 6 AM, 2 PM, 10 PM")
        
        print("\n📊 View historical odds:")
        print(f"   ls -lh ~/projects/edgeforce/data/odds/{sport}/")
