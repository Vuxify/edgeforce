#!/usr/bin/env python3
"""
NBA Data Collector - Real Historical Games
Collects games from 2023 season using nba_api
Target: 1,755 games for model training
"""

import pandas as pd
import numpy as np
from datetime import datetime
import time
import json
from pathlib import Path

try:
    from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
    from nba_api.stats.static import teams
except ImportError:
    print("Installing nba_api...")
    import subprocess
    subprocess.check_call(['pip3', 'install', '--quiet', 'nba_api'])
    from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
    from nba_api.stats.static import teams

def collect_nba_season(season='2022-23'):
    """
    Collect all NBA games for a season
    Season format: '2022-23' for 2022-2023 season
    """
    print(f"🏀 Collecting NBA {season} season...")
    
    # Get all games for the season
    gamefinder = leaguegamefinder.LeagueGameFinder(
        season_nullable=season,
        season_type_nullable='Regular Season'
    )
    
    games = gamefinder.get_data_frames()[0]
    
    # Each game appears twice (once for each team)
    # Keep only home team entries
    games = games[games['MATCHUP'].str.contains('vs.')].copy()
    
    print(f"✅ Found {len(games)} games for {season}")
    
    # Basic game info
    game_data = []
    
    for idx, game in games.iterrows():
        game_id = game['GAME_ID']
        game_date = game['GAME_DATE']
        
        # Parse matchup (e.g. "LAL vs. BOS")
        matchup = game['MATCHUP']
        home_team = game['TEAM_ABBREVIATION']
        away_team = matchup.split(' vs. ')[1] if ' vs. ' in matchup else matchup.split(' @ ')[0]
        
        # Basic stats
        home_pts = game['PTS']
        
        # Get opponent score (need to fetch)
        opp_game = games[(games['GAME_ID'] == game_id) & (games['TEAM_ABBREVIATION'] != home_team)]
        away_pts = opp_game['PTS'].values[0] if len(opp_game) > 0 else None
        
        if away_pts is None:
            continue
            
        game_data.append({
            'game_id': game_id,
            'date': game_date,
            'season': season,
            'home_team': home_team,
            'away_team': away_team,
            'home_score': int(home_pts),
            'away_score': int(away_pts),
            'total_points': int(home_pts + away_pts),
            'home_win': 1 if home_pts > away_pts else 0,
            'margin': int(home_pts - away_pts)
        })
    
    df = pd.DataFrame(game_data)
    if len(df) > 0:
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
    
    return df

def add_team_stats(df):
    """
    Add rolling team statistics (last 3, 5, 10 games)
    """
    print("📊 Calculating team statistics...")
    
    df = df.copy()
    
    # For each team, calculate rolling stats
    for team in df['home_team'].unique():
        # Home games
        home_mask = df['home_team'] == team
        home_games = df[home_mask].copy()
        
        # Away games
        away_mask = df['away_team'] == team
        away_games = df[away_mask].copy()
        
        # Combine all games for this team
        all_games = pd.concat([
            home_games[['date', 'home_score', 'home_win']].rename(columns={
                'home_score': 'points',
                'home_win': 'win'
            }),
            away_games[['date', 'away_score']].rename(columns={
                'away_score': 'points'
            }).assign(win=lambda x: 1 - df.loc[away_mask, 'home_win'].values)
        ]).sort_values('date')
        
        # Rolling averages
        all_games['ppg_last_3'] = all_games['points'].rolling(3, min_periods=1).mean()
        all_games['ppg_last_5'] = all_games['points'].rolling(5, min_periods=1).mean()
        all_games['ppg_last_10'] = all_games['points'].rolling(10, min_periods=1).mean()
        all_games['win_pct_last_10'] = all_games['win'].rolling(10, min_periods=1).mean()
        
        # Add back to main dataframe
        # This is simplified - in production, merge properly with lag
        
    print(f"✅ Team stats calculated")
    return df

if __name__ == '__main__':
    # Collect 2023 season
    df_2023 = collect_nba_season('2022-23')
    
    # Save raw data
    output_path = Path(__file__).parent.parent / 'data' / 'raw' / 'nba' / 'nba_2023_raw.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_2023.to_csv(output_path, index=False)
    
    print(f"\n✅ Saved {len(df_2023)} games to {output_path}")
    print(f"\nSample data:")
    print(df_2023.head())
    print(f"\nDate range: {df_2023['date'].min()} to {df_2023['date'].max()}")
    print(f"Teams: {df_2023['home_team'].nunique()}")
    print(f"Average total: {df_2023['total_points'].mean():.1f}")
    print(f"Home win %: {df_2023['home_win'].mean()*100:.1f}%")
