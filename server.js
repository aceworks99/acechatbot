const http = require("http");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Your API keys ──
const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
];

let currentKey = 0;

// ── Client configs ──
const CLIENTS = {
  "demo": {
    name: "Demo Store",
    email: "help@demostore.com",
    prompt: `You are an AI receptionist for Demo Store — an online shop.
Your job:
- Answer questions about products, shipping and returns
- Help customers find what they need
- Be friendly, helpful and concise
- If you don't know something say: "Great question! Email us at help@demostore.com and we'll help."
Never use markdown formatting. Plain text only.
Keep replies short and natural. Never make up information.`
  },

  "aceworks": {
    name: "aceworks.",
    email: "ace.works19@gmail.com",
    prompt: `You are an AI assistant for aceworks. — an AI automation agency for eCommerce stores.

About aceworks.:
aceworks. builds AI automation systems for eCommerce stores. We handle the setup, the tech, and the management. We are currently open for new clients.

Services we offer:

Service 1 - AI Chatbot and Receptionist (AVAILABLE NOW):
A custom-trained AI assistant for eCommerce stores. Handles customer questions, recommends products, captures leads, and support 24/7. Works on Shopify, WooCommerce and most platforms. Powered by Gemini API.
Pricing: $99 one-time setup fee. $299 per month.

Service 2 - Abandoned Cart Recovery (COMING SOON):
Automated email sequences that follow up with customers who left without buying.

Service 3 - Voice Agent (COMING SOON):
A full AI voice receptionist that handles phone calls 24/7.

How it works:
1. Client reaches out via email or Instagram DMs
2. We send a free AI Opportunity Map within 24 hours
3. We agree on what to build over email or DMs
4. We build the systems in 4-6 days
5. Go live on day 7
6. Monthly optimization ongoing

Key facts:
- Live in 7 days from agreement
- Month-to-month contracts, no lock-in
- Done for you, client touches no code
- eCommerce focused only
- Setup fee: $99 one-time
- Monthly: $299 per month

Contact:
- Email: ace.works19@gmail.com
- Instagram: coming soon
- Website: https://aceworksai.netlify.app

Your job:
- Answer questions about aceworks. services and pricing
- Help potential clients understand what we do
- Encourage them to book a free audit
- If you don't know something say: "Email us at ace.works19@gmail.com and we will get back to you."

Tone: Friendly, confident, professional but casual. Keep replies short and clear.
Never use markdown formatting. Plain text only.
Never make up information.`
  },

  // Add more clients below:
  // "clientid": {
  //   name: "Store Name",
  //   email: "help@store.com",
  //   prompt: `You are an AI receptionist for Store Name...`
  // },
};

// ── Helper to read request body ──
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

// ── Main server ──
const server = http.createServer(async (req, res) => {

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/") {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify({ status: "aceworks. bot is running" }));
    return;
  }

  // ── Serve bot.js widget file ──
  if (req.method === "GET" && req.url === "/bot.js") {
    const botPath = path.join(__dirname, "bot.js");
    fs.readFile(botPath, "utf8", (err, data) => {
      if (err) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(404);
        res.end(JSON.stringify({ error: "bot.js not found" }));
        return;
      }
      res.setHeader("Content-Type", "application/javascript");
      res.writeHead(200);
      res.end(data);
    });
    return;
  }

  // Chat endpoint
  if (req.method === "POST" && req.url === "/api/chat") {
    res.setHeader("Content-Type", "application/json");
    const body = await getBody(req);
    const { message, clientId } = body;

    if (!message) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "No message provided" }));
      return;
    }

    const client = CLIENTS[clientId] || CLIENTS["demo"];

    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
      try {
        const key = API_KEYS[currentKey];

        if (!key) {
          currentKey = (currentKey + 1) % API_KEYS.length;
          continue;
        }

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: client.prompt,
        });

        const result = await model.generateContent(message);
        const reply = result.response.text();

        res.writeHead(200);
        res.end(JSON.stringify({ reply }));
        return;

      } catch (error) {
        console.log(`Key ${currentKey + 1} failed:`, error.message);
        currentKey = (currentKey + 1) % API_KEYS.length;
      }
    }

    res.writeHead(500);
    res.end(JSON.stringify({
      reply: `Sorry, having trouble right now. Please email us at ${client.email}`
    }));
    return;
  }

  // 404
  res.setHeader("Content-Type", "application/json");
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`aceworks. bot running on port ${PORT}`);
});
