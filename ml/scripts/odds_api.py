#!/usr/bin/env python3
"""
The Odds API Integration
Smart wrapper with rate limiting and caching for 500 credit/month free tier
"""

import requests
import json
import time
from datetime import datetime, timedelta
from pathlib import Path
import pickle

class OddsAPIClient:
    def __init__(self, api_key, cache_dir='../../data/cache'):
        self.api_key = api_key
        self.base_url = 'https://api.the-odds-api.com/v4'
        
        # Cache setup
        self.cache_dir = Path(__file__).parent / cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Usage tracking
        self.usage_file = self.cache_dir / 'odds_api_usage.json'
        self.load_usage()
        
        # Rate limiting (be conservative)
        self.cache_duration_minutes = 30  # Cache odds for 30 minutes
        self.daily_credit_limit = 15  # Max 15 credits per day (conservative)
        
    def load_usage(self):
        """Load API usage statistics"""
        if self.usage_file.exists():
            with open(self.usage_file, 'r') as f:
                self.usage = json.load(f)
        else:
            self.usage = {
                'total_requests': 0,
                'total_credits_used': 0,
                'requests_today': 0,
                'credits_today': 0,
                'last_reset': datetime.now().date().isoformat(),
                'monthly_credits_remaining': 500,
                'requests_log': []
            }
    
    def save_usage(self):
        """Save API usage statistics"""
        # Reset daily counters if new day
        today = datetime.now().date().isoformat()
        if self.usage['last_reset'] != today:
            self.usage['requests_today'] = 0
            self.usage['credits_today'] = 0
            self.usage['last_reset'] = today
        
        with open(self.usage_file, 'w') as f:
            json.dump(self.usage, f, indent=2)
    
    def log_request(self, endpoint, credits_used):
        """Log an API request"""
        self.usage['total_requests'] += 1
        self.usage['total_credits_used'] += credits_used
        self.usage['requests_today'] += 1
        self.usage['credits_today'] += credits_used
        self.usage['monthly_credits_remaining'] -= credits_used
        
        # Keep last 100 requests
        self.usage['requests_log'].append({
            'timestamp': datetime.now().isoformat(),
            'endpoint': endpoint,
            'credits': credits_used
        })
        if len(self.usage['requests_log']) > 100:
            self.usage['requests_log'] = self.usage['requests_log'][-100:]
        
        self.save_usage()
    
    def can_make_request(self, estimated_credits=5):
        """Check if we can make a request within daily limit"""
        if self.usage['credits_today'] + estimated_credits > self.daily_credit_limit:
            print(f"⚠️  Daily credit limit reached ({self.usage['credits_today']}/{self.daily_credit_limit})")
            return False
        
        if self.usage['monthly_credits_remaining'] < estimated_credits:
            print(f"⚠️  Monthly credits exhausted ({self.usage['monthly_credits_remaining']} remaining)")
            return False
        
        return True
    
    def get_cache_key(self, endpoint, params):
        """Generate cache key from endpoint and params"""
        # Simplify endpoint to avoid subdirectories
        safe_endpoint = endpoint.replace('/', '_')
        param_str = json.dumps(params, sort_keys=True)
        return f"{safe_endpoint}_{abs(hash(param_str))}"
    
    def get_from_cache(self, cache_key):
        """Get data from cache if still valid"""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        
        if cache_file.exists():
            with open(cache_file, 'rb') as f:
                cached = pickle.load(f)
            
            # Check if cache is still valid
            cache_age = datetime.now() - cached['timestamp']
            if cache_age < timedelta(minutes=self.cache_duration_minutes):
                print(f"✓ Using cached data (age: {cache_age.seconds // 60} minutes)")
                return cached['data']
        
        return None
    
    def save_to_cache(self, cache_key, data):
        """Save data to cache"""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        cache_file.parent.mkdir(parents=True, exist_ok=True)  # Create subdirectories if needed
        cached = {
            'timestamp': datetime.now(),
            'data': data
        }
        with open(cache_file, 'wb') as f:
            pickle.dump(cached, f)
    
    def make_request(self, endpoint, params=None, estimated_credits=5):
        """Make API request with caching and rate limiting"""
        # Check cache first
        cache_key = self.get_cache_key(endpoint, params or {})
        cached_data = self.get_from_cache(cache_key)
        if cached_data is not None:
            return cached_data
        
        # Check if we can make request
        if not self.can_make_request(estimated_credits):
            print("⚠️  Using fallback: returning None (quota exceeded)")
            return None
        
        # Make request
        url = f"{self.base_url}/{endpoint}"
        params = params or {}
        params['apiKey'] = self.api_key
        
        print(f"📡 API Request: {endpoint} (est. {estimated_credits} credits)")
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            # Get actual credits used from response headers
            credits_used = int(response.headers.get('x-requests-used', estimated_credits))
            remaining = int(response.headers.get('x-requests-remaining', 0))
            
            print(f"✓ Success! Used {credits_used} credits, {remaining} remaining this month")
            
            # Update usage tracking
            self.usage['monthly_credits_remaining'] = remaining
            self.log_request(endpoint, credits_used)
            
            data = response.json()
            
            # Cache the response
            self.save_to_cache(cache_key, data)
            
            return data
            
        except Exception as e:
            print(f"✗ API Error: {e}")
            return None
    
    def get_sports(self):
        """Get list of available sports (1-2 credits)"""
        return self.make_request('sports', estimated_credits=2)
    
    def get_odds(self, sport='americanfootball_nfl', regions='us', markets='h2h,spreads', 
                 bookmakers=None):
        """
        Get odds for a sport (5-10 credits depending on bookmakers)
        
        Args:
            sport: Sport key (e.g., 'americanfootball_nfl', 'basketball_nba')
            regions: 'us', 'uk', 'eu', 'au'
            markets: 'h2h' (moneyline), 'spreads', 'totals', or comma-separated
            bookmakers: Comma-separated list of bookmaker keys (None = all)
        """
        params = {
            'regions': regions,
            'markets': markets
        }
        
        if bookmakers:
            params['bookmakers'] = bookmakers
        
        # More bookmakers = more credits
        estimated = 3 if bookmakers else 8
        
        return self.make_request(f'sports/{sport}/odds', params=params, 
                                estimated_credits=estimated)
    
    def get_usage_stats(self):
        """Get current usage statistics"""
        return {
            'today': {
                'requests': self.usage['requests_today'],
                'credits': self.usage['credits_today'],
                'limit': self.daily_credit_limit
            },
            'month': {
                'total_requests': self.usage['total_requests'],
                'total_credits': self.usage['total_credits_used'],
                'remaining': self.usage['monthly_credits_remaining'],
                'limit': 500
            },
            'last_reset': self.usage['last_reset']
        }
    
    def print_usage(self):
        """Print usage statistics"""
        stats = self.get_usage_stats()
        
        print("\n" + "="*60)
        print("The Odds API - Usage Statistics")
        print("="*60)
        print(f"\n📅 Today ({stats['last_reset']}):")
        print(f"   Requests: {stats['today']['requests']}")
        print(f"   Credits: {stats['today']['credits']} / {stats['today']['limit']} daily limit")
        
        print(f"\n📊 This Month:")
        print(f"   Total Requests: {stats['month']['total_requests']}")
        print(f"   Credits Used: {stats['month']['total_credits']}")
        print(f"   Credits Remaining: {stats['month']['remaining']} / {stats['month']['limit']}")
        
        # Progress bar
        used_pct = (500 - stats['month']['remaining']) / 500 * 100
        bar_length = 40
        filled = int(bar_length * used_pct / 100)
        bar = '█' * filled + '░' * (bar_length - filled)
        print(f"\n   [{bar}] {used_pct:.1f}% used")
        
        print("\n" + "="*60 + "\n")


def test_api(api_key):
    """Test the API with minimal credit usage"""
    client = OddsAPIClient(api_key)
    
    print("Testing The Odds API...")
    print("\nCurrent usage:")
    client.print_usage()
    
    # Test 1: Get sports list (1-2 credits)
    print("\n1️⃣  Fetching available sports...")
    sports = client.get_sports()
    
    if sports:
        print(f"✓ Found {len(sports)} sports")
        
        # Find NFL
        nfl = next((s for s in sports if s['key'] == 'americanfootball_nfl'), None)
        if nfl:
            print(f"   NFL: {nfl['title']} - Active: {nfl.get('active', False)}")
    
    # Test 2: Get NFL odds (conservative - only 2 bookmakers to save credits)
    print("\n2️⃣  Fetching NFL odds (limited bookmakers)...")
    odds = client.get_odds(
        sport='americanfootball_nfl',
        regions='us',
        markets='spreads',  # Just spreads for now
        bookmakers='fanduel,draftkings'  # Only 2 major books
    )
    
    if odds:
        print(f"✓ Found {len(odds)} NFL games")
        if len(odds) > 0:
            game = odds[0]
            print(f"\n   Example game:")
            print(f"   {game['away_team']} @ {game['home_team']}")
            print(f"   Starts: {game['commence_time']}")
            if game.get('bookmakers'):
                print(f"   Bookmakers: {len(game['bookmakers'])}")
    
    print("\nFinal usage:")
    client.print_usage()
    
    print("\n✅ API test complete!")
    print("💡 Tip: Cached responses are reused for 30 minutes to save credits")


if __name__ == '__main__':
    # Load API key from environment or config
    import os
    
    api_key = os.environ.get('ODDS_API_KEY')
    
    if not api_key:
        print("⚠️  ODDS_API_KEY environment variable not set")
        print("Set it with: export ODDS_API_KEY='your_key_here'")
        exit(1)
    
    test_api(api_key)
