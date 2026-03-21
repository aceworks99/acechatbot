# aceworks. Bot — Render Version

## Files
- server.js     ← The bot brain (Node.js HTTP server)
- bot.js        ← Chat widget (give this to clients)
- package.json  ← Dependencies

## Deploy to Render

1. Push these files to GitHub repo called "aceworks-bot-render"

2. Go to render.com → Sign in with GitHub

3. New + → Web Service → Select your repo

4. Settings:
   - Name: aceworks-bot
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js

5. Environment Variables:
   - GEMINI_KEY_1 = your first Gemini key
   - GEMINI_KEY_2 = your second Gemini key

6. Click Deploy

7. Get your URL: https://aceworks-bot.onrender.com

8. Update bot.js line 2:
   const BOT_API_URL = "https://aceworks-bot.onrender.com/api/chat";

9. Re-upload bot.js to GitHub → auto redeploys

## Stop Bot Sleeping (Free Tier)

1. Go to uptimerobot.com → free account
2. Add New Monitor → HTTP(s)
3. URL: https://aceworks-bot.onrender.com
4. Interval: 10 minutes
5. Save — done forever

## Add New Client

In server.js add to CLIENTS object:
  "storeid": {
    name: "Store Name",
    email: "help@store.com",
    prompt: "You are an AI receptionist for Store Name..."
  }

Give client this script tag:
  <script src="https://aceworks-bot.onrender.com/bot.js" data-client="storeid"></script>
