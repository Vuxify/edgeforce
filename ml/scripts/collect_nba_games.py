#!/usr/bin/env python3
"""
NBA Game Data Collector
Uses nba_api to collect game results from 2021-2024 seasons
Collects: scores, team stats, game metadata
"""

import pandas as pd
import time
from datetime import datetime
from pathlib import Path
from nba_api.stats.endpoints import leaguegamefinder
from nba_api.stats.static import teams

class NBADataCollector:
    def __init__(self, output_dir='../../data/raw/nba'):
        self.output_dir = Path(__file__).parent / output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.teams = teams.get_teams()
        
    def get_season_string(self, year):
        """Convert year to NBA season string (e.g., 2021 -> '2021-22')"""
        next_year = str(year + 1)[-2:]
        return f"{year}-{next_year}"
    
    def scrape_season(self, season_year):
        """Scrape all games from a season"""
        season_str = self.get_season_string(season_year)
        print(f"\n{'='*60}")
        print(f"Scraping NBA {season_str} Season")
        print(f"{'='*60}")
        
        try:
            # Use LeagueGameFinder to get all games
            print("Fetching games from NBA API...", end=' ')
            gamefinder = leaguegamefinder.LeagueGameFinder(
                season_nullable=season_str,
                season_type_nullable='Regular Season',
                timeout=30
            )
            games_df = gamefinder.get_data_frames()[0]
            print(f"✓ {len(games_df)} game records")
            
            # Process the data
            print("Processing game data...", end=' ')
            processed_games = self.process_games(games_df, season_year)
            print(f"✓ {len(processed_games)} unique games")
            
            # Save to CSV
            output_file = self.output_dir / f'nba_games_{season_year}.csv'
            processed_games.to_csv(output_file, index=False)
            print(f"✓ Saved to {output_file}")
            
            return processed_games
            
        except Exception as e:
            print(f"\n✗ Error scraping {season_str}: {e}")
            return pd.DataFrame()
    
    def process_games(self, games_df, season_year):
        """Process raw game data into clean format"""
        # The NBA API returns two rows per game (one for each team)
        # We need to combine them into one row per game
        
        games_dict = {}
        
        for _, row in games_df.iterrows():
            game_id = row['GAME_ID']
            team_abbr = row['TEAM_ABBREVIATION']
            
            if game_id not in games_dict:
                games_dict[game_id] = {
                    'season': season_year,
                    'game_id': game_id,
                    'date': row['GAME_DATE'],
                    'matchup': row['MATCHUP'],
                }
            
            # Determine if this is home or away team
            matchup = row.get('MATCHUP', '')
            if matchup is None:
                matchup = ''
            is_home = '@' not in matchup  # Home team doesn't have @ in matchup string
            
            prefix = 'home' if is_home else 'away'
            
            games_dict[game_id][f'{prefix}_team'] = row['TEAM_NAME']
            games_dict[game_id][f'{prefix}_abbr'] = team_abbr
            games_dict[game_id][f'{prefix}_score'] = row['PTS']
            games_dict[game_id][f'{prefix}_win'] = row['WL'] == 'W'
            
            # Additional stats
            games_dict[game_id][f'{prefix}_fg_pct'] = row['FG_PCT']
            games_dict[game_id][f'{prefix}_fg3_pct'] = row['FG3_PCT']
            games_dict[game_id][f'{prefix}_ft_pct'] = row['FT_PCT']
            games_dict[game_id][f'{prefix}_rebounds'] = row['REB']
            games_dict[game_id][f'{prefix}_assists'] = row['AST']
            games_dict[game_id][f'{prefix}_turnovers'] = row['TOV']
        
        # Convert to DataFrame
        games_list = []
        for game_id, game_data in games_dict.items():
            # Only include complete games (both home and away data)
            if 'home_score' in game_data and 'away_score' in game_data:
                game_data['total_points'] = game_data['home_score'] + game_data['away_score']
                game_data['point_differential'] = abs(game_data['home_score'] - game_data['away_score'])
                games_list.append(game_data)
        
        df = pd.DataFrame(games_list)
        
        # Sort by date
        df = df.sort_values('date').reset_index(drop=True)
        
        return df
    
    def scrape_multiple_seasons(self, start_year, end_year):
        """Scrape multiple seasons with rate limiting"""
        all_seasons = []
        
        for year in range(start_year, end_year + 1):
            df = self.scrape_season(year)
            if not df.empty:
                all_seasons.append(df)
            
            # Be nice to NBA API (rate limiting)
            if year < end_year:
                print("Waiting 3 seconds before next season...")
                time.sleep(3)
        
        if not all_seasons:
            print("\n✗ No data collected")
            return pd.DataFrame()
        
        # Combine all seasons
        combined_df = pd.concat(all_seasons, ignore_index=True)
        
        # Save combined file
        output_file = self.output_dir / f'nba_games_{start_year}_{end_year}.csv'
        combined_df.to_csv(output_file, index=False)
        
        print(f"\n{'='*60}")
        print(f"✓ COMPLETE: {len(combined_df)} total games collected")
        print(f"✓ Saved to {output_file}")
        print(f"{'='*60}\n")
        
        # Print summary statistics
        print("Summary by Season:")
        summary = combined_df.groupby('season').agg({
            'game_id': 'count',
            'total_points': 'mean',
            'point_differential': 'mean',
            'home_win': 'mean'  # Home win percentage
        }).round(2)
        summary.columns = ['Games', 'Avg Total Pts', 'Avg Diff', 'Home Win %']
        print(summary)
        
        return combined_df

def main():
    """Main execution"""
    collector = NBADataCollector()
    
    print("Starting NBA data collection...")
    print("This will take ~1-2 minutes per season due to API rate limits")
    
    # Collect 2021-2024 seasons
    df = collector.scrape_multiple_seasons(2021, 2024)
    
    if not df.empty:
        print("\n✓ NBA data collection complete!")
        print(f"Total games: {len(df)}")
        print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    else:
        print("\n✗ NBA data collection failed")

if __name__ == '__main__':
    main()
