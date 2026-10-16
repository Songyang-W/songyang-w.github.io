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
  var groups = window.TIMELINE_GROUPS || {};

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function startItem(className, when, nodeClass) {
    var item = make("li", className);
    item.appendChild(make("div", "tl-when", when || ""));
    var rail = make("div", "tl-rail");
    rail.appendChild(make("span", nodeClass));
    item.appendChild(rail);
    return item;
  }

  /* A link, or a "coming soon" label for pages that do not exist yet. */
  function renderLink(link) {
    if (link.soon) {
      var label = make("span", "tl-soon-link", link.label);
      label.appendChild(make("span", "soon", "coming soon"));
      return label;
    }
    var a = make("a", null, link.label);
    a.href = link.href;
    return a;
  }

  /* Header row for a project told in stages (consecutive entries sharing a group). */
  function renderGroupHead(key) {
    var group = groups[key] || { title: key };
    var item = startItem("tl-item tl-group-head", group.when, "tl-node is-group");
    item.dataset.group = key;
    var body = make("div", "tl-body tl-group-body");
    body.appendChild(make("span", "tl-cat", "Project in " + (group.stages || 2) + " stages"));
    body.appendChild(make("h3", null, group.title));
    if (group.blurb) body.appendChild(make("p", null, group.blurb));
    if (group.link) body.appendChild(renderLink(group.link));
    item.appendChild(body);
    return item;
  }

  /* One-line milestone: a degree or honor that needs no card. */
  function renderMilestone(entry) {
    var item = startItem("tl-item tl-milestone", entry.when, "tl-node");
    item.dataset.cat = entry.category;
    var body = make("p", "tl-body tl-ms");
    body.appendChild(make("strong", null, entry.title));
    if (entry.note) body.appendChild(make("span", null, entry.note));
    item.appendChild(body);
    return item;
  }

  function renderEntry(entry, index) {
    var item = startItem("tl-item", entry.when, "tl-node");
    item.dataset.cat = entry.category;

    var card = make("article", "tl-card");
    var top = make("div", "tl-top");
    top.appendChild(make("span", "tl-cat", CATEGORY_LABELS[entry.category] || entry.category));
    if (entry.stage) top.appendChild(make("span", "tl-stage", entry.stage));
    card.appendChild(top);
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
        links.forEach(function (l) { row.appendChild(renderLink(l)); });
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
    entries.forEach(function (entry, i) {
      var prev = entries[i - 1], next = entries[i + 1];
      if (entry.group && (!prev || prev.group !== entry.group)) list.appendChild(renderGroupHead(entry.group));
      var item = entry.milestone ? renderMilestone(entry) : renderEntry(entry, i);
      if (entry.group) {
        item.classList.add("in-group");
        item.dataset.group = entry.group;
        if (!next || next.group !== entry.group) item.classList.add("group-last");
      }
      list.appendChild(item);
    });
  }

  /* Filter chips. A project header stays visible while any of its stages is visible. */
  var chips = document.querySelectorAll(".chip");
  var count = document.getElementById("tl-count");
  function applyFilter(filter) {
    if (!list) return;
    var shown = 0, liveGroups = {};
    list.querySelectorAll(".tl-item:not(.tl-group-head)").forEach(function (item) {
      var match = filter === "all" || item.dataset.cat === filter;
      item.hidden = !match;
      if (match) {
        shown += 1;
        if (item.dataset.group) liveGroups[item.dataset.group] = true;
      }
    });
    list.querySelectorAll(".tl-group-head").forEach(function (head) {
      head.hidden = !liveGroups[head.dataset.group];
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
