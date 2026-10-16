/* Home page behaviour: theme toggle, timeline rendering and filters, email copy. */
(function () {
  "use strict";

  var root = document.documentElement;
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  /* Theme toggle. The saved choice is applied before paint by a small script in <head>. */
  function activeTheme() {
    return root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }
  var themeBtn = document.getElementById("theme-toggle");
  function syncThemeButton() {
    if (!themeBtn) return;
    var dark = activeTheme() === "dark";
    themeBtn.textContent = dark ? "Light" : "Dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = activeTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
  }
  darkQuery.addEventListener("change", syncThemeButton);
  syncThemeButton();

  /* Timeline, rendered from window.TIMELINE (data/timeline.js). */
  var CATEGORY_LABELS = {
    industry: "Industry", research: "Research", project: "Project",
    education: "Education", teaching: "Teaching"
  };
  var list = document.getElementById("timeline");
  var entries = window.TIMELINE || [];

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderEntry(entry, index) {
    var item = make("li", "tl-item");
    item.dataset.cat = entry.category;
    item.appendChild(make("div", "tl-when", entry.when));

    var rail = make("div", "tl-rail");
    rail.appendChild(make("span", "tl-node"));
    item.appendChild(rail);

    var card = make("article", "tl-card");
    card.appendChild(make("span", "tl-cat", CATEGORY_LABELS[entry.category] || entry.category));
    card.appendChild(make("h3", "tl-title", entry.title));
    if (entry.org) card.appendChild(make("p", "tl-org", entry.org));
    if (entry.summary) card.appendChild(make("p", "tl-sum", entry.summary));

    if (entry.tags && entry.tags.length) {
      var tags = make("ul", "tags");
      tags.setAttribute("aria-label", "Skills used");
      entry.tags.forEach(function (t) { tags.appendChild(make("li", null, t)); });
      card.appendChild(tags);
    }

    var bullets = entry.bullets || [];
    var links = entry.links || [];
    if (bullets.length || links.length) {
      var panelId = "tl-details-" + index;
      var btn = make("button", "tl-more", "Details");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", panelId);

      var panel = make("div", "tl-details");
      panel.id = panelId;
      panel.hidden = true;
      if (bullets.length) {
        var ul = make("ul");
        bullets.forEach(function (b) { ul.appendChild(make("li", null, b)); });
        panel.appendChild(ul);
      }
      if (links.length) {
        var row = make("div", "tl-links");
        links.forEach(function (l) {
          var a = make("a", null, l.label);
          a.href = l.href;
          row.appendChild(a);
        });
        panel.appendChild(row);
      }
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
      card.appendChild(btn);
      card.appendChild(panel);
    } else if (entry.draft) {
      card.appendChild(make("p", "tl-draft", "Details coming soon"));
    }

    item.appendChild(card);
    return item;
  }

  if (list) {
    entries.forEach(function (entry, i) { list.appendChild(renderEntry(entry, i)); });
  }

  /* Filter chips. */
  var chips = document.querySelectorAll(".chip");
  var count = document.getElementById("tl-count");
  function applyFilter(filter) {
    if (!list) return;
    var shown = 0;
    Array.prototype.forEach.call(list.children, function (item) {
      var match = filter === "all" || item.dataset.cat === filter;
      item.hidden = !match;
      if (match) shown += 1;
    });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.filter === filter)); });
    if (count) count.textContent = "Showing " + shown + " of " + entries.length;
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { applyFilter(c.dataset.filter); });
  });
  applyFilter("all");

  /* Copy email. Falls back to selecting the address if the clipboard is unavailable. */
  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy"));
      if (!target) return;
      var confirm = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(target.textContent.trim()).then(confirm, function () { selectText(target); });
      } else {
        selectText(target);
      }
    });
  });
})();
