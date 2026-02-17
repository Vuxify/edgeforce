import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read parlay from static JSON file
    const parlayPath = path.join(process.cwd(), 'public', 'parlay-today.json');
    
    // Check if file exists
    if (!fs.existsSync(parlayPath)) {
      console.log('Parlay file not found');
      
      return NextResponse.json({
        success: false,
        message: 'Parlay not available yet. Run ml/scripts/generate_parlay.py to generate.',
        parlay: null
      });
    }

    // Read and parse parlay
    const parlayData = fs.readFileSync(parlayPath, 'utf-8');
    const parlay = JSON.parse(parlayData);

    return NextResponse.json({
      success: true,
      parlay: parlay
    });
  } catch (error: any) {
    console.error('Error reading parlay:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to load parlay',
      parlay: null
    });
  }
}
