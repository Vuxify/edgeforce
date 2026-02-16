import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Pick {
  id: string
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL'
  game: string
  home_team: string
  away_team: string
  pick: string
  pick_type: 'spread' | 'moneyline' | 'over_under'
  odds: number
  confidence: number
  reasoning: string
  result: 'pending' | 'win' | 'loss' | 'push'
  posted_at: string
  game_time: string
  tier_required: 'free' | 'pro' | 'elite'
}

export interface Performance {
  id: string
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  wins: number
  losses: number
  pushes: number
  roi: number
  units_won: number
  calculated_at: string
}

// Helper functions
export async function getTodaysPicks(): Promise<Pick[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .gte('game_time', today.toISOString())
    .order('confidence', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getPerformanceStats(): Promise<Performance | null> {
  const { data, error } = await supabase
    .from('performance')
    .select('*')
    .eq('period', 'all_time')
    .single()
  
  if (error) throw error
  return data
}

export async function createPick(pick: Omit<Pick, 'id' | 'posted_at' | 'result'>): Promise<Pick> {
  const { data, error } = await supabase
    .from('picks')
    .insert([pick])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePickResult(pickId: string, result: 'win' | 'loss' | 'push'): Promise<void> {
  const { error } = await supabase
    .from('picks')
    .update({ result })
    .eq('id', pickId)
  
  if (error) throw error
}
