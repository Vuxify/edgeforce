import { NextResponse } from 'next/server';

// This will integrate with the Python ML pipeline later
// For now, returns mock data structure

export async function GET() {
  // TODO: Call Python script or load from database
  // python3 ~/projects/edgeforce/ml/scripts/daily_picks.py basketball_nba
  
  const picks = [
    {
      id: 1,
      rank: 1,
      isPotd: true,
      sport: 'NBA',
      matchup: 'Brooklyn Nets @ Cleveland Cavaliers',
      pickTeam: 'Cleveland Cavaliers',
      pickLine: -13.5,
      odds: 1.89,
      oddsFormat: 'decimal',
      bookmaker: 'FanDuel',
      confidence: 60.9,
      edge: 8.01,
      gameTime: '2026-02-20T00:10:00Z',
      analysis: 'Strong home advantage. Cavaliers dominant at home with 15-2 record. Nets on 4-game road trip, tired legs.',
    },
    {
      id: 2,
      rank: 2,
      isPotd: false,
      sport: 'NBA',
      matchup: 'Atlanta Hawks @ Philadelphia 76ers',
      pickTeam: 'Philadelphia 76ers',
      pickLine: -4.5,
      odds: 1.93,
      oddsFormat: 'decimal',
      bookmaker: 'FanDuel',
      confidence: 58.4,
      edge: 6.60,
      gameTime: '2026-02-20T00:10:00Z',
      analysis: 'Embiid playing, 76ers favored at home. Hawks missing key defenders.',
    },
    {
      id: 3,
      rank: 3,
      isPotd: false,
      sport: 'NBA',
      matchup: 'Boston Celtics @ Golden State Warriors',
      pickTeam: 'Golden State Warriors',
      pickLine: 3.5,
      odds: 1.88,
      oddsFormat: 'decimal',
      bookmaker: 'FanDuel',
      confidence: 57.7,
      edge: 4.53,
      gameTime: '2026-02-20T03:10:00Z',
      analysis: 'Warriors undervalued at home. East coast team on West coast trip.',
    },
    {
      id: 4,
      rank: 4,
      isPotd: false,
      sport: 'NBA',
      matchup: 'Detroit Pistons @ New York Knicks',
      pickTeam: 'New York Knicks',
      pickLine: -3.0,
      odds: 1.94,
      oddsFormat: 'decimal',
      bookmaker: 'FanDuel',
      confidence: 56.0,
      edge: 4.50,
      gameTime: '2026-02-20T00:40:00Z',
      analysis: 'Knicks bounce-back spot after loss. Pistons weak on road.',
    },
  ];

  return NextResponse.json({
    success: true,
    generated_at: new Date().toISOString(),
    picks: picks,
    potd: picks[0],
    stats: {
      total_picks: picks.length,
      avg_confidence: picks.reduce((sum, p) => sum + p.confidence, 0) / picks.length,
      avg_edge: picks.reduce((sum, p) => sum + p.edge, 0) / picks.length,
    },
  });
}
