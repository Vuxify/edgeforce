# 🤖 EdgeForce Discord Bot Setup Guide

## Step 1: Create Discord Bot

### A. Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: **EdgeForce**
4. Click **"Create"**

### B. Get Your Bot Token
1. Click **"Bot"** in left sidebar
2. Click **"Reset Token"** and copy it
   - ⚠️ Save this! You'll need it in Step 3
   - Token looks like: `MTIzNDU2Nzg5MDEyMzQ1Njc4.GaBcDe.FgHiJkLmNoPqRsTuVwXyZ...`

### C. Get Your Application ID
1. Click **"General Information"** in left sidebar
2. Copy your **Application ID** (under "Application ID")
   - Looks like: `1234567890123456789`

### D. Enable Intents
1. Click **"Bot"** in left sidebar
2. Scroll down to **"Privileged Gateway Intents"**
3. Enable:
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT**

### E. Invite Bot to Your Server
1. Click **"OAuth2"** → **"URL Generator"** in left sidebar
2. Select **SCOPES**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select **BOT PERMISSIONS**:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Use Slash Commands
4. Copy the **Generated URL** at bottom
5. Open URL in browser and invite bot to your server

---

## Step 2: Get Your Channel ID

### A. Enable Developer Mode
1. Open **Discord Settings** (gear icon)
2. Go to **Advanced**
3. Enable **Developer Mode**

### B. Get Channel ID
1. Go to your server
2. Create a channel called **#picks** (or use existing)
3. Right-click the channel
4. Click **"Copy Channel ID"**
   - Save this! You'll need it in Step 3

---

## Step 3: Configure Bot Environment

Paste your credentials below (I'll create the .env file):

```bash
DISCORD_BOT_TOKEN=<your-bot-token>
DISCORD_CLIENT_ID=<your-application-id>
PICKS_CHANNEL_ID=<your-channel-id>
API_BASE_URL=https://edgeforce-three.vercel.app
```

---

## Step 4: I'll Handle

Once you give me the credentials, I'll:
1. ✅ Create `.env` file with your credentials
2. ✅ Install bot dependencies
3. ✅ Test bot connection
4. ✅ Register slash commands (`/pick`, `/picks`, `/stats`)
5. ✅ Schedule daily picks post (9 AM)
6. ✅ Run bot locally or deploy to hosting

---

## What You Need to Give Me

**3 values:**
1. **Bot Token** (from Developer Portal → Bot)
2. **Application ID** (from Developer Portal → General Information)
3. **Channel ID** (from right-clicking your #picks channel)

**Example:**
```
Token: MTIzNDU2Nzg5MDEyMzQ1Njc4.GaBcDe.FgHiJkLmNoPqRsTuVwXyZ...
App ID: 1234567890123456789
Channel ID: 9876543210987654321
```

---

## Quick Setup Commands (For Me)

Once you provide credentials, I'll run:

```bash
# Create .env file
cd ~/projects/edgeforce/bot
cat > .env << 'EOF'
DISCORD_BOT_TOKEN=<token>
DISCORD_CLIENT_ID=<app-id>
PICKS_CHANNEL_ID=<channel-id>
API_BASE_URL=https://edgeforce-three.vercel.app
EOF

# Install dependencies
npm install

# Test bot
node index.js

# Deploy (optional - Railway/Heroku/VPS)
```

---

## Bot Features

Once live, your bot will:

### Slash Commands
- `/pick` - Get today's top pick
- `/picks` - View all today's picks (top 5)
- `/stats` - View EdgeForce performance stats

### Automated Posts
- **9 AM Daily** - Posts top 3 picks to #picks channel
- Beautiful embeds with:
  - Pick details (team, spread, odds)
  - Confidence score (color-coded)
  - Game time
  - Analysis

### Example Output
```
🚀 Daily Picks Are Live!

🔥 NBA Pick
Charlotte Hornets @ Houston Rockets

🎯 Pick: Charlotte Hornets +2.0
📊 Confidence: 63.7%
💰 Odds: 1.93
🧠 Analysis: Fixed NBA model (61.94% WR, 18.24% ROI)...
⏰ Game Time: Feb 20, 2026, 12:10 AM
🏆 Tier: FREE
```

---

## Ready When You Are!

**Paste your 3 credentials and I'll set everything up in 2 minutes!** 🚀
