import { NextResponse } from 'next/server'
import { getPerformanceStats } from '@/lib/supabase'

export async function GET() {
  try {
    const stats = await getPerformanceStats()
    
    // If no stats exist, return mock data
    if (!stats) {
      return NextResponse.json({
        success: true,
        stats: {
          wins: 0,
          losses: 0,
          pushes: 0,
          roi: 0,
          units_won: 0
        }
      })
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
