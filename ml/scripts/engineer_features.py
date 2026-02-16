#!/usr/bin/env python3
"""
Feature Engineering Pipeline
Transforms raw game data into ML-ready features
Implements rolling averages, Elo ratings, and situational features
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

class FeatureEngineer:
    def __init__(self, data_dir='../../data'):
        self.data_dir = Path(__file__).parent / data_dir
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        # Elo rating system
        self.elo_ratings = {}
        self.elo_k = 20
        self.elo_initial = 1500
        self.home_advantage = 65
    
    def load_nfl_data(self):
        """Load raw NFL data"""
        file_path = self.raw_dir / 'nfl' / 'nfl_games_2021_2024.csv'
        print(f"Loading NFL data from {file_path}...")
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Create away_win column (inverse of home_win)
        df['away_win'] = ~df['home_win']
        
        print(f"✓ Loaded {len(df)} NFL games")
        return df
    
    def load_nba_data(self):
        """Load raw NBA data"""
        file_path = self.raw_dir / 'nba' / 'nba_games_2021_2024.csv'
        print(f"Loading NBA data from {file_path}...")
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Create away_win column (inverse of home_win)
        df['away_win'] = ~df['home_win']
        
        print(f"✓ Loaded {len(df)} NBA games")
        return df
    
    def get_elo_rating(self, team):
        """Get current Elo rating for a team"""
        return self.elo_ratings.get(team, self.elo_initial)
    
    def update_elo_ratings(self, home_team, away_team, home_score, away_score):
        """Update Elo ratings based on game result"""
        # Get current ratings
        home_rating = self.get_elo_rating(home_team) + self.home_advantage
        away_rating = self.get_elo_rating(away_team)
        
        # Expected win probability
        expected_home = 1 / (1 + 10 ** ((away_rating - home_rating) / 400))
        
        # Actual result
        if home_score > away_score:
            actual_home = 1.0
        elif home_score < away_score:
            actual_home = 0.0
        else:
            actual_home = 0.5
        
        # Update ratings
        home_change = self.elo_k * (actual_home - expected_home)
        away_change = self.elo_k * ((1 - actual_home) - (1 - expected_home))
        
        self.elo_ratings[home_team] = self.get_elo_rating(home_team) + home_change
        self.elo_ratings[away_team] = self.get_elo_rating(away_team) + away_change
        
        return expected_home, home_change, away_change
    
    def create_rolling_features(self, df, team_side='home', windows=[3, 5, 10]):
        """Create rolling average features"""
        team_col = f'{team_side}_abbr'
        score_col = f'{team_side}_score'
        win_col = f'{team_side}_win'
        
        print(f"Creating rolling features for {team_side} team...")
        
        opponent_side = 'away' if team_side == 'home' else 'home'
        opponent_score_col = f'{opponent_side}_score'
        
        for window in windows:
            # Points scored
            df[f'{team_side}_ppg_L{window}'] = df.groupby(team_col)[score_col].transform(
                lambda x: x.rolling(window, min_periods=1).mean().shift(1)
            )
            
            # Points allowed
            df[f'{team_side}_ppg_allowed_L{window}'] = df.groupby(team_col)[opponent_score_col].transform(
                lambda x: x.rolling(window, min_periods=1).mean().shift(1)
            )
            
            # Win rate
            df[f'{team_side}_win_rate_L{window}'] = df.groupby(team_col)[win_col].transform(
                lambda x: x.rolling(window, min_periods=1).mean().shift(1)
            )
        
        return df
    
    def create_elo_features(self, df):
        """Create Elo rating features"""
        print("Creating Elo ratings...")
        
        # Reset Elo ratings at start of each season
        df['elo_home_before'] = 0.0
        df['elo_away_before'] = 0.0
        df['elo_diff'] = 0.0
        df['elo_home_prob'] = 0.0
        
        current_season = None
        
        for idx, row in df.iterrows():
            # Reset Elo at start of new season
            if row['season'] != current_season:
                print(f"  Season {row['season']}: Resetting Elo ratings")
                self.elo_ratings = {}
                current_season = row['season']
            
            # Get ratings before game
            home_elo = self.get_elo_rating(row['home_abbr'])
            away_elo = self.get_elo_rating(row['away_abbr'])
            
            # Calculate features
            df.at[idx, 'elo_home_before'] = home_elo
            df.at[idx, 'elo_away_before'] = away_elo
            df.at[idx, 'elo_diff'] = home_elo - away_elo
            
            # Win probability
            expected_prob, _, _ = self.update_elo_ratings(
                row['home_abbr'], row['away_abbr'],
                row['home_score'], row['away_score']
            )
            df.at[idx, 'elo_home_prob'] = expected_prob
        
        print(f"✓ Elo ratings created")
        return df
    
    def create_situational_features(self, df):
        """Create situational features"""
        print("Creating situational features...")
        
        # Rest days
        df = df.sort_values(['home_abbr', 'date'])
        df['home_rest_days'] = df.groupby('home_abbr')['date'].diff().dt.days
        
        df = df.sort_values(['away_abbr', 'date'])
        df['away_rest_days'] = df.groupby('away_abbr')['date'].diff().dt.days
        
        # Rest advantage
        df['rest_advantage'] = df['home_rest_days'] - df['away_rest_days']
        
        # Back-to-back games
        df['home_b2b'] = (df['home_rest_days'] <= 1).astype(int)
        df['away_b2b'] = (df['away_rest_days'] <= 1).astype(int)
        
        # Season timing (early = 0, late = 1)
        df['season_progress'] = df.groupby('season').cumcount() / df.groupby('season')['game_id'].transform('count')
        
        # Sort back to chronological order
        df = df.sort_values('date').reset_index(drop=True)
        
        print("✓ Situational features created")
        return df
    
    def create_target_variables(self, df):
        """Create prediction targets"""
        print("Creating target variables...")
        
        # Home win (binary classification)
        df['target_home_win'] = df['home_win'].astype(int)
        
        # Point spread (regression)
        df['target_spread'] = df['home_score'] - df['away_score']
        
        # Total points (regression)
        df['target_total'] = df['total_points']
        
        # Home cover spread (assuming standard -3 home advantage)
        df['home_cover_spread'] = (df['target_spread'] > 3).astype(int)
        
        print("✓ Target variables created")
        return df
    
    def engineer_nfl_features(self):
        """Full feature engineering pipeline for NFL"""
        print("\n" + "="*60)
        print("NFL Feature Engineering")
        print("="*60)
        
        # Load data
        df = self.load_nfl_data()
        
        # Create rolling features
        df = self.create_rolling_features(df, 'home', windows=[3, 5, 10])
        df = self.create_rolling_features(df, 'away', windows=[3, 5, 10])
        
        # Create Elo features
        df = self.create_elo_features(df)
        
        # Create situational features
        df = self.create_situational_features(df)
        
        # Create targets
        df = self.create_target_variables(df)
        
        # Save processed data
        output_file = self.processed_dir / 'nfl_features.csv'
        df.to_csv(output_file, index=False)
        print(f"\n✓ Saved {len(df)} games with features to {output_file}")
        
        # Print feature summary
        feature_cols = [col for col in df.columns if any(x in col for x in ['_L', 'elo_', 'rest_', 'b2b', 'season_progress'])]
        print(f"✓ Created {len(feature_cols)} features")
        print(f"\nFeature samples:")
        print(df[['date', 'home_abbr', 'away_abbr', 'elo_diff', 'home_ppg_L5', 'away_ppg_L5', 'rest_advantage']].head(10))
        
        return df
    
    def engineer_nba_features(self):
        """Full feature engineering pipeline for NBA"""
        print("\n" + "="*60)
        print("NBA Feature Engineering")
        print("="*60)
        
        # Load data
        df = self.load_nba_data()
        
        # Create rolling features
        df = self.create_rolling_features(df, 'home', windows=[5, 10, 20])
        df = self.create_rolling_features(df, 'away', windows=[5, 10, 20])
        
        # Create Elo features
        df = self.create_elo_features(df)
        
        # Create situational features
        df = self.create_situational_features(df)
        
        # Create targets
        df = self.create_target_variables(df)
        
        # Save processed data
        output_file = self.processed_dir / 'nba_features.csv'
        df.to_csv(output_file, index=False)
        print(f"\n✓ Saved {len(df)} games with features to {output_file}")
        
        # Print feature summary
        feature_cols = [col for col in df.columns if any(x in col for x in ['_L', 'elo_', 'rest_', 'b2b', 'season_progress'])]
        print(f"✓ Created {len(feature_cols)} features")
        print(f"\nFeature samples:")
        print(df[['date', 'home_abbr', 'away_abbr', 'elo_diff', 'home_ppg_L10', 'away_ppg_L10', 'rest_advantage']].head(10))
        
        return df

def main():
    """Main execution"""
    engineer = FeatureEngineer()
    
    # Engineer NFL features
    nfl_df = engineer.engineer_nfl_features()
    
    # Reset Elo for NBA
    engineer.elo_ratings = {}
    
    # Engineer NBA features
    nba_df = engineer.engineer_nba_features()
    
    print("\n" + "="*60)
    print("Feature Engineering Complete!")
    print("="*60)
    print(f"\nNFL: {len(nfl_df)} games with features")
    print(f"NBA: {len(nba_df)} games with features")
    print(f"\nNext step: Train ML models with processed data")

if __name__ == '__main__':
    main()
