import { NextResponse } from 'next/server'

interface TeamStats {
  team_id: string
  team_name: string
  sport: string
  season: string
  wins: number
  losses: number
  win_rate: number
  points_per_game: number
  points_allowed_per_game: number
  home_record: string
  away_record: string
  last_10: string
  streak: string
  updated_at: string
}

// Mock team stats (real implementation would scrape Basketball-Reference, Pro-Football-Reference, etc.)
const mockStats: Record<string, TeamStats> = {
  'chiefs': {
    team_id: 'chiefs',
    team_name: 'Kansas City Chiefs',
    sport: 'NFL',
    season: '2024',
    wins: 12,
    losses: 3,
    win_rate: 0.80,
    points_per_game: 28.5,
    points_allowed_per_game: 19.2,
    home_record: '7-1',
    away_record: '5-2',
    last_10: '8-2',
    streak: 'W3',
    updated_at: new Date().toISOString()
  },
  '49ers': {
    team_id: '49ers',
    team_name: 'San Francisco 49ers',
    sport: 'NFL',
    season: '2024',
    wins: 10,
    losses: 5,
    win_rate: 0.67,
    points_per_game: 24.3,
    points_allowed_per_game: 21.8,
    home_record: '6-2',
    away_record: '4-3',
    last_10: '6-4',
    streak: 'L1',
    updated_at: new Date().toISOString()
  },
  'lakers': {
    team_id: 'lakers',
    team_name: 'Los Angeles Lakers',
    sport: 'NBA',
    season: '2024-25',
    wins: 35,
    losses: 28,
    win_rate: 0.56,
    points_per_game: 112.4,
    points_allowed_per_game: 110.1,
    home_record: '20-11',
    away_record: '15-17',
    last_10: '6-4',
    streak: 'W2',
    updated_at: new Date().toISOString()
  },
  'warriors': {
    team_id: 'warriors',
    team_name: 'Golden State Warriors',
    sport: 'NBA',
    season: '2024-25',
    wins: 32,
    losses: 31,
    win_rate: 0.51,
    points_per_game: 110.8,
    points_allowed_per_game: 111.2,
    home_record: '18-14',
    away_record: '14-17',
    last_10: '5-5',
    streak: 'L1',
    updated_at: new Date().toISOString()
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('team_id')
    
    if (!teamId) {
      // Return all teams
      return NextResponse.json({
        success: true,
        teams: Object.values(mockStats),
        count: Object.keys(mockStats).length,
        note: 'Mock data - production requires Basketball-Reference/Pro-Football-Reference scraping'
      })
    }
    
    const stats = mockStats[teamId.toLowerCase()]
    
    if (!stats) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

// Real implementation examples:
// NFL: https://www.pro-football-reference.com/teams/kan/2024.htm
// NBA: https://www.basketball-reference.com/teams/LAL/2025.html
// MLB: https://www.baseball-reference.com/teams/NYY/2024.shtml
