import { NextResponse } from 'next/response';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // For now, read from a static JSON file (like picks-today.json)
    // In production, this would run the Python alternative lines generator
    const altPicksPath = path.join(process.cwd(), 'public', 'alt-picks-today.json');
    
    // Check if file exists
    if (!fs.existsSync(altPicksPath)) {
      console.log('Alternative picks file not found, returning demo data');
      
      // Return demo structure
      return NextResponse.json({
        success: true,
        generated_at: new Date().toISOString(),
        message: 'Alternative picks coming soon! Run ml/scripts/generate_alternative_lines.py to generate.',
        picks: [],
        picks_by_market: {
          spread: [],
          total: [],
          moneyline: []
        },
        grouped_by_game: {},
        total_picks: 0
      });
    }

    // Read and parse alternative picks
    const picksData = fs.readFileSync(altPicksPath, 'utf-8');
    const altPicks = JSON.parse(picksData);

    return NextResponse.json(altPicks);
  } catch (error: any) {
    console.error('Error reading alternative picks:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load alternative picks',
      generated_at: new Date().toISOString(),
      picks: [],
      picks_by_market: {
        spread: [],
        total: [],
        moneyline: []
      },
      grouped_by_game: {},
      total_picks: 0
    });
  }
}
