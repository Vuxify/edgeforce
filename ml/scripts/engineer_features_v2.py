#!/usr/bin/env python3
"""
Feature Engineering Pipeline
Calculates 40+ features for ML model training
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta

def calculate_elo_ratings(df, k=20, initial_elo=1500):
    """
    Calculate Elo ratings for each team over time
    Higher Elo = stronger team
    """
    print("📊 Calculating Elo ratings...")
    
    # Initialize Elo for all teams
    teams = pd.concat([df['home_team'], df['away_team']]).unique()
    elo_ratings = {team: initial_elo for team in teams}
    
    # Track Elo over time
    df['home_elo_before'] = 0.0
    df['away_elo_before'] = 0.0
    df['elo_diff'] = 0.0
    
    for idx, game in df.iterrows():
        home = game['home_team']
        away = game['away_team']
        
        # Store current Elo
        home_elo = elo_ratings[home]
        away_elo = elo_ratings[away]
        
        df.at[idx, 'home_elo_before'] = home_elo
        df.at[idx, 'away_elo_before'] = away_elo
        df.at[idx, 'elo_diff'] = home_elo - away_elo
        
        # Calculate expected win probability
        expected_home_win = 1 / (1 + 10**((away_elo - home_elo) / 400))
        
        # Actual result
        actual_home_win = 1 if game['home_win'] == 1 else 0
        
        # Update Elo (with margin multiplier)
        margin_multiplier = np.log(abs(game['margin']) + 1)
        home_change = k * margin_multiplier * (actual_home_win - expected_home_win)
        
        elo_ratings[home] += home_change
        elo_ratings[away] -= home_change
    
    print(f"   ✅ Elo ratings calculated")
    return df

def calculate_rolling_stats(df):
    """
    Calculate rolling statistics for each team
    Last 3, 5, 10 games
    """
    print("📊 Calculating rolling statistics...")
    
    # Initialize columns
    for window in [3, 5, 10]:
        df[f'home_ppg_last_{window}'] = 0.0
        df[f'away_ppg_last_{window}'] = 0.0
        df[f'home_win_pct_last_{window}'] = 0.0
        df[f'away_win_pct_last_{window}'] = 0.0
    
    # Calculate for each team
    teams = pd.concat([df['home_team'], df['away_team']]).unique()
    
    for team in teams:
        # Get all games for this team
        team_home = df[df['home_team'] == team].copy()
        team_away = df[df['away_team'] == team].copy()
        
        # Home games
        for idx in team_home.index:
            game_date = df.loc[idx, 'date']
            
            # Get previous games
            prev_home = team_home[team_home['date'] < game_date].tail(10)
            prev_away = team_away[team_away['date'] < game_date].tail(10)
            prev_all = pd.concat([prev_home, prev_away]).sort_values('date').tail(10)
            
            if len(prev_all) == 0:
                continue
            
            # Points scored
            prev_home_pts = prev_home['home_score'].values if len(prev_home) > 0 else []
            prev_away_pts = prev_away['away_score'].values if len(prev_away) > 0 else []
            all_pts = list(prev_home_pts) + list(prev_away_pts)
            all_pts = all_pts[-10:] if len(all_pts) > 10 else all_pts
            
            # Wins
            prev_home_wins = prev_home['home_win'].values if len(prev_home) > 0 else []
            prev_away_wins = (1 - prev_away['home_win'].values) if len(prev_away) > 0 else []
            all_wins = list(prev_home_wins) + list(prev_away_wins)
            all_wins = all_wins[-10:] if len(all_wins) > 10 else all_wins
            
            # Calculate rolling averages
            for window in [3, 5, 10]:
                if len(all_pts) >= window:
                    df.at[idx, f'home_ppg_last_{window}'] = np.mean(all_pts[-window:])
                    df.at[idx, f'home_win_pct_last_{window}'] = np.mean(all_wins[-window:])
        
        # Away games
        for idx in team_away.index:
            game_date = df.loc[idx, 'date']
            
            prev_home = team_home[team_home['date'] < game_date].tail(10)
            prev_away = team_away[team_away['date'] < game_date].tail(10)
            
            if len(prev_home) == 0 and len(prev_away) == 0:
                continue
            
            prev_home_pts = prev_home['home_score'].values if len(prev_home) > 0 else []
            prev_away_pts = prev_away['away_score'].values if len(prev_away) > 0 else []
            all_pts = list(prev_home_pts) + list(prev_away_pts)
            all_pts = all_pts[-10:] if len(all_pts) > 10 else all_pts
            
            prev_home_wins = prev_home['home_win'].values if len(prev_home) > 0 else []
            prev_away_wins = (1 - prev_away['home_win'].values) if len(prev_away) > 0 else []
            all_wins = list(prev_home_wins) + list(prev_away_wins)
            all_wins = all_wins[-10:] if len(all_wins) > 10 else all_wins
            
            for window in [3, 5, 10]:
                if len(all_pts) >= window:
                    df.at[idx, f'away_ppg_last_{window}'] = np.mean(all_pts[-window:])
                    df.at[idx, f'away_win_pct_last_{window}'] = np.mean(all_wins[-window:])
    
    print(f"   ✅ Rolling stats calculated")
    return df

def calculate_rest_days(df):
    """
    Calculate days of rest before each game
    Back-to-back games = 0 rest
    """
    print("📊 Calculating rest days...")
    
    df['home_rest_days'] = 0
    df['away_rest_days'] = 0
    df['rest_advantage'] = 0
    
    teams = pd.concat([df['home_team'], df['away_team']]).unique()
    
    for team in teams:
        # Home games
        team_home = df[df['home_team'] == team].copy()
        for i, idx in enumerate(team_home.index):
            if i > 0:
                prev_idx = team_home.index[i-1]
                days_rest = (df.loc[idx, 'date'] - df.loc[prev_idx, 'date']).days - 1
                df.at[idx, 'home_rest_days'] = max(0, days_rest)
        
        # Away games
        team_away = df[df['away_team'] == team].copy()
        for i, idx in enumerate(team_away.index):
            if i > 0:
                prev_idx = team_away.index[i-1]
                days_rest = (df.loc[idx, 'date'] - df.loc[prev_idx, 'date']).days - 1
                df.at[idx, 'away_rest_days'] = max(0, days_rest)
    
    # Rest advantage = home rest - away rest
    df['rest_advantage'] = df['home_rest_days'] - df['away_rest_days']
    
    print(f"   ✅ Rest days calculated")
    return df

def add_basic_features(df):
    """
    Add basic derived features
    """
    print("📊 Adding basic features...")
    
    # Home court advantage (league average)
    df['home_court_advantage'] = 1
    
    # Spread (for prediction)
    # Positive = home favored
    df['implied_spread'] = (df['home_elo_before'] - df['away_elo_before']) / 25
    
    # Total prediction (simple baseline)
    df['implied_total'] = (
        (df['home_ppg_last_5'] + df['away_ppg_last_5']) / 2 
        + 230  # League average total
    ) / 2
    
    # Momentum (trend over recent games)
    df['home_momentum'] = df['home_ppg_last_3'] - df['home_ppg_last_10']
    df['away_momentum'] = df['away_ppg_last_3'] - df['away_ppg_last_10']
    
    print(f"   ✅ Basic features added")
    return df

def engineer_features(input_csv, output_csv):
    """
    Main feature engineering pipeline
    """
    print(f"\n🔧 Feature Engineering Pipeline")
    print(f"Input: {input_csv}")
    print(f"Output: {output_csv}\n")
    
    # Load data
    df = pd.read_csv(input_csv)
    df['date'] = pd.to_datetime(df['date'])
    print(f"📊 Loaded {len(df)} games\n")
    
    # Calculate features
    df = calculate_elo_ratings(df)
    df = calculate_rolling_stats(df)
    df = calculate_rest_days(df)
    df = add_basic_features(df)
    
    # Remove games with insufficient data (first 10 games of season)
    df_ready = df[df.index >= 10].copy()
    
    # Save
    output_path = Path(output_csv)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_ready.to_csv(output_path, index=False)
    
    print(f"\n✅ Feature engineering complete!")
    print(f"   Original games: {len(df)}")
    print(f"   Training-ready games: {len(df_ready)}")
    print(f"   Features: {len(df_ready.columns)}")
    print(f"   Saved to: {output_path}\n")
    
    # Show sample
    print("📊 Sample features:")
    feature_cols = ['date', 'home_team', 'away_team', 'home_elo_before', 'away_elo_before', 
                    'elo_diff', 'home_ppg_last_5', 'away_ppg_last_5', 'rest_advantage']
    print(df_ready[feature_cols].head(10).to_string())
    
    return df_ready

if __name__ == '__main__':
    input_file = '../data/raw/nba/nba_2023.csv'
    output_file = '../data/processed/nba_features_2023.csv'
    
    df = engineer_features(input_file, output_file)
    
    print(f"\n🎯 Ready for model training with {len(df)} games!")
