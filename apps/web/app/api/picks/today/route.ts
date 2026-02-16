import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read picks from static JSON file
    const picksPath = path.join(process.cwd(), 'public', 'picks-today.json');
    
    // Check if file exists
    if (!fs.existsSync(picksPath)) {
      console.log('Picks file not found, returning default message');
      return NextResponse.json({
        success: true,
        generated_at: new Date().toISOString(),
        message: 'No picks generated yet. Run: ml/scripts/update-picks.sh',
        picks: [],
        potd: null,
        stats: {
          total_picks: 0,
          avg_confidence: 0,
          avg_edge: 0
        }
      });
    }

    // Read and parse picks
    const picksData = fs.readFileSync(picksPath, 'utf-8');
    const picks = JSON.parse(picksData);

    return NextResponse.json(picks);
  } catch (error: any) {
    console.error('Error reading picks:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load picks',
      generated_at: new Date().toISOString(),
      picks: [],
      potd: null,
      stats: {
        total_picks: 0,
        avg_confidence: 0,
        avg_edge: 0
      }
    });
  }
}
