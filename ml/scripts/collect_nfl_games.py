#!/usr/bin/env python3
"""
NFL Game Data Collector
Scrapes game results from ESPN API (free, no key required)
Collects: scores, team stats, game metadata for 2021-2024 seasons
"""

import requests
import pandas as pd
import json
from datetime import datetime
import time
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

class NFLDataCollector:
    def __init__(self, output_dir='../../data/raw/nfl'):
        self.output_dir = Path(__file__).parent / output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.base_url = 'http://site.api.espn.com/apis/site/v2/sports/football/nfl'
        
    def get_season_weeks(self, season):
        """Get the number of weeks in a season (usually 18)"""
        # Regular season is weeks 1-18
        return 18
    
    def scrape_week(self, season, week):
        """Scrape all games from a specific week"""
        url = f'{self.base_url}/scoreboard'
        params = {
            'seasontype': 2,  # 2 = regular season, 3 = playoffs
            'week': week,
            'dates': season
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            games = []
            for event in data.get('events', []):
                game = self.parse_game(event, season, week)
                if game:
                    games.append(game)
            
            return games
        
        except Exception as e:
            print(f"Error scraping week {week} of {season}: {e}")
            return []
    
    def parse_game(self, event, season, week):
        """Parse a single game event"""
        try:
            competition = event['competitions'][0]
            
            # Get teams
            home_team = None
            away_team = None
            
            for competitor in competition['competitors']:
                team_info = {
                    'id': competitor['id'],
                    'name': competitor['team']['displayName'],
                    'abbreviation': competitor['team']['abbreviation'],
                    'score': int(competitor.get('score', 0)),
                    'winner': competitor.get('winner', False),
                    'record': competitor.get('records', [{}])[0].get('summary', 'N/A')
                }
                
                if competitor['homeAway'] == 'home':
                    home_team = team_info
                else:
                    away_team = team_info
            
            # Get game metadata
            game_data = {
                'season': season,
                'week': week,
                'game_id': event['id'],
                'date': event['date'],
                'status': competition['status']['type']['name'],
                
                # Home team
                'home_team': home_team['name'],
                'home_abbr': home_team['abbreviation'],
                'home_score': home_team['score'],
                'home_record': home_team['record'],
                
                # Away team
                'away_team': away_team['name'],
                'away_abbr': away_team['abbreviation'],
                'away_score': away_team['score'],
                'away_record': away_team['record'],
                
                # Result
                'home_win': home_team['winner'],
                'total_points': home_team['score'] + away_team['score'],
                'point_differential': abs(home_team['score'] - away_team['score']),
                
                # Venue
                'venue': competition.get('venue', {}).get('fullName', 'Unknown'),
                'city': competition.get('venue', {}).get('address', {}).get('city', 'Unknown'),
                'neutral_site': competition.get('neutralSite', False),
                
                # Broadcast
                'network': competition.get('broadcasts', [{}])[0].get('names', ['N/A'])[0] if competition.get('broadcasts') else 'N/A',
            }
            
            return game_data
            
        except Exception as e:
            print(f"Error parsing game: {e}")
            return None
    
    def scrape_season(self, season):
        """Scrape all games from a season"""
        print(f"\n{'='*60}")
        print(f"Scraping NFL {season} Season")
        print(f"{'='*60}")
        
        all_games = []
        weeks = self.get_season_weeks(season)
        
        for week in range(1, weeks + 1):
            print(f"Week {week}/{weeks}...", end=' ')
            games = self.scrape_week(season, week)
            all_games.extend(games)
            print(f"✓ {len(games)} games")
            
            # Be nice to ESPN's servers
            time.sleep(1)
        
        # Convert to DataFrame
        df = pd.DataFrame(all_games)
        
        # Save to CSV
        output_file = self.output_dir / f'nfl_games_{season}.csv'
        df.to_csv(output_file, index=False)
        print(f"\n✓ Saved {len(df)} games to {output_file}")
        
        return df
    
    def scrape_multiple_seasons(self, start_year, end_year):
        """Scrape multiple seasons"""
        all_seasons = []
        
        for year in range(start_year, end_year + 1):
            df = self.scrape_season(year)
            all_seasons.append(df)
        
        # Combine all seasons
        combined_df = pd.concat(all_seasons, ignore_index=True)
        
        # Save combined file
        output_file = self.output_dir / f'nfl_games_{start_year}_{end_year}.csv'
        combined_df.to_csv(output_file, index=False)
        
        print(f"\n{'='*60}")
        print(f"✓ COMPLETE: {len(combined_df)} total games collected")
        print(f"✓ Saved to {output_file}")
        print(f"{'='*60}\n")
        
        # Print summary statistics
        print("Summary by Season:")
        print(combined_df.groupby('season').agg({
            'game_id': 'count',
            'total_points': 'mean',
            'point_differential': 'mean'
        }).round(2))
        
        return combined_df

def main():
    """Main execution"""
    collector = NFLDataCollector()
    
    # Collect 2021-2024 seasons
    print("Starting NFL data collection...")
    print("This will take ~2-3 minutes per season")
    
    df = collector.scrape_multiple_seasons(2021, 2024)
    
    print("\n✓ NFL data collection complete!")
    print(f"Total games: {len(df)}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

if __name__ == '__main__':
    main()
