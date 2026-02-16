import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface Game {
  id: string
  sport: string
  home_team: string
  away_team: string
  game_time: string
  status: 'scheduled' | 'live' | 'final'
  home_score?: number
  away_score?: number
}

// Mock games for development (real scraping would go here)
const mockGames: Game[] = [
  {
    id: 'nfl-chiefs-49ers',
    sport: 'NFL',
    home_team: 'Kansas City Chiefs',
    away_team: 'San Francisco 49ers',
    game_time: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'scheduled'
  },
  {
    id: 'nba-lakers-warriors',
    sport: 'NBA',
    home_team: 'Los Angeles Lakers',
    away_team: 'Golden State Warriors',
    game_time: new Date(Date.now() + 3600000 * 4).toISOString(),
    status: 'scheduled'
  },
  {
    id: 'mlb-yankees-redsox',
    sport: 'MLB',
    home_team: 'New York Yankees',
    away_team: 'Boston Red Sox',
    game_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'scheduled'
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase()
    const date = searchParams.get('date') // YYYY-MM-DD format
    
    // Filter games
    let games = mockGames
    
    if (sport) {
      games = games.filter(g => g.sport === sport)
    }
    
    if (date) {
      const targetDate = new Date(date)
      games = games.filter(g => {
        const gameDate = new Date(g.game_time)
        return gameDate.toDateString() === targetDate.toDateString()
      })
    }
    
    return NextResponse.json({
      success: true,
      games,
      count: games.length,
      note: 'Mock data - real scraping requires ESPN/Basketball-Reference integration'
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

// Helper function for real ESPN scraping (TODO)
async function scrapeESPNGames(sport: string): Promise<Game[]> {
  // Example: https://www.espn.com/nfl/schedule
  // Would use cheerio to parse HTML
  return []
}
