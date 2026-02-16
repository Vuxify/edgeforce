'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Pick {
  id: number;
  rank: number;
  isPotd: boolean;
  sport: string;
  matchup: string;
  pickTeam: string;
  pickLine: number;
  odds: number;
  oddsFormat: string;
  bookmaker: string;
  confidence: number;
  edge: number;
  gameTime: string;
  analysis: string;
}

interface PicksData {
  success: boolean;
  generated_at: string;
  picks: Pick[];
  potd: Pick;
  stats: {
    total_picks: number;
    avg_confidence: number;
    avg_edge: number;
  };
}

export default function PicksPage() {
  const [picks, setPicks] = useState<PicksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/picks/today')
      .then((res) => res.json())
      .then((data) => {
        setPicks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load picks:', err);
        setLoading(false);
      });
  }, []);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📌';
  };

  const getEdgeLabel = (edge: number) => {
    if (edge > 5) return { label: 'STRONG', color: 'text-green-400' };
    if (edge > 2) return { label: 'GOOD', color: 'text-blue-400' };
    return { label: 'WEAK', color: 'text-yellow-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066FF] mx-auto"></div>
            <p className="mt-4">Loading picks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!picks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <p>❌ Failed to load picks</p>
          </div>
        </div>
      </div>
    );
  }

  const potd = picks.potd;
  const edgeInfo = getEdgeLabel(potd.edge);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Today's Picks</h1>
          <p className="text-gray-400">
            Generated: {new Date(picks.generated_at).toLocaleString()}
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Picks</div>
            <div className="text-3xl font-bold text-white">{picks.stats.total_picks}</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Avg Confidence</div>
            <div className="text-3xl font-bold text-[#0066FF]">
              {picks.stats.avg_confidence.toFixed(1)}%
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Avg Edge</div>
            <div className="text-3xl font-bold text-[#00FF88]">
              +{picks.stats.avg_edge.toFixed(2)}%
            </div>
          </div>
        </motion.div>

        {/* Pick of the Day */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#0066FF]/20 to-[#00FF88]/20 border-2 border-[#FFD700] rounded-3xl p-8 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFD700]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0066FF]/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">⭐</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">PICK OF THE DAY</h2>
                    <p className="text-gray-300">{potd.sport}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(potd.gameTime).toLocaleTimeString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-2">Matchup</div>
                  <div className="text-xl text-white mb-4">{potd.matchup}</div>

                  <div className="text-gray-400 text-sm mb-2">Our Pick</div>
                  <div className="text-3xl font-bold text-[#FFD700] mb-2">
                    🎯 {potd.pickTeam} {potd.pickLine > 0 ? '+' : ''}
                    {potd.pickLine}
                  </div>

                  <div className="text-gray-400 text-sm">
                    Odds: {potd.odds.toFixed(2)} ({potd.bookmaker})
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confidence</span>
                      <span className="text-2xl font-bold text-white">
                        {potd.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0066FF] to-[#00FF88]"
                        style={{ width: `${potd.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Edge</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#00FF88]">
                          +{potd.edge.toFixed(2)}%
                        </div>
                        <div className={`text-xs font-bold ${edgeInfo.color}`}>
                          ✅ {edgeInfo.label}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">Analysis</div>
                <div className="text-white">{potd.analysis}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* All Picks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">All Picks (Ranked by Edge)</h2>
          <div className="space-y-4">
            {picks.picks.map((pick, index) => {
              const edgeInfo = getEdgeLabel(pick.edge);
              return (
                <motion.div
                  key={pick.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{getMedalEmoji(pick.rank)}</span>
                        <div>
                          <div className="text-sm text-gray-400">{pick.sport}</div>
                          <div className="text-lg text-white font-semibold">
                            {pick.matchup}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Pick</div>
                          <div className="text-white font-bold">
                            {pick.pickTeam} {pick.pickLine > 0 ? '+' : ''}
                            {pick.pickLine}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {pick.odds.toFixed(2)} ({pick.bookmaker})
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400 text-xs mb-1">Confidence</div>
                          <div className="text-[#0066FF] font-bold text-lg">
                            {pick.confidence.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400 text-xs mb-1">Edge</div>
                          <div className="text-[#00FF88] font-bold text-lg">
                            +{pick.edge.toFixed(2)}%
                          </div>
                          <div className={`text-xs font-bold ${edgeInfo.color}`}>
                            {edgeInfo.label}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400 text-xs mb-1">Game Time</div>
                          <div className="text-white text-sm">
                            {new Date(pick.gameTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-gray-400 text-sm">{pick.analysis}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
