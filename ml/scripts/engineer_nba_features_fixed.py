#!/usr/bin/env python3
"""
NBA Feature Engineering - FIXED (No In-Game Stats)
Only uses PRE-GAME predictive features for fair model training
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))
from engineer_features import FeatureEngineer

class NBAFeatureEngineerFixed(FeatureEngineer):
    """
    Fixed NBA feature engineering that ONLY uses pre-game information
    
    REMOVED (These are in-game results, not predictions):
    - fg_pct, fg3_pct, ft_pct (shooting percentages)
    - rebounds, assists, turnovers (box score stats)
    
    KEPT (These are predictive, calculated from PAST games):
    - Rolling averages (PPG, defense from previous games)
    - Elo ratings (updated after each game, used for next)
    - Rest days (known before game)
    - Back-to-back games (schedule info)
    - Season progress (date-based)
    """
    
    def load_nba_data_clean(self):
        """Load NBA data and DROP in-game stats"""
        file_path = self.raw_dir / 'nba' / 'nba_games_2021_2024.csv'
        print(f"Loading NBA data from {file_path}...")
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # DROP IN-GAME STATS (these cause data leakage!)
        in_game_cols = [
            'home_fg_pct', 'away_fg_pct',
            'home_fg3_pct', 'away_fg3_pct',
            'home_ft_pct', 'away_ft_pct',
            'home_rebounds', 'away_rebounds',
            'home_assists', 'away_assists',
            'home_turnovers', 'away_turnovers'
        ]
        
        # Remove columns that exist
        cols_to_drop = [col for col in in_game_cols if col in df.columns]
        if cols_to_drop:
            df = df.drop(columns=cols_to_drop)
            print(f"✓ Dropped {len(cols_to_drop)} in-game stat columns")
        
        # Create away_win column
        df['away_win'] = ~df['home_win']
        
        print(f"✓ Loaded {len(df)} clean NBA games (no in-game stats)")
        return df
    
    def engineer_nba_features_fixed(self):
        """Fixed NBA feature engineering pipeline"""
        print("\n" + "="*60)
        print("NBA Feature Engineering - FIXED (No In-Game Stats)")
        print("="*60)
        
        # Load clean data (without in-game stats)
        df = self.load_nba_data_clean()
        
        # Create rolling features (from PAST games only)
        # NBA typically looks at 5, 10, 20 game windows
        df = self.create_rolling_features(df, 'home', windows=[5, 10, 20])
        df = self.create_rolling_features(df, 'away', windows=[5, 10, 20])
        
        # Create Elo features (updated AFTER each game)
        df = self.create_elo_features(df)
        
        # Create situational features (schedule-based, known before game)
        df = self.create_situational_features(df)
        
        # Create targets
        df = self.create_target_variables(df)
        
        # Save processed data
        output_file = self.processed_dir / 'nba_features_fixed.csv'
        df.to_csv(output_file, index=False)
        print(f"\n✓ Saved {len(df)} games with CLEAN features to {output_file}")
        
        # Print feature summary
        feature_cols = [col for col in df.columns if any(x in col for x in ['_L', 'elo_', 'rest_', 'b2b', 'season_progress'])]
        print(f"✓ Created {len(feature_cols)} PRE-GAME features (no in-game stats)")
        
        # Show which features we're using
        print(f"\nFeature categories:")
        print(f"  - Rolling averages: {len([c for c in feature_cols if '_L' in c])} features")
        print(f"  - Elo ratings: {len([c for c in feature_cols if 'elo_' in c])} features")
        print(f"  - Situational: {len([c for c in feature_cols if 'rest_' in c or 'b2b' in c or 'season' in c])} features")
        
        print(f"\nFeature samples:")
        print(df[['date', 'home_abbr', 'away_abbr', 'elo_diff', 'home_ppg_L10', 'away_ppg_L10', 'rest_advantage']].head(10))
        
        # Validation check
        print(f"\n✅ VALIDATION:")
        in_game_features = ['fg_pct', 'fg3_pct', 'ft_pct', 'rebounds', 'assists', 'turnovers']
        found_bad = [col for col in df.columns if any(bad in col for bad in in_game_features)]
        if found_bad:
            print(f"  ❌ WARNING: Found in-game stats: {found_bad}")
        else:
            print(f"  ✅ No in-game stats found - data is clean!")
        
        return df


def main():
    """Re-engineer NBA features without in-game stats"""
    engineer = NBAFeatureEngineerFixed()
    
    # Engineer clean NBA features
    nba_df = engineer.engineer_nba_features_fixed()
    
    print("\n" + "="*60)
    print("Fixed NBA Feature Engineering Complete!")
    print("="*60)
    print(f"\nNBA: {len(nba_df)} games with {len([c for c in nba_df.columns if any(x in c for x in ['_L', 'elo_', 'rest_'])])} clean features")
    print(f"\n⚠️  Next step: Re-train NBA model with clean features")
    print(f"   Expected win rate: 55-58% (realistic, not 90%)")
    print(f"\n   Run: python3 train_models.py nba --use-fixed")

if __name__ == '__main__':
    main()
