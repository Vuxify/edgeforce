import { NextResponse } from 'next/server'
import { getTodaysPicks } from '@/lib/supabase'

export async function GET() {
  try {
    const picks = await getTodaysPicks()
    
    return NextResponse.json({
      success: true,
      picks,
      count: picks.length
    })
  } catch (error) {
    console.error('Error fetching picks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch picks' },
      { status: 500 }
    )
  }
}
