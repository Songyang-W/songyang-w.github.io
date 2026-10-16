/* Home page project timeline: a year column, a rail, and one card per project, newest first.
   Each card links to its project page and can also open its details in place. Entries that share a
   group are drawn as one project in stages under a heading. Data lives in data/timeline.js. */
(function () {
  "use strict";

  var list = document.getElementById("timeline");
  if (!list) return;
  var entries = window.TIMELINE || [];
  var groups = window.TIMELINE_GROUPS || {};

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* Date text. The arrow is hidden from screen readers, which hear "to" instead. */
  function renderWhen(when) {
    var cell = make("div", "tl-when");
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

  function startItem(className, when, nodeClass) {
    var item = make("li", className);
    item.appendChild(renderWhen(when));
    var rail = make("div", "tl-rail");
    rail.appendChild(make("span", nodeClass));
    item.appendChild(rail);
    return item;
  }

  function pageLink(href, label, title) {
    var a = make("a", "tl-page", label);
    a.href = href;
    if (title) a.setAttribute("aria-label", label + ": " + title);
    return a;
  }

  function titled(tag, text, href) {
    var heading = make(tag, "tl-title");
    if (href) {
      var a = make("a", null, text);
      a.href = href;
      heading.appendChild(a);
    } else {
      heading.textContent = text;
    }
    return heading;
  }

  function renderGroupHead(key) {
    var group = groups[key] || { title: key };
    var item = startItem("tl-item tl-group-head", group.when, "tl-node is-group");
    var body = make("div", "tl-body tl-group-body");
    body.appendChild(make("span", "tl-cat", "Project in " + (group.stages || 2) + " stages"));
    var heading = titled("h3", group.title, group.page);
    heading.className = "";
    body.appendChild(heading);
    if (group.blurb) body.appendChild(make("p", null, group.blurb));
    if (group.page) body.appendChild(pageLink(group.page, group.pageLabel || "Project page"));
    item.appendChild(body);
    return item;
  }

  function renderEntry(entry, index) {
    var item = startItem("tl-item", entry.when, "tl-node");
    item.dataset.cat = (entry.label || "").toLowerCase();

    var card = make("article", "tl-card");
    var top = make("div", "tl-top");
    if (entry.label) top.appendChild(make("span", "tl-cat", entry.label));
    if (entry.stage) top.appendChild(make("span", "tl-stage", entry.stage));
    card.appendChild(top);
    /* Stages sit under their project heading, so they take the next heading level. */
    card.appendChild(titled(entry.group ? "h4" : "h3", entry.title, entry.page));
    if (entry.org) card.appendChild(make("p", "tl-org", entry.org));
    if (entry.summary) card.appendChild(make("p", "tl-sum", entry.summary));

    if (entry.tags && entry.tags.length) {
      var tags = make("ul", "tags");
      tags.setAttribute("aria-label", "Skills used");
      entry.tags.forEach(function (t) { tags.appendChild(make("li", null, t)); });
      card.appendChild(tags);
    }

    var bullets = entry.bullets || [];
    var actions = make("div", "tl-actions");
    var panel = null;
    if (bullets.length) {
      var panelId = "tl-details-" + index;
      var btn = make("button", "tl-more", "Details");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", panelId);
      btn.setAttribute("aria-label", "Details: " + entry.title);
      panel = make("div", "tl-details");
      panel.id = panelId;
      panel.hidden = true;
      var ul = make("ul");
      bullets.forEach(function (b) { ul.appendChild(make("li", null, b)); });
      panel.appendChild(ul);
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
      actions.appendChild(btn);
    }
    if (entry.page) actions.appendChild(pageLink(entry.page, entry.group ? "Read more" : "Project page", entry.title));
    if (actions.children.length) card.appendChild(actions);
    if (panel) card.appendChild(panel);
    if (entry.draft) card.appendChild(make("p", "tl-draft", "Details coming soon"));

    item.appendChild(card);
    return item;
  }

  entries.forEach(function (entry, i) {
    var prev = entries[i - 1], next = entries[i + 1];
    if (entry.group && (!prev || prev.group !== entry.group)) list.appendChild(renderGroupHead(entry.group));
    var item = renderEntry(entry, i);
    if (entry.group) {
      item.classList.add("in-group");
      if (!next || next.group !== entry.group) item.classList.add("group-last");
    }
    list.appendChild(item);
  });
})();
