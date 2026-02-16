import { NextResponse } from 'next/server'

interface Odds {
  game_id: string
  bookmaker: string
  spread: {
    home: number
    away: number
    odds: number
  }
  moneyline: {
    home: number
    away: number
  }
  total: {
    over: number
    under: number
    odds: number
  }
  last_update: string
}

// Mock odds data (real implementation would use The Odds API or scraping)
const mockOdds: Record<string, Odds[]> = {
  'nfl-chiefs-49ers': [
    {
      game_id: 'nfl-chiefs-49ers',
      bookmaker: 'DraftKings',
      spread: { home: -3.5, away: 3.5, odds: -110 },
      moneyline: { home: -180, away: +150 },
      total: { over: 47.5, under: 47.5, odds: -110 },
      last_update: new Date().toISOString()
    },
    {
      game_id: 'nfl-chiefs-49ers',
      bookmaker: 'FanDuel',
      spread: { home: -3, away: 3, odds: -110 },
      moneyline: { home: -175, away: +145 },
      total: { over: 48, under: 48, odds: -110 },
      last_update: new Date().toISOString()
    }
  ],
  'nba-lakers-warriors': [
    {
      game_id: 'nba-lakers-warriors',
      bookmaker: 'DraftKings',
      spread: { home: -5.5, away: 5.5, odds: -110 },
      moneyline: { home: -220, away: +180 },
      total: { over: 225.5, under: 225.5, odds: -110 },
      last_update: new Date().toISOString()
    }
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('game_id')
    
    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'game_id parameter required' },
        { status: 400 }
      )
    }
    
    const odds = mockOdds[gameId] || []
    
    // Calculate consensus line (average across bookmakers)
    const consensus = calculateConsensus(odds)
    
    return NextResponse.json({
      success: true,
      game_id: gameId,
      odds,
      consensus,
      note: 'Mock data - production requires The Odds API subscription ($29/month)'
    })
  } catch (error) {
    console.error('Error fetching odds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch odds' },
      { status: 500 }
    )
  }
}

function calculateConsensus(odds: Odds[]) {
  if (odds.length === 0) return null
  
  const avgSpread = odds.reduce((sum, o) => sum + o.spread.home, 0) / odds.length
  const avgTotal = odds.reduce((sum, o) => sum + o.total.over, 0) / odds.length
  
  return {
    spread: avgSpread.toFixed(1),
    total: avgTotal.toFixed(1),
    bookmakers: odds.length
  }
}

// Real implementation would use The Odds API
// API: https://the-odds-api.com/
// Example:
// const response = await fetch(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${key}`)
