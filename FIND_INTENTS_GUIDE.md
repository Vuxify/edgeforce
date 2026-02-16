# 🎯 Finding the Privileged Gateway Intents - Step by Step

## Step 1: Open Discord Developer Portal
**Link:** https://discord.com/developers/applications

You should see:
```
Applications
├── EdgeForce (your app)
```

Click on **EdgeForce**

---

## Step 2: Navigate to Bot Settings
On the **LEFT SIDEBAR**, you'll see:

```
┌─────────────────────────┐
│ General Information     │
│ Bot                     │  ← CLICK HERE!
│ OAuth2                  │
│ URL Generator           │
│ Rich Presence           │
└─────────────────────────┘
```

Click **"Bot"** in the left sidebar.

---

## Step 3: Scroll Down the Bot Page

Once you're on the Bot page, **scroll down** past these sections:
1. ❌ Token (at top - you already have this)
2. ❌ Public Bot toggle
3. ❌ Authorization Flow
4. ⬇️ **KEEP SCROLLING...**

---

## Step 4: Find "Privileged Gateway Intents"

You'll see a section that looks like this:

```
═══════════════════════════════════════════
Privileged Gateway Intents
═══════════════════════════════════════════

⚠️  These intents are privileged and require approval
    if your bot is in 75+ servers.

┌─────────────────────────────────────────┐
│ ○ PRESENCE INTENT                       │
│   (Leave this OFF)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ○ SERVER MEMBERS INTENT        [Toggle] │  ← TURN THIS ON!
│   Your bot will be able to see...      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ○ MESSAGE CONTENT INTENT       [Toggle] │  ← TURN THIS ON!
│   Your bot will be able to read...     │
└─────────────────────────────────────────┘
```

---

## Step 5: Enable the Two Toggles

Click both toggles so they turn **GREEN/BLUE** (ON):

- ✅ **SERVER MEMBERS INTENT** → ON
- ✅ **MESSAGE CONTENT INTENT** → ON

---

## Step 6: Save Changes

At the **bottom** of the page, click:

```
[  Save Changes  ]  ← Click this button!
```

---

## ✅ Done!

Once you click "Save Changes", type **"done"** here and I'll start your bot immediately!

---

## 🆘 Still Can't Find It?

The section is usually about **halfway down** the Bot page. If you're on mobile, try using a desktop browser - the Developer Portal works better on desktop.

**Quick verification:**
- Are you on the "Bot" tab? (left sidebar)
- Did you scroll down past the Token section?
- Look for a heading that says "Privileged Gateway Intents"
