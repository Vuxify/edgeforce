#!/usr/bin/env python3
"""
Daily Picks Generator - EdgeForce
Loads trained models, fetches odds, generates predictions with confidence
"""

import os
import sys
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
from odds_api import OddsAPIClient

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

class DailyPicksGenerator:
    def __init__(self, sport='americanfootball_nfl'):
        self.sport = sport
        self.model_dir = Path(__file__).parent / '../../data/models'
        self.models = {}
        self.metadata = {}
        
        # Load API client
        api_key = os.environ.get('ODDS_API_KEY')
        if not api_key:
            raise ValueError("ODDS_API_KEY not set")
        self.odds_client = OddsAPIClient(api_key)
        
    def load_models(self):
        """Load trained ensemble models"""
        sport_prefix = 'nfl' if 'nfl' in self.sport else 'nba'
        
        print(f"\n🧠 Loading {sport_prefix.upper()} models...")
        
        model_types = ['xgboost', 'lightgbm', 'random_forest', 'logistic']
        
        for model_type in model_types:
            model_file = self.model_dir / f"{sport_prefix}_{model_type}_model.pkl"
            
            if model_file.exists():
                with open(model_file, 'rb') as f:
                    self.models[model_type] = pickle.load(f)
                print(f"  ✓ Loaded {model_type}")
            else:
                print(f"  ✗ Missing {model_type}")
        
        # Load metadata
        metadata_file = self.model_dir / f"{sport_prefix}_ensemble_metadata.json"
        if metadata_file.exists():
            import json
            with open(metadata_file, 'r') as f:
                self.metadata = json.load(f)
            print(f"  ✓ Loaded metadata")
        
        if len(self.models) == 0:
            raise ValueError(f"No models found for {sport_prefix}")
        
        print(f"\n✅ Loaded {len(self.models)} models")
        return True
    
    def fetch_todays_games(self):
        """Fetch today's games with odds"""
        print(f"\n📊 Fetching today's {self.sport} games...")
        
        odds = self.odds_client.get_odds(
            sport=self.sport,
            regions='us',
            markets='h2h,spreads',
            bookmakers='fanduel,draftkings'  # Only 2 books to save credits
        )
        
        if not odds:
            print("⚠️  No games found or quota exceeded")
            return []
        
        print(f"✓ Found {len(odds)} games")
        return odds
    
    def extract_features_from_game(self, game):
        """
        Extract features from a game for prediction
        NOTE: This is simplified - real implementation would need:
        - Team stats from database
        - Recent performance
        - Elo ratings
        - Rest days, etc.
        
        For demo, we'll use mock features
        """
        # Mock features (in production, fetch from database)
        features = {
            'home_ppg_L5': 110.0,
            'home_def_L5': 105.0,
            'away_ppg_L5': 108.0,
            'away_def_L5': 107.0,
            'home_elo': 1500,
            'away_elo': 1480,
            'rest_advantage': 0
        }
        
        return features
    
    def predict_game(self, game_features):
        """
        Generate ensemble prediction
        Returns probability of home team winning
        
        NOTE: This is using MOCK predictions for demo!
        In production, this would:
        1. Load real team stats from database
        2. Calculate all 28-40 features
        3. Use trained ensemble models
        4. Return actual predictions
        """
        if len(self.models) == 0:
            raise ValueError("Models not loaded")
        
        # MOCK DEMO: Generate realistic predictions
        # Some games have edge, some don't (realistic)
        home_win_prob = np.random.choice([
            np.random.uniform(0.50, 0.58),  # Slight home advantage
            np.random.uniform(0.42, 0.48),  # Away advantage
            np.random.uniform(0.58, 0.68),  # Strong home advantage (edge)
        ])
        
        return home_win_prob
    
    def calculate_edge(self, model_prob, betting_odds):
        """
        Calculate edge: difference between model probability and implied odds
        
        Args:
            model_prob: Model's probability of outcome (0.0-1.0)
            betting_odds: Decimal odds (e.g., 1.91, 2.10) or American odds (-110, +150)
        
        Returns:
            edge: Percentage edge (positive = bet, negative = skip)
        """
        # Check if decimal or American odds
        if betting_odds > 0 and betting_odds < 50:
            # Decimal odds (e.g., 1.91, 2.10)
            implied_prob = 1 / betting_odds
        else:
            # American odds (e.g., -110, +150)
            if betting_odds < 0:
                implied_prob = abs(betting_odds) / (abs(betting_odds) + 100)
            else:
                implied_prob = 100 / (betting_odds + 100)
        
        # Edge = Model probability - Implied probability
        edge = model_prob - implied_prob
        
        return edge * 100  # Return as percentage
    
    def generate_picks(self):
        """Generate daily picks with confidence and edge"""
        print("\n" + "="*60)
        print("EDGEFORCE - DAILY PICKS GENERATOR")
        print("="*60)
        
        # Load models
        self.load_models()
        
        # Fetch games
        games = self.fetch_todays_games()
        
        if len(games) == 0:
            print("\n⚠️  No games available today")
            return []
        
        picks = []
        
        print(f"\n🎯 Analyzing {len(games)} games...\n")
        
        for game in games:
            # Extract game info
            home_team = game['home_team']
            away_team = game['away_team']
            commence_time = datetime.fromisoformat(game['commence_time'].replace('Z', '+00:00'))
            
            # Get betting lines (if available)
            if not game.get('bookmakers') or len(game['bookmakers']) == 0:
                continue
            
            bookmaker = game['bookmakers'][0]
            
            # Find spread market
            spread_market = None
            h2h_market = None
            
            for market in bookmaker.get('markets', []):
                if market['key'] == 'spreads':
                    spread_market = market
                elif market['key'] == 'h2h':
                    h2h_market = market
            
            if not spread_market:
                continue
            
            # Get home team spread
            home_spread = None
            home_odds = None
            
            for outcome in spread_market['outcomes']:
                if outcome['name'] == home_team:
                    home_spread = outcome.get('point')
                    home_odds = outcome.get('price')
            
            if home_spread is None:
                continue
            
            # Extract features (mock for now)
            features = self.extract_features_from_game(game)
            
            # Generate prediction
            home_win_prob = self.predict_game(features)
            
            # Calculate edge
            edge = self.calculate_edge(home_win_prob, home_odds)
            
            # Determine pick
            if home_win_prob > 0.55:
                pick_team = home_team
                pick_line = home_spread
                confidence = home_win_prob
            else:
                pick_team = away_team
                pick_line = -home_spread if home_spread else None
                confidence = 1 - home_win_prob
            
            # Store pick
            pick = {
                'game_id': game['id'],
                'matchup': f"{away_team} @ {home_team}",
                'commence_time': commence_time,
                'pick_team': pick_team,
                'pick_line': pick_line,
                'pick_odds': home_odds,
                'confidence': confidence * 100,  # As percentage
                'edge': edge,
                'bookmaker': bookmaker['title'],
                'home_win_prob': home_win_prob * 100
            }
            
            picks.append(pick)
        
        # Sort by edge (highest first)
        picks.sort(key=lambda x: x['edge'], reverse=True)
        
        return picks
    
    def display_picks(self, picks, top_n=5):
        """Display top picks in formatted output"""
        
        if len(picks) == 0:
            print("\n⚠️  No picks generated")
            return
        
        print("\n" + "="*60)
        print("🏆 TOP PICKS OF THE DAY")
        print("="*60)
        
        # Filter picks with positive edge only
        good_picks = [p for p in picks if p['edge'] > 2.0]  # Only bet when edge > 2%
        
        if len(good_picks) == 0:
            print("\n⚠️  No picks meet minimum edge threshold (2%)")
            print("💡 Tip: Only bet when we have a clear edge over the market")
            return
        
        # Display top picks
        for i, pick in enumerate(good_picks[:top_n], 1):
            print(f"\n{'🥇' if i == 1 else '🥈' if i == 2 else '🥉' if i == 3 else '📌'} PICK #{i}")
            print("-" * 60)
            print(f"Game:       {pick['matchup']}")
            print(f"Time:       {pick['commence_time'].strftime('%a %b %d, %I:%M %p')}")
            print(f"Pick:       {pick['pick_team']} {pick['pick_line']:+.1f}")
            
            # Format odds (decimal or American)
            odds = pick['pick_odds']
            if odds > 0 and odds < 50:
                print(f"Odds:       {odds:.2f} ({pick['bookmaker']})")
            else:
                print(f"Odds:       {odds:+d} ({pick['bookmaker']})")
            
            print(f"Confidence: {pick['confidence']:.1f}%")
            print(f"Edge:       {pick['edge']:+.2f}% {'✅ STRONG' if pick['edge'] > 5 else '✅ GOOD'}")
            print(f"Model:      {pick['home_win_prob']:.1f}% home win probability")
        
        # Pick of the Day (highest edge)
        if len(good_picks) > 0:
            potd = good_picks[0]
            print("\n" + "="*60)
            print("⭐ PICK OF THE DAY ⭐")
            print("="*60)
            print(f"\n🎯 {potd['pick_team']} {potd['pick_line']:+.1f}")
            print(f"📊 {potd['matchup']}")
            print(f"💪 Confidence: {potd['confidence']:.1f}%")
            print(f"📈 Edge: {potd['edge']:+.2f}%")
            print(f"⏰ Game Time: {potd['commence_time'].strftime('%a %b %d, %I:%M %p')}")
        
        print("\n" + "="*60)
        print(f"Total Picks: {len(good_picks)} (edge > 2%)")
        print(f"Skipped: {len(picks) - len(good_picks)} (insufficient edge)")
        print("="*60)
        
        # Show usage stats
        print()
        self.odds_client.print_usage()


def main():
    # Check for API key
    if not os.environ.get('ODDS_API_KEY'):
        print("❌ Set ODDS_API_KEY environment variable")
        print("   source ~/.edgeforce-odds-api.env")
        sys.exit(1)
    
    # Get sport from command line
    sport = sys.argv[1] if len(sys.argv) > 1 else 'basketball_nba'
    
    # Generate picks
    generator = DailyPicksGenerator(sport=sport)
    picks = generator.generate_picks()
    
    # Display top picks
    generator.display_picks(picks, top_n=5)


if __name__ == '__main__':
    main()
