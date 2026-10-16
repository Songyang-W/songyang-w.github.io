/* Home page timeline in two lanes: where I studied and worked on the left, what I built on the right.
   Rows are years (each entry sits in the row of its most recent year). Data lives in data/timeline.js.
   Below 820 px the lanes merge into one column. */
(function () {
  "use strict";

  var root = document.getElementById("timeline");
  if (!root) return;
  var entries = window.TIMELINE || [];
  var groups = window.TIMELINE_GROUPS || {};
  var LANES = [
    { key: "stay", heading: "Where I studied and worked" },
    { key: "project", heading: "What I built" }
  ];

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* Date text. The arrow is hidden from screen readers, which hear "to" instead. */
  function renderWhen(when, className) {
    var cell = make("span", className);
    String(when || "").split("→").forEach(function (part, i) {
      if (i > 0) {
        var arrow = make("span", null, "→");
        arrow.setAttribute("aria-hidden", "true");
        cell.appendChild(arrow);
        cell.appendChild(make("span", "sr-only", " to "));
      }
      cell.appendChild(document.createTextNode(part));
    });
    return cell;
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

  function renderGroupHead(key) {
    var group = groups[key] || { title: key };
    var head = make("div", "tl-group");
    head.dataset.group = key;
    var top = make("div", "tl-top");
    top.appendChild(make("span", "tl-cat", "Project in " + (group.stages || 2) + " stages"));
    top.appendChild(renderWhen(group.when, "tl-date"));
    head.appendChild(top);
    head.appendChild(make("h3", null, group.title));
    if (group.blurb) head.appendChild(make("p", null, group.blurb));
    if (group.link) head.appendChild(renderLink(group.link));
    return head;
  }

  /* One-line milestone: a degree or honor that needs no card. */
  function renderMilestone(entry) {
    var row = make("p", "tl-ms");
    row.appendChild(make("span", "tl-diamond"));
    var text = make("span", "tl-ms-text");
    text.appendChild(make("strong", null, entry.title));
    if (entry.note) text.appendChild(make("span", null, entry.note));
    row.appendChild(text);
    return row;
  }

  function renderCard(entry, index) {
    var card = make("article", "tl-card" + (entry.lane === "stay" ? " is-stay" : ""));
    if (entry.group) {
      card.classList.add("in-group");
      card.dataset.group = entry.group;
    }

    var top = make("div", "tl-top");
    if (entry.label) top.appendChild(make("span", "tl-cat", entry.label));
    if (entry.stage) top.appendChild(make("span", "tl-stage", entry.stage));
    top.appendChild(renderWhen(entry.when, "tl-date"));
    card.appendChild(top);

    /* Stages sit under their project heading, so they take the next heading level. */
    card.appendChild(make(entry.group ? "h4" : "h3", "tl-title", entry.title));
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
      btn.setAttribute("aria-label", "Details: " + entry.title);

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
        drawConnectors();
      });
      card.appendChild(btn);
      card.appendChild(panel);
    } else if (entry.draft) {
      card.appendChild(make("p", "tl-draft", "Details coming soon"));
    }
    return card;
  }

  /* Lane headings, then one row per year with a year marker and a cell per lane. */
  LANES.forEach(function (lane) {
    root.appendChild(make("div", "tl-lane-head tl-" + lane.key, lane.heading));
  });

  var years = [];
  entries.forEach(function (e) { if (years.indexOf(e.year) < 0) years.push(e.year); });
  years.sort(function (a, b) { return b - a; });

  var seenGroups = {};
  years.forEach(function (year, i) {
    var row = String(i + 2);
    var mark = make("div", "tl-year", String(year));
    mark.style.setProperty("--row", row);
    root.appendChild(mark);

    LANES.forEach(function (lane) {
      var items = entries.filter(function (e) { return e.year === year && e.lane === lane.key; });
      if (!items.length) return;
      var cell = make("div", "tl-cell tl-" + lane.key);
      cell.style.setProperty("--row", row);
      items.forEach(function (entry) {
        if (entry.group && !seenGroups[entry.group]) {
          seenGroups[entry.group] = true;
          cell.appendChild(renderGroupHead(entry.group));
        }
        cell.appendChild(entry.milestone ? renderMilestone(entry) : renderCard(entry, entries.indexOf(entry)));
      });
      root.appendChild(cell);
    });
  });

  /* Accent connector joining a project heading to all of its stages, even across year rows. */
  var connectors = {};
  function drawConnectors() {
    var box = root.getBoundingClientRect();
    Object.keys(seenGroups).forEach(function (key) {
      var head = root.querySelector('.tl-group[data-group="' + key + '"]');
      var stages = root.querySelectorAll('.tl-card[data-group="' + key + '"]');
      if (!head || !stages.length) return;
      var line = connectors[key];
      if (!line) {
        line = connectors[key] = make("div", "tl-connector");
        line.setAttribute("aria-hidden", "true");
        root.appendChild(line);
      }
      line.innerHTML = "";
      var headBox = head.getBoundingClientRect();
      var lastBox = stages[stages.length - 1].getBoundingClientRect();
      var top = headBox.top - box.top + 10;
      var bottom = lastBox.top - box.top + 22;
      line.style.left = (headBox.left - box.left - 11) + "px";
      line.style.top = top + "px";
      line.style.height = Math.max(0, bottom - top) + "px";
      [head].concat(Array.prototype.slice.call(stages)).forEach(function (el, n) {
        var dot = make("span", "tl-connector-dot");
        dot.style.top = (el.getBoundingClientRect().top - box.top + (n === 0 ? 10 : 22) - top) + "px";
        line.appendChild(dot);
      });
    });
  }
  drawConnectors();
  if ("ResizeObserver" in window) new ResizeObserver(drawConnectors).observe(root);
  else window.addEventListener("resize", drawConnectors);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawConnectors);
})();
