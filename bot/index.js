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
function createPickEmbed(pick) {
  const confidenceColor = pick.confidence >= 75 ? 0x00FF88 : 
                           pick.confidence >= 60 ? 0x0066FF : 0xFFD700

  return new EmbedBuilder()
    .setTitle(`🔥 ${pick.sport} Pick`)
    .setDescription(`**${pick.game}**`)
    .setColor(confidenceColor)
    .addFields(
      { name: '🎯 Pick', value: pick.pick, inline: true },
      { name: '📊 Confidence', value: `${pick.confidence}%`, inline: true },
      { name: '💰 Odds', value: String(pick.odds), inline: true },
      { name: '🧠 Analysis', value: pick.reasoning || 'Based on advanced analytics' },
      { name: '⏰ Game Time', value: new Date(pick.game_time).toLocaleString(), inline: true },
      { name: '🏆 Tier', value: pick.tier_required.toUpperCase(), inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'EdgeForce | Beat Vegas. Backed by AI.' })
}

// Create performance stats embed
function createStatsEmbed(stats) {
  const winRate = ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
  
  return new EmbedBuilder()
    .setTitle('📊 EdgeForce Performance Stats')
    .setColor(0x0066FF)
    .addFields(
      { name: '🏆 Win Rate', value: `${winRate}%`, inline: true },
      { name: '💰 ROI', value: `${stats.roi.toFixed(1)}%`, inline: true },
      { name: '📈 Units Won', value: `+${stats.units_won.toFixed(1)}`, inline: true },
      { name: '✅ Wins', value: String(stats.wins), inline: true },
      { name: '❌ Losses', value: String(stats.losses), inline: true },
      { name: '➖ Pushes', value: String(stats.pushes), inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'All-time performance' })
}

// Fetch picks from API
async function fetchTodaysPicks() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/picks`)
    const data = await response.json()
    return data.picks || []
  } catch (error) {
    console.error('Error fetching picks:', error)
    return []
  }
}

// Fetch stats from API
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`)
    const data = await response.json()
    return data.stats
  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  }
}

// Post daily picks to channel
async function postDailyPicks() {
  try {
    const picks = await fetchTodaysPicks()
    const channel = client.channels.cache.get(PICKS_CHANNEL_ID)
    
    if (!channel) {
      console.error('Picks channel not found')
      return
    }

    if (picks.length === 0) {
      await channel.send('📭 No picks for today. Model found no profitable opportunities.')
      return
    }

    // Post top 3 picks
    const topPicks = picks.slice(0, 3)
    
    await channel.send('🚀 **Daily Picks Are Live!**')
    
    for (const pick of topPicks) {
      const embed = createPickEmbed(pick)
      await channel.send({ embeds: [embed] })
    }

    console.log(`Posted ${topPicks.length} picks to Discord`)
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
      .setName('stats')
      .setDescription('View EdgeForce performance statistics'),
    
    new SlashCommandBuilder()
      .setName('picks')
      .setDescription('View all today\'s picks'),
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
      const picks = await fetchTodaysPicks()
      
      if (picks.length === 0) {
        await interaction.reply('📭 No picks available today.')
        return
      }

      const topPick = picks[0]
      const embed = createPickEmbed(topPick)
      
      await interaction.reply({ embeds: [embed] })
    }

    if (interaction.commandName === 'picks') {
      const picks = await fetchTodaysPicks()
      
      if (picks.length === 0) {
        await interaction.reply('📭 No picks available today.')
        return
      }

      const embeds = picks.slice(0, 5).map(pick => createPickEmbed(pick))
      await interaction.reply({ embeds })
    }

    if (interaction.commandName === 'stats') {
      const stats = await fetchStats()
      
      if (!stats) {
        await interaction.reply('❌ Unable to fetch stats.')
        return
      }

      const embed = createStatsEmbed(stats)
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
