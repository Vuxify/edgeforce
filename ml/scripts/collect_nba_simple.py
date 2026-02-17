#!/usr/bin/env python3
"""
Simplified NBA Data Collector - 2023 Season
Collects real game data for ML training
"""

import pandas as pd
from datetime import datetime
import time
from pathlib import Path

try:
    from nba_api.stats.endpoints import leaguegamefinder
    from nba_api.stats.static import teams
except ImportError:
    print("Installing nba_api...")
    import subprocess
    subprocess.check_call(['pip3', 'install', '--quiet', 'nba_api'])
    from nba_api.stats.endpoints import leaguegamefinder
    from nba_api.stats.static import teams

def collect_nba_season(season='2022-23'):
    """
    Collect all NBA games for a season
    Returns clean dataframe with game data
    """
    print(f"🏀 Collecting NBA {season} season...")
    print("⏳ This may take 30-60 seconds...")
    
    # Get all games
    gamefinder = leaguegamefinder.LeagueGameFinder(
        season_nullable=season,
        season_type_nullable='Regular Season'
    )
    
    games_df = gamefinder.get_data_frames()[0]
    print(f"📊 Fetched {len(games_df)} team-game records")
    
    # Process games (each game appears twice, once per team)
    game_data = []
    processed_games = set()
    
    for _, row in games_df.iterrows():
        game_id = row['GAME_ID']
        
        # Skip if already processed
        if game_id in processed_games:
            continue
        
        # Get both teams' data for this game
        game_records = games_df[games_df['GAME_ID'] == game_id]
        
        if len(game_records) != 2:
            continue
        
        # Determine home/away (team with 'vs.' is home)
        home_record = game_records[game_records['MATCHUP'].str.contains('vs.')]
        away_record = game_records[game_records['MATCHUP'].str.contains('@')]
        
        if len(home_record) == 0 or len(away_record) == 0:
            continue
        
        home = home_record.iloc[0]
        away = away_record.iloc[0]
        
        game_data.append({
            'game_id': game_id,
            'date': home['GAME_DATE'],
            'season': season,
            'home_team': home['TEAM_ABBREVIATION'],
            'away_team': away['TEAM_ABBREVIATION'],
            'home_score': int(home['PTS']),
            'away_score': int(away['PTS']),
            'total_points': int(home['PTS'] + away['PTS']),
            'home_win': 1 if home['PTS'] > away['PTS'] else 0,
            'margin': int(home['PTS'] - away['PTS'])
        })
        
        processed_games.add(game_id)
    
    df = pd.DataFrame(game_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    
    print(f"✅ Processed {len(df)} unique games")
    
    return df

if __name__ == '__main__':
    # Collect 2023 season
    df = collect_nba_season('2022-23')
    
    # Save
    output_path = Path(__file__).parent.parent / 'data' / 'raw' / 'nba' / 'nba_2023.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    
    print(f"\n📁 Saved to: {output_path}")
    print(f"\n📊 Summary:")
    print(f"   Games: {len(df)}")
    print(f"   Date range: {df['date'].min().date()} to {df['date'].max().date()}")
    print(f"   Teams: {df['home_team'].nunique()}")
    print(f"   Avg total: {df['total_points'].mean():.1f} points")
    print(f"   Home win %: {df['home_win'].mean()*100:.1f}%")
    print(f"\n🎯 Sample games:")
    print(df.head(10)[['date', 'home_team', 'away_team', 'home_score', 'away_score']].to_string())
