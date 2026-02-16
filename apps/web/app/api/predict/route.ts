import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

interface GameData {
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL'
  home_team: string
  away_team: string
  home_stats?: {
    win_rate: number
    ppg?: number
  }
  away_stats?: {
    win_rate: number
    ppg?: number
  }
  odds?: {
    spread?: number
    moneyline?: number
    over_under?: number
  }
}

export async function POST(request: Request) {
  try {
    const gameData: GameData = await request.json()
    
    // Validate input
    if (!gameData.sport || !gameData.home_team || !gameData.away_team) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Call Python ML model
    const prediction = await callPythonModel(gameData)
    
    return NextResponse.json({
      success: true,
      prediction: {
        ...prediction,
        game: `${gameData.home_team} vs ${gameData.away_team}`,
        sport: gameData.sport,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    )
  }
}

function callPythonModel(gameData: GameData): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), '..', '..', 'ml', 'scripts', 'predict.py')
    const gameDataJson = JSON.stringify(gameData)
    
    const pythonProcess = spawn('python3', [scriptPath, gameDataJson])
    
    let outputData = ''
    let errorData = ''
    
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${errorData}`))
        return
      }
      
      try {
        const result = JSON.parse(outputData)
        if (result.error) {
          reject(new Error(result.error))
        } else {
          resolve(result)
        }
      } catch (e) {
        reject(new Error('Failed to parse prediction output'))
      }
    })
  })
}

// GET endpoint for testing
export async function GET() {
  // Example prediction
  const exampleGame: GameData = {
    sport: 'NFL',
    home_team: 'Chiefs',
    away_team: '49ers',
    home_stats: { win_rate: 0.75, ppg: 28.5 },
    away_stats: { win_rate: 0.65, ppg: 24.3 }
  }
  
  try {
    const prediction = await callPythonModel(exampleGame)
    
    return NextResponse.json({
      success: true,
      message: 'Prediction API is working',
      example: {
        game: exampleGame,
        prediction
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Prediction model not available',
      message: 'Ensure Python 3 is installed and predict.py is accessible'
    }, { status: 500 })
  }
}
