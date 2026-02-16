'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'overview' | 'picks' | 'analytics'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [picks, setPicks] = useState([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [picksRes, statsRes] = await Promise.all([
        fetch('/api/picks'),
        fetch('/api/stats')
      ])
      
      const picksData = await picksRes.json()
      const statsData = await statsRes.json()
      
      setPicks(picksData.picks || [])
      setStats(statsData.stats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'admin-token=; Max-Age=0'
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0066FF]/10 to-[#00FF88]/10">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-[#00FF88] rounded-lg flex items-center justify-center">
                <span className="text-xl font-black text-white">EF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">EdgeForce Admin</h1>
                <p className="text-xs text-gray-400">Management Dashboard</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'picks', label: '🎯 Picks', icon: '🎯' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00FF88] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && <OverviewTab stats={stats} picks={picks} />}
            {activeTab === 'picks' && <PicksTab picks={picks} onRefresh={fetchData} />}
            {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
          </div>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ stats, picks }: any) {
  const todaysPicks = picks.filter((p: any) => {
    const gameTime = new Date(p.game_time)
    const today = new Date()
    return gameTime.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: stats ? `${((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)}%` : 'N/A', color: 'from-green-500 to-emerald-500' },
          { label: 'Total Picks', value: picks.length, color: 'from-blue-500 to-cyan-500' },
          { label: "Today's Picks", value: todaysPicks.length, color: 'from-purple-500 to-pink-500' },
          { label: 'ROI', value: stats ? `${stats.roi.toFixed(1)}%` : 'N/A', color: 'from-orange-500 to-yellow-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Picks */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Today's Picks</h2>
        {todaysPicks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No picks for today yet</p>
        ) : (
          <div className="space-y-3">
            {todaysPicks.map((pick: any) => (
              <div key={pick.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{pick.game}</p>
                    <p className="text-sm text-gray-400">{pick.pick} • {pick.confidence}% confidence</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pick.result === 'win' ? 'bg-green-500/20 text-green-400' :
                    pick.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {pick.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PicksTab({ picks, onRefresh }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Manage Picks</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[#0066FF] to-[#00FF88] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Create Pick
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Game</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Pick</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {picks.map((pick: any) => (
              <tr key={pick.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-white">{pick.game}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{pick.pick}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-semibold ${
                    pick.confidence >= 75 ? 'text-green-400' :
                    pick.confidence >= 60 ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {pick.confidence}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    pick.result === 'win' ? 'bg-green-500/20 text-green-400' :
                    pick.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {pick.result}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(pick.game_time).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsTab({ stats }: any) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    )
  }

  const winRate = ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win/Loss Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Win/Loss Record</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Wins</span>
                <span className="text-green-400 font-semibold">{stats.wins}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${(stats.wins / (stats.wins + stats.losses + stats.pushes)) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Losses</span>
                <span className="text-red-400 font-semibold">{stats.losses}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full"
                  style={{ width: `${(stats.losses / (stats.wins + stats.losses + stats.pushes)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Pushes</span>
                <span className="text-gray-400 font-semibold">{stats.pushes}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${(stats.pushes / (stats.wins + stats.losses + stats.pushes)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-2xl font-bold text-white">{winRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">ROI</span>
              <span className="text-2xl font-bold text-green-400">+{stats.roi.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Units Won</span>
              <span className="text-2xl font-bold text-blue-400">+{stats.units_won.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
