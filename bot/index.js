require('dotenv').config()
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js')
const cron = require('node-cron')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

// Configuration
const PICKS_CHANNEL_ID = process.env.PICKS_CHANNEL_ID
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

// Create embed for a pick
function createPickEmbed(pick, isPotd = false) {
  const confidenceColor = pick.confidence >= 70 ? 0x00FF88 : 
                           pick.confidence >= 60 ? 0x0066FF : 0xFFD700

  const medal = isPotd ? '⭐' : pick.rank === 1 ? '🥇' : pick.rank === 2 ? '🥈' : pick.rank === 3 ? '🥉' : '📌'
  const edgeLabel = pick.edge >= 5 ? '✅ STRONG' : '✅ GOOD'

  return new EmbedBuilder()
    .setTitle(`${medal} ${pick.sport} Pick ${isPotd ? '- PICK OF THE DAY' : `#${pick.rank}`}`)
    .setDescription(`**${pick.matchup}**`)
    .setColor(confidenceColor)
    .addFields(
      { name: '🎯 Pick', value: `${pick.pickTeam} ${pick.pickLine > 0 ? '+' : ''}${pick.pickLine}`, inline: true },
      { name: '📊 Confidence', value: `${pick.confidence.toFixed(1)}%`, inline: true },
      { name: '💰 Odds', value: `${pick.odds.toFixed(2)} (${pick.bookmaker})`, inline: true },
      { name: '📈 Edge', value: `+${pick.edge.toFixed(2)}% ${edgeLabel}`, inline: true },
      { name: '⏰ Game Time', value: new Date(pick.gameTime).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }), inline: true },
      { name: '🏆 Tier', value: 'FREE', inline: true },
      { name: '🧠 Analysis', value: pick.analysis || 'Based on advanced ML models' }
    )
    .setTimestamp()
    .setFooter({ text: 'EdgeForce | Beat Vegas with Data' })
}

// Create performance stats embed
function createStatsEmbed(stats, modelStats) {
  return new EmbedBuilder()
    .setTitle('📊 EdgeForce Performance Stats')
    .setColor(0x0066FF)
    .setDescription('**Production ML Model Performance**')
    .addFields(
      { name: '🏆 Model Win Rate', value: modelStats.win_rate, inline: true },
      { name: '💰 Model ROI', value: modelStats.roi, inline: true },
      { name: '📈 Backtest', value: modelStats.backtest, inline: true },
      { name: '📊 Today\'s Picks', value: String(stats.total_picks), inline: true },
      { name: '💪 Avg Confidence', value: `${stats.avg_confidence.toFixed(1)}%`, inline: true },
      { name: '📈 Avg Edge', value: `+${stats.avg_edge.toFixed(2)}%`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'NBA Model: 61.94% WR, 18.24% ROI | NFL Model: 59.01% WR, 12.65% ROI' })
}

// Fetch picks from API
async function fetchTodaysPicks() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/picks/today`)
    const data = await response.json()
    
    if (!data.success) {
      console.log('No picks available:', data.message || 'Unknown error')
      return { picks: [], potd: null, stats: null, modelStats: null }
    }
    
    return {
      picks: data.picks || [],
      potd: data.potd || null,
      stats: data.stats || null,
      modelStats: data.model_stats || null
    }
  } catch (error) {
    console.error('Error fetching picks:', error)
    return { picks: [], potd: null, stats: null, modelStats: null }
  }
}

// Fetch alternative lines from API
async function fetchAlternativePicks() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/picks/alternative`)
    const data = await response.json()
    
    if (!data.success) {
      console.log('No alternative picks available:', data.message || 'Unknown error')
      return { picks: [], groupedByGame: {}, markets: {} }
    }
    
    return {
      picks: data.picks || [],
      groupedByGame: data.grouped_by_game || {},
      markets: data.picks_by_market || {}
    }
  } catch (error) {
    console.error('Error fetching alternative picks:', error)
    return { picks: [], groupedByGame: {}, markets: {} }
  }
}

// Create embed for alternative pick
function createAltPickEmbed(pick) {
  const confidenceColor = pick.confidence >= 70 ? 0x00FF88 : 
                           pick.confidence >= 60 ? 0x0066FF : 0xFFD700

  const marketEmoji = {
    'spread': '📈',
    'total': '📊',
    'moneyline': '💰'
  }

  const edgeLabel = pick.edge >= 5 ? '✅ STRONG' : '✅ GOOD'

  return new EmbedBuilder()
    .setTitle(`${marketEmoji[pick.market_type] || '🎯'} ${pick.market_type.toUpperCase()} Pick`)
    .setDescription(`**${pick.matchup}**`)
    .setColor(confidenceColor)
    .addFields(
      { name: '🎯 Pick', value: pick.pick_description, inline: true },
      { name: '💰 Odds', value: `${pick.odds.toFixed(2)} (${pick.bookmaker})`, inline: true },
      { name: '📊 Confidence', value: `${pick.confidence.toFixed(1)}%`, inline: true },
      { name: '📈 Edge', value: `+${pick.edge.toFixed(2)}% ${edgeLabel}`, inline: true },
      { name: '🔍 Type', value: pick.market_type.toUpperCase(), inline: true },
      { name: '⏰ Game Time', value: new Date(pick.gameTime).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }), inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'EdgeForce | Multiple betting options per game' })
}

// Post daily picks to channel
async function postDailyPicks() {
  try {
    const { picks, potd } = await fetchTodaysPicks()
    const channel = client.channels.cache.get(PICKS_CHANNEL_ID)
    
    if (!channel) {
      console.error('Picks channel not found')
      return
    }

    if (picks.length === 0) {
      await channel.send('📭 **No picks for today.** Model found no profitable opportunities with sufficient edge.')
      return
    }

    // Post header
    await channel.send({
      content: '🚀 **DAILY PICKS ARE LIVE!**\n\n' +
               '**EdgeForce NBA Model:** 61.94% Win Rate | 18.24% ROI\n' +
               '**Based on 1,755+ backtested games**\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    })
    
    // Post Pick of the Day
    if (potd) {
      const potdEmbed = createPickEmbed(potd, true)
      await channel.send({ embeds: [potdEmbed] })
    }

    // Post top 3-5 picks
    const additionalPicks = picks.slice(0, Math.min(5, picks.length))
    
    for (const pick of additionalPicks) {
      if (pick.id !== potd?.id) { // Don't duplicate POTD
        const embed = createPickEmbed(pick, false)
        await channel.send({ embeds: [embed] })
      }
    }

    console.log(`✅ Posted ${additionalPicks.length} picks to Discord`)
  } catch (error) {
    console.error('Error posting daily picks:', error)
  }
}

// Register slash commands
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('pick')
      .setDescription('Get today\'s top pick'),
    
    new SlashCommandBuilder()
      .setName('picks')
      .setDescription('View all today\'s picks'),
    
    new SlashCommandBuilder()
      .setName('altpicks')
      .setDescription('View alternative lines (spreads, totals, moneylines)')
      .addStringOption(option =>
        option.setName('game')
          .setDescription('Filter by team name (optional)')
          .setRequired(false)),
    
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('View EdgeForce performance statistics'),
  ].map(cmd => cmd.toJSON())

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN)

  try {
    console.log('Registering slash commands...')
    
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    )

    console.log('✅ Slash commands registered')
  } catch (error) {
    console.error('Error registering commands:', error)
  }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  try {
    if (interaction.commandName === 'pick') {
      const { potd, picks } = await fetchTodaysPicks()
      
      if (!potd && picks.length === 0) {
        await interaction.reply('📭 No picks available today.')
        return
      }

      const topPick = potd || picks[0]
      const embed = createPickEmbed(topPick, true)
      
      await interaction.reply({ embeds: [embed] })
    }

    if (interaction.commandName === 'picks') {
      const { picks } = await fetchTodaysPicks()
      
      if (picks.length === 0) {
        await interaction.reply('📭 No picks available today.')
        return
      }

      const embeds = picks.slice(0, 5).map(pick => createPickEmbed(pick, false))
      await interaction.reply({ embeds })
    }

    if (interaction.commandName === 'altpicks') {
      const gameFilter = interaction.options.getString('game')
      const { picks, markets } = await fetchAlternativePicks()
      
      if (picks.length === 0) {
        await interaction.reply('📭 No alternative picks available today. Check back later!')
        return
      }

      // Filter by game if specified
      let filteredPicks = picks
      if (gameFilter) {
        filteredPicks = picks.filter(p => 
          p.matchup.toLowerCase().includes(gameFilter.toLowerCase())
        )
        
        if (filteredPicks.length === 0) {
          await interaction.reply(`📭 No picks found for "${gameFilter}". Try a team name like "Lakers" or "Celtics".`)
          return
        }
      }

      // Show top 10 alternative picks
      const topAlts = filteredPicks.slice(0, 10)
      
      // Create header message
      let headerMsg = '🎯 **ALTERNATIVE LINES & BET TYPES**\n\n'
      headerMsg += `Showing ${topAlts.length} picks `
      if (gameFilter) headerMsg += `for "${gameFilter}" `
      headerMsg += 'across multiple markets:\n'
      headerMsg += '📈 Spreads | 📊 Totals | 💰 Moneylines\n'
      headerMsg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
      
      // Group picks by market for summary
      const spreadCount = topAlts.filter(p => p.market_type === 'spread').length
      const totalCount = topAlts.filter(p => p.market_type === 'total').length
      const mlCount = topAlts.filter(p => p.market_type === 'moneyline').length
      
      headerMsg += `📊 Breakdown: ${spreadCount} spreads, ${totalCount} totals, ${mlCount} moneylines`
      
      await interaction.reply({ content: headerMsg })
      
      // Send embeds (max 5 at a time due to Discord limits)
      const embedsToSend = topAlts.slice(0, 5).map(pick => createAltPickEmbed(pick))
      
      await interaction.followUp({ embeds: embedsToSend })
      
      // If more than 5, send another batch
      if (topAlts.length > 5) {
        const moreEmbeds = topAlts.slice(5, 10).map(pick => createAltPickEmbed(pick))
        await interaction.followUp({ embeds: moreEmbeds })
      }
    }

    if (interaction.commandName === 'stats') {
      const { stats, modelStats } = await fetchTodaysPicks()
      
      if (!stats || !modelStats) {
        await interaction.reply('❌ Unable to fetch stats.')
        return
      }

      const embed = createStatsEmbed(stats, modelStats)
      await interaction.reply({ embeds: [embed] })
    }
  } catch (error) {
    console.error('Error handling command:', error)
    await interaction.reply({ content: '❌ An error occurred.', ephemeral: true })
  }
})

// Bot ready event
client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`)
  
  // Register commands
  await registerCommands()

  // Schedule daily picks post at 9 AM (adjust timezone as needed)
  cron.schedule('0 9 * * *', postDailyPicks, {
    timezone: 'America/Chicago'
  })

  console.log('🔄 Daily picks scheduled for 9 AM')
})

// Error handling
client.on('error', console.error)
process.on('unhandledRejection', console.error)

// Login
client.login(process.env.DISCORD_BOT_TOKEN)
