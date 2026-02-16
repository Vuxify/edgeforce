'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AltPick {
  id: number;
  sport: string;
  market_type: 'spread' | 'total' | 'moneyline';
  matchup: string;
  pick_team: string;
  pick_line: number;
  pick_description: string;
  odds: number;
  bookmaker: string;
  confidence: number;
  edge: number;
  gameTime: string;
}

interface AltPicksData {
  success: boolean;
  picks: AltPick[];
  picks_by_market: {
    spread: AltPick[];
    total: AltPick[];
    moneyline: AltPick[];
  };
  grouped_by_game: Record<string, AltPick[]>;
  total_picks: number;
  best_pick: AltPick | null;
}

export default function AlternativePicksPage() {
  const [data, setData] = useState<AltPicksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'spread' | 'total' | 'moneyline'>('all');
  const [groupBy, setGroupBy] = useState<'edge' | 'game'>('edge');

  useEffect(() => {
    fetch('/api/picks/alternative')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching alternative picks:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto text-center text-white">
          <div className="text-2xl">Loading alternative lines...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.success || data.picks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Alternative Lines</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center text-white">
            <div className="text-xl mb-4">📭 No alternative picks available yet</div>
            <div className="text-gray-400">
              Run <code className="bg-black/30 px-2 py-1 rounded">ml/scripts/generate_alternative_lines.py</code> to generate picks
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredPicks = filter === 'all' 
    ? data.picks 
    : data.picks_by_market[filter];

  const getMarketEmoji = (type: string) => {
    switch (type) {
      case 'spread': return '📈';
      case 'total': return '📊';
      case 'moneyline': return '💰';
      default: return '🎯';
    }
  };

  const getEdgeColor = (edge: number) => {
    if (edge >= 10) return 'text-green-400';
    if (edge >= 5) return 'text-blue-400';
    return 'text-yellow-400';
  };

  const getEdgeLabel = (edge: number) => {
    if (edge >= 10) return '🔥 ELITE';
    if (edge >= 5) return '✅ STRONG';
    return '✅ GOOD';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 Alternative Lines & Markets
          </h1>
          <p className="text-xl text-gray-300">
            Multiple betting options per game - spreads, totals, and moneylines
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
          >
            <div className="text-gray-400 text-sm mb-2">Total Picks</div>
            <div className="text-3xl font-bold text-white">{data.total_picks}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
          >
            <div className="text-gray-400 text-sm mb-2">📈 Spreads</div>
            <div className="text-3xl font-bold text-white">{data.picks_by_market.spread.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
          >
            <div className="text-gray-400 text-sm mb-2">📊 Totals</div>
            <div className="text-3xl font-bold text-white">{data.picks_by_market.total.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
          >
            <div className="text-gray-400 text-sm mb-2">💰 Moneylines</div>
            <div className="text-3xl font-bold text-white">{data.picks_by_market.moneyline.length}</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => setFilter('spread')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'spread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📈 Spreads
            </button>
            <button
              onClick={() => setFilter('total')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'total'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📊 Totals
            </button>
            <button
              onClick={() => setFilter('moneyline')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'moneyline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              💰 Moneylines
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setGroupBy('edge')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                groupBy === 'edge'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Sort by Edge
            </button>
            <button
              onClick={() => setGroupBy('game')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                groupBy === 'game'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Group by Game
            </button>
          </div>
        </div>

        {/* Best Pick Highlight */}
        {data.best_pick && filter === 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-8 border-2 border-yellow-500/50 mb-8 shadow-xl shadow-yellow-500/20"
          >
            <div className="text-yellow-400 text-sm font-bold mb-2 flex items-center gap-2">
              <span>⭐</span>
              <span>BEST PICK - HIGHEST EDGE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {getMarketEmoji(data.best_pick.market_type)} {data.best_pick.pick_description}
                </div>
                <div className="text-xl text-gray-300">{data.best_pick.matchup}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Confidence</div>
                  <div className="text-2xl font-bold text-white">{data.best_pick.confidence.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Edge</div>
                  <div className={`text-2xl font-bold ${getEdgeColor(data.best_pick.edge)}`}>
                    +{data.best_pick.edge.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Odds</div>
                  <div className="text-2xl font-bold text-white">{data.best_pick.odds.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">{data.best_pick.bookmaker}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Picks List/Grid */}
        {groupBy === 'edge' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPicks.slice(0, 50).map((pick, index) => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{getMarketEmoji(pick.market_type)}</div>
                  <div className="text-sm px-2 py-1 bg-blue-500/20 rounded text-blue-300 uppercase">
                    {pick.market_type}
                  </div>
                </div>

                <div className="text-xl font-bold text-white mb-2">{pick.pick_description}</div>
                <div className="text-sm text-gray-400 mb-4">{pick.matchup}</div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className="text-lg font-bold text-white">{pick.confidence.toFixed(1)}%</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${pick.confidence}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Edge</div>
                    <div className={`text-lg font-bold ${getEdgeColor(pick.edge)}`}>
                      +{pick.edge.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{getEdgeLabel(pick.edge)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-gray-400">Odds</div>
                    <div className="text-lg font-bold text-white">{pick.odds.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Book</div>
                    <div className="text-sm text-white">{pick.bookmaker}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(data.grouped_by_game).map(([game, picks]) => (
              <motion.div
                key={game}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6">{game}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {picks.map((pick) => (
                    <div
                      key={pick.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getMarketEmoji(pick.market_type)}</span>
                        <span className="text-sm text-gray-400 uppercase">{pick.market_type}</span>
                      </div>
                      <div className="text-lg font-bold text-white mb-1">{pick.pick_description}</div>
                      <div className="text-sm text-gray-400 mb-3">{pick.odds.toFixed(2)} ({pick.bookmaker})</div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-gray-500">Confidence</div>
                          <div className="text-sm font-bold text-white">{pick.confidence.toFixed(1)}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Edge</div>
                          <div className={`text-sm font-bold ${getEdgeColor(pick.edge)}`}>
                            +{pick.edge.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
