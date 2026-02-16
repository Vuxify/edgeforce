'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add to waitlist
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0A0A0F] to-green-900/20" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10">
        {/* Header */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center font-bold text-xl">
                EF
              </div>
              <span className="text-2xl font-bold">EdgeForce</span>
            </div>
            <div className="flex gap-6">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
              <a href="#performance" className="hover:text-blue-400 transition-colors">Performance</a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-sm font-semibold border border-blue-600/30">
                🔥 67.3% Win Rate | +23.4% ROI This Month
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Beat Vegas.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-green-400 bg-clip-text text-transparent">
                Backed by AI.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              AI-powered sports betting predictions with proven results. Get data-driven picks,
              live injury analysis, and join a community of winners.
            </p>

            {/* Waitlist Form */}
            <div className="max-w-md mx-auto">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                  >
                    Join Waitlist
                  </button>
                </form>
              ) : (
                <div className="px-6 py-4 rounded-xl bg-green-600/20 border border-green-600/30 text-green-400 font-semibold">
                  ✅ You're on the list! Check your email.
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3">
                Join 2,847 bettors on the waitlist
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Win Rate', value: '67.3%', change: '+5.2%' },
              { label: 'ROI', value: '+23.4%', change: '+8.1%' },
              { label: 'Total Picks', value: '1,247', change: '+127' },
              { label: 'Avg Confidence', value: '78%', change: '+3%' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-green-400">{stat.change} this month</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-xl text-gray-400">
              Powered by AI. Trusted by thousands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Predictions',
                description: 'Advanced machine learning analyzes thousands of data points to find profitable betting opportunities.',
              },
              {
                icon: '📊',
                title: 'Real-Time Analytics',
                description: 'Live odds tracking, injury updates, and weather conditions updated every minute.',
              },
              {
                icon: '💎',
                title: 'Parlay Builder',
                description: 'Smart parlay suggestions with optimal risk/reward ratios. Maximize your wins.',
              },
              {
                icon: '🚨',
                title: 'Injury Alerts',
                description: 'Instant notifications when key players are ruled out. Adjust your bets in real-time.',
              },
              {
                icon: '💬',
                title: 'Discord Community',
                description: 'Join thousands of winners. Share strategies, celebrate wins, learn from the best.',
              },
              {
                icon: '📈',
                title: 'Performance Tracking',
                description: 'Track every pick, every result. Full transparency with detailed ROI reports.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Edge
            </h2>
            <p className="text-xl text-gray-400">
              Start free. Upgrade when you're ready to dominate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                features: [
                  '1 pick per day',
                  'Public performance stats',
                  'Community Discord access',
                  'Basic injury alerts',
                ],
                cta: 'Start Free',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                features: [
                  '5-10 picks per day',
                  'All sports coverage',
                  'Parlay builder',
                  'Priority Discord channel',
                  'Live injury updates',
                  'Email alerts',
                ],
                cta: 'Go Pro',
                popular: true,
              },
              {
                name: 'Elite',
                price: '$99',
                period: '/month',
                features: [
                  'Unlimited picks',
                  'Live game adjustments',
                  'VIP Discord access',
                  '1-on-1 strategy calls',
                  'Custom parlay builder',
                  'Priority support',
                  'API access',
                ],
                cta: 'Get Elite',
                popular: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-2xl border transition-all hover:scale-105 ${
                  tier.popular
                    ? 'bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                }`}
              >
                {tier.popular && (
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-gray-400">{tier.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Join the Winners
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { quote: 'Up $2,400 in my first month. EdgeForce is the real deal.', author: '@BetMikeNYC' },
                { quote: 'Best betting tool I\'ve ever used. The injury alerts alone are worth it.', author: '@SharpSportsBets' },
                { quote: '67% win rate speaks for itself. Finally found an edge.', author: '@VegasKiller23' },
              ].map((testimonial) => (
                <div key={testimonial.author} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <p className="text-blue-400 font-semibold">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-blue-600/30 to-green-600/20 border border-blue-500/50 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Winning?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the waitlist and get 7 days free when we launch.
            </p>
            <button className="px-12 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50">
              Join Waitlist - It's Free
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center font-bold">
                EF
              </div>
              <span className="text-xl font-bold">EdgeForce</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 EdgeForce. All rights reserved.
            </div>
          </div>
          <div className="mt-8 p-4 rounded-lg bg-yellow-600/10 border border-yellow-600/30 text-yellow-200 text-sm text-center">
            <strong>Disclaimer:</strong> EdgeForce provides sports analysis for entertainment purposes only. 
            Gambling involves risk. Past performance does not guarantee future results. Must be 21+.
          </div>
        </footer>
      </div>
    </div>
  )
}
