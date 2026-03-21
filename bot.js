(function () {
  // ── Replace with your Render URL after deploying ──
  const BOT_API_URL = "https://YOUR_RENDER_URL.onrender.com/api/chat";

  const scriptTag = document.currentScript;
  const clientId = scriptTag ? scriptTag.getAttribute("data-client") || "demo" : "demo";

  const style = document.createElement("style");
  style.textContent = `
    #aw-widget * { box-sizing: border-box; font-family: 'DM Sans', -apple-system, sans-serif; }
    #aw-toggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #111; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s, box-shadow 0.2s; font-size: 1.4rem;
    }
    #aw-toggle:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }
    #aw-box {
      position: fixed; bottom: 92px; right: 24px; z-index: 9998;
      width: 360px; height: 500px; border-radius: 18px;
      background: #fff; box-shadow: 0 8px 48px rgba(0,0,0,0.16);
      display: none; flex-direction: column; overflow: hidden;
      border: 1px solid #e8e8e8; animation: awSlideUp 0.25s ease;
    }
    @keyframes awSlideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
    #aw-box.open { display: flex; }
    #aw-header { background:#111; color:#fff; padding:1rem 1.2rem; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    #aw-header-left { display:flex; align-items:center; gap:0.6rem; }
    #aw-avatar { width:32px; height:32px; border-radius:50%; background:#333; display:flex; align-items:center; justify-content:center; font-size:0.9rem; }
    #aw-header-text strong { display:block; font-size:0.875rem; font-weight:600; }
    #aw-header-text span { font-size:0.72rem; color:rgba(255,255,255,0.6); }
    #aw-close { background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:1.2rem; padding:0; line-height:1; transition:color 0.2s; }
    #aw-close:hover { color:#fff; }
    #aw-messages { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:0.75rem; background:#fafafa; }
    #aw-messages::-webkit-scrollbar { width:4px; }
    #aw-messages::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }
    .aw-msg { max-width:80%; padding:0.65rem 0.9rem; border-radius:14px; font-size:0.875rem; line-height:1.5; animation:awFadeIn 0.2s ease; }
    @keyframes awFadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
    .aw-msg.bot { background:#fff; color:#111; border:1px solid #e8e8e8; border-radius:4px 14px 14px 14px; align-self:flex-start; }
    .aw-msg.user { background:#111; color:#fff; border-radius:14px 4px 14px 14px; align-self:flex-end; }
    .aw-msg.typing { color:#aaa; font-style:italic; background:#fff; border:1px solid #e8e8e8; }
    #aw-input-area { padding:0.8rem; border-top:1px solid #e8e8e8; display:flex; gap:0.5rem; background:#fff; flex-shrink:0; }
    #aw-input { flex:1; border:1.5px solid #e8e8e8; border-radius:100px; padding:0.6rem 1rem; font-size:0.875rem; outline:none; transition:border-color 0.2s; background:#fafafa; color:#111; }
    #aw-input:focus { border-color:#111; }
    #aw-send { width:38px; height:38px; border-radius:50%; background:#111; color:#fff; border:none; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:background 0.2s,transform 0.15s; flex-shrink:0; }
    #aw-send:hover { background:#333; transform:scale(1.05); }
    #aw-send:disabled { background:#ccc; cursor:not-allowed; transform:none; }
    #aw-branding { text-align:center; font-size:0.65rem; color:#ccc; padding:0.4rem 0; background:#fff; flex-shrink:0; }
    #aw-branding a { color:#ccc; text-decoration:none; }
    #aw-branding a:hover { color:#111; }
  `;
  document.head.appendChild(style);

  const widget = document.createElement("div");
  widget.id = "aw-widget";
  widget.innerHTML = `
    <button id="aw-toggle" aria-label="Open chat">💬</button>
    <div id="aw-box">
      <div id="aw-header">
        <div id="aw-header-left">
          <div id="aw-avatar">AI</div>
          <div id="aw-header-text">
            <strong>AI Assistant</strong>
            <span>Always online</span>
          </div>
        </div>
        <button id="aw-close" aria-label="Close">✕</button>
      </div>
      <div id="aw-messages"></div>
      <div id="aw-input-area">
        <input id="aw-input" type="text" placeholder="Ask anything..." autocomplete="off"/>
        <button id="aw-send" aria-label="Send">➤</button>
      </div>
      <div id="aw-branding">Powered by <a href="https://aceworksai.netlify.app" target="_blank">aceworks.</a></div>
    </div>
  `;
  document.body.appendChild(widget);

  const toggle   = document.getElementById("aw-toggle");
  const box      = document.getElementById("aw-box");
  const messages = document.getElementById("aw-messages");
  const input    = document.getElementById("aw-input");
  const send     = document.getElementById("aw-send");
  const close    = document.getElementById("aw-close");

  let isOpen = false;
  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    box.classList.toggle("open", isOpen);
    toggle.textContent = isOpen ? "✕" : "💬";
    if (isOpen && messages.children.length === 0) {
      addMessage("bot", "Hi! How can I help you today?");
      input.focus();
    }
  });
  close.addEventListener("click", () => {
    isOpen = false;
    box.classList.remove("open");
    toggle.textContent = "💬";
  });

  function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `aw-msg ${role}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    send.disabled = true;
    addMessage("user", text);
    const typing = addMessage("bot typing", "Typing...");
    try {
      const res = await fetch(BOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, clientId }),
      });
      const data = await res.json();
      typing.remove();
      addMessage("bot", data.reply || "Sorry, something went wrong.");
    } catch (err) {
      typing.remove();
      addMessage("bot", "Sorry, I'm having trouble connecting. Please try again.");
    }
    send.disabled = false;
    input.focus();
  }

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
})();
