/* Dissertation guide chat widget.
   Add to the page, just before </body>:
   <script src="/assets/js/dissertation-chat.js"
           data-endpoint="https://YOUR-WORKER.workers.dev/chat"
           data-email="will.songyang.wang@gmail.com" defer></script>
   Optional: data-accent="#e4572e"  data-turnstile-sitekey="..." */
(function () {
  "use strict";
  var script = document.currentScript;
  var cfg = {
    endpoint: script && script.dataset.endpoint,
    email: (script && script.dataset.email) || "will.songyang.wang@gmail.com",
    accent: (script && script.dataset.accent) || "",
    sitekey: (script && script.dataset.turnstileSitekey) || "",
  };
  if (!cfg.endpoint) { console.warn("dissertation-chat: missing data-endpoint"); return; }

  var STORE_KEY = "dissertation-chat-v1";
  var STARTERS = [
    "What is this research about, in simple terms?",
    "What is connectomics, and why does it matter?",
    "What did the mouse have to do in the experiment?",
    "What was the main finding?",
  ];

  var messages = load();
  var busy = false;

  var host = document.createElement("div");
  host.id = "dissertation-chat";
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '.w{--bg:#ffffff;--panel:#ffffff;--text:#1b1d21;--muted:#636a73;--line:#e2e4e8;--bubble:#f1f2f4;--accent:' + (cfg.accent || "#d9480f") + ';--onaccent:#fff;' +
    'font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;color:var(--text)}' +
    '.w.dark{--bg:#0c0f14;--panel:#141920;--text:#e8eaed;--muted:#9aa1ab;--line:#2a313b;--bubble:#1e242d;--accent:' + (cfg.accent || "#ff7a45") + ';--onaccent:#0c0f14}' +
    '*{box-sizing:border-box}' +
    '.launch{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 18px;' +
    'background:var(--accent);color:var(--onaccent);font:inherit;font-weight:600;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.25)}' +
    '.launch:focus-visible,.send:focus-visible,.chip:focus-visible,.x:focus-visible{outline:2px solid var(--text);outline-offset:2px}' +
    '.launch svg{width:18px;height:18px}' +
    '.panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:400px;max-width:calc(100vw - 32px);height:min(620px,calc(100vh - 40px));' +
    'display:none;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.3)}' +
    '.open .panel{display:flex}.open .launch{display:none}' +
    '.head{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}' +
    '.head h2{margin:0;font-size:16px;font-weight:650}.head p{margin:2px 0 0;font-size:12.5px;color:var(--muted)}' +
    '.x{margin-left:auto;border:0;background:none;color:var(--muted);font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}' +
    '.log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}' +
    '.msg{max-width:88%;padding:10px 13px;border-radius:14px;word-wrap:break-word;overflow-wrap:anywhere}' +
    '.msg p{margin:0 0 8px}.msg p:last-child{margin:0}.msg ul{margin:4px 0 8px;padding-left:20px}.msg li{margin:2px 0}' +
    '.user{align-self:flex-end;background:var(--accent);color:var(--onaccent);border-bottom-right-radius:4px}' +
    '.bot{align-self:flex-start;background:var(--bubble);border-bottom-left-radius:4px}' +
    '.by{font-size:11.5px;color:var(--muted);margin-top:6px}' +
    '.note{align-self:center;font-size:13px;color:var(--muted);text-align:center;max-width:95%}' +
    '.intro{color:var(--muted);font-size:14px;margin:0}' +
    '.chips{display:flex;flex-direction:column;gap:8px}' +
    '.chip{text-align:left;border:1px solid var(--line);background:none;color:var(--text);font:inherit;font-size:14px;padding:9px 12px;border-radius:10px;cursor:pointer}' +
    '.chip:hover{border-color:var(--accent)}' +
    '.dots span{display:inline-block;width:6px;height:6px;margin-right:4px;border-radius:50%;background:var(--muted);animation:b 1s infinite}' +
    '.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}' +
    '@keyframes b{0%,80%,100%{opacity:.25}40%{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.dots span{animation:none;opacity:.6}}' +
    '.form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}' +
    'textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:10px;padding:9px 11px;font:inherit;color:var(--text);background:var(--bg);max-height:120px}' +
    'textarea:focus{outline:none;border-color:var(--accent)}' +
    '.send{border:0;border-radius:10px;padding:0 14px;background:var(--accent);color:var(--onaccent);font:inherit;font-weight:600;cursor:pointer}' +
    '.send:disabled{opacity:.5;cursor:default}' +
    '.foot{padding:0 14px 10px;font-size:11.5px;color:var(--muted)}' +
    '.foot a{color:inherit}' +
    '@media (max-width:520px){.panel{right:16px;left:16px;bottom:16px;width:auto;max-width:none;height:calc(100vh - 32px);height:calc(100dvh - 32px)}.launch{right:16px;bottom:16px}}' +
    '</style>' +
    '<div class="w">' +
    '<button class="launch" type="button" aria-label="Ask about this research">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>' +
    'Ask about this research</button>' +
    '<section class="panel" role="dialog" aria-label="Dissertation guide">' +
    '<div class="head"><div><h2>Ask about my dissertation</h2><p>An AI guide that answers from my dissertation. It can make mistakes.</p></div>' +
    '<button class="x" type="button" aria-label="Close">&times;</button></div>' +
    '<div class="log" aria-live="polite"></div>' +
    '<form class="form"><textarea rows="1" maxlength="1000" placeholder="Ask a question in any language" aria-label="Your question"></textarea>' +
    '<button class="send" type="submit">Send</button></form>' +
    '<div class="foot">Questions are logged anonymously to improve the guide. For anything else, email <a href="mailto:' + esc(cfg.email) + '">' + esc(cfg.email) + '</a>.</div>' +
    '<div class="ts" style="display:none"></div>' +
    '</section></div>';

  var w = root.querySelector(".w");
  var launch = root.querySelector(".launch");
  var closeBtn = root.querySelector(".x");
  var log = root.querySelector(".log");
  var form = root.querySelector(".form");
  var input = root.querySelector("textarea");
  var sendBtn = root.querySelector(".send");

  launch.addEventListener("click", function () { w.classList.add("open"); render(); input.focus(); });
  closeBtn.addEventListener("click", function () { w.classList.remove("open"); launch.focus(); });
  root.addEventListener("keydown", function (e) { if (e.key === "Escape" && w.classList.contains("open")) closeBtn.click(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); }
  });
  input.addEventListener("input", function () { input.style.height = "auto"; input.style.height = input.scrollHeight + "px"; });

  // Follow the site's light or dark theme by reading the page background.
  function syncTheme() {
    var bg = getComputedStyle(document.body).backgroundColor;
    if (!bg || bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg)) bg = getComputedStyle(document.documentElement).backgroundColor;
    var m = (bg || "").match(/\d+(\.\d+)?/g);
    var dark;
    if (m && m.length >= 3 && !(m.length === 4 && Number(m[3]) === 0)) {
      dark = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.5;
    } else {
      dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    }
    w.classList.toggle("dark", !!dark);
  }
  syncTheme();
  new MutationObserver(function () { setTimeout(syncTheme, 50); })
    .observe(document.documentElement, { attributes: true, subtree: false, attributeFilter: ["class", "data-theme", "style"] });
  new MutationObserver(function () { setTimeout(syncTheme, 50); })
    .observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncTheme);

  function render() {
    log.innerHTML = "";
    if (!messages.length) {
      var p = document.createElement("p");
      p.className = "intro";
      p.textContent = "Hi! I can explain this research in plain language: what was measured, how the brain wiring was mapped, and what was found. Try one of these, or ask your own question.";
      log.appendChild(p);
      var chips = document.createElement("div");
      chips.className = "chips";
      STARTERS.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = q;
        b.addEventListener("click", function () { ask(q); });
        chips.appendChild(b);
      });
      log.appendChild(chips);
    }
    messages.forEach(function (m) { log.appendChild(bubble(m)); });
    log.scrollTop = log.scrollHeight;
  }

  function bubble(m) {
    var d = document.createElement("div");
    if (m.kind === "note") { d.className = "note"; d.textContent = m.content; return d; }
    d.className = "msg " + (m.role === "user" ? "user" : "bot");
    if (m.role === "user") d.textContent = m.content; else d.innerHTML = md(m.content);
    if (m.role === "assistant" && m.model) {
      var by = document.createElement("div");
      by.className = "by"; by.textContent = "Answered by " + m.model;
      d.appendChild(by);
    }
    return d;
  }

  function ask(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    input.value = ""; input.style.height = "auto";
    messages.push({ role: "user", content: text });
    save(); render();
    var wait = document.createElement("div");
    wait.className = "msg bot dots"; wait.setAttribute("aria-label", "Thinking");
    wait.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(wait); log.scrollTop = log.scrollHeight;

    var history = messages.filter(function (m) { return m.kind !== "note"; })
      .map(function (m) { return { role: m.role, content: m.content }; });

    getToken().then(function (token) {
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, turnstileToken: token }),
      });
    }).then(function (res) {
      return res.json().catch(function () { return { code: "error" }; });
    }).then(function (data) {
      if (data && data.reply) {
        messages.push({ role: "assistant", content: data.reply, model: data.model || "" });
        if (data.remaining === 3) messages.push({ kind: "note", content: "You can ask 3 more questions today." });
      } else {
        messages.pop(); // let the visitor retry the same question later
        messages.push({ kind: "note", content: explain(data && data.code, data && data.limit) });
      }
    }).catch(function () {
      messages.pop();
      messages.push({ kind: "note", content: "I couldn't reach the guide. Check your connection and try again." });
    }).then(function () {
      busy = false; sendBtn.disabled = false;
      save(); render(); input.focus();
    });
  }

  function explain(code, limit) {
    if (code === "visitor_limit") return "You've reached today's limit of " + (limit || 20) + " questions. Come back tomorrow, or email Songyang at " + cfg.email + ".";
    if (code === "burst_limit") return "That was a lot of questions at once. Wait a minute and try again.";
    if (code === "budget_limit") return "The guide has used up its budget for this month and will be back on the 1st. You can still read the dissertation page or email Songyang at " + cfg.email + ".";
    if (code === "bot_check") return "The bot check didn't pass. Reload the page and try again.";
    return "Something went wrong on my side. Please try again in a moment.";
  }

  // Optional Cloudflare Turnstile bot check
  var tsReady = null, tsId = null, tsResolve = null;
  function getToken() {
    if (!cfg.sitekey) return Promise.resolve(null);
    if (!tsReady) {
      tsReady = new Promise(function (resolve) {
        var s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.onload = function () {
          var holder = document.createElement("div");
          document.body.appendChild(holder);
          tsId = window.turnstile.render(holder, {
            sitekey: cfg.sitekey, execution: "execute", appearance: "interaction-only",
            callback: function (t) { if (tsResolve) { tsResolve(t); tsResolve = null; } },
          });
          resolve();
        };
        s.onerror = function () { resolve(); };
        document.head.appendChild(s);
      });
    }
    return tsReady.then(function () {
      if (tsId === null) return null;
      return new Promise(function (resolve) {
        tsResolve = resolve;
        window.turnstile.reset(tsId);
        window.turnstile.execute(tsId);
        setTimeout(function () { if (tsResolve) { tsResolve(null); tsResolve = null; } }, 15000);
      });
    });
  }

  // Minimal, safe markdown: paragraphs, "- " lists, **bold**
  function md(text) {
    var out = [], list = null;
    String(text).split(/\n/).forEach(function (line) {
      var t = line.trim();
      var item = t.match(/^[-*•]\s+(.*)$/) || t.match(/^\d+[.)]\s+(.*)$/);
      if (item) { if (!list) { list = []; } list.push("<li>" + inline(item[1]) + "</li>"); return; }
      if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
      if (!t) { out.push(""); return; }
      var last = out.length - 1;
      if (last >= 0 && out[last] && out[last].indexOf("<p>") === 0) out[last] = out[last].replace(/<\/p>$/, "<br>" + inline(t) + "</p>");
      else out.push("<p>" + inline(t) + "</p>");
    });
    if (list) out.push("<ul>" + list.join("") + "</ul>");
    return out.filter(Boolean).join("");
  }
  function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^#+\s*/, ""); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function load() {
    try { var v = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]"); return Array.isArray(v) ? v.slice(-40) : []; }
    catch (e) { return []; }
  }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40))); } catch (e) { /* storage off */ }
  }
})();
