/* Home page timeline: a year column, a rail, and one card per chapter (a job, a hackathon, a degree),
   newest first. Each card lists its projects by title, each linking to the project's page. Data lives in data/timeline.js. */
(function () {
  "use strict";

  var list = document.getElementById("timeline");
  if (!list) return;

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

  function renderEntry(entry) {
    var item = make("li", "tl-item");
    item.appendChild(renderWhen(entry.when));
    var rail = make("div", "tl-rail");
    rail.appendChild(make("span", "tl-node"));
    item.appendChild(rail);

    var card = make("article", "tl-card");
    if (entry.label) card.appendChild(make("span", "tl-cat", entry.label));
    card.appendChild(make("h3", "tl-title", entry.title));
    if (entry.role) card.appendChild(make("p", "tl-org", entry.role));
    if (entry.summary) card.appendChild(make("p", "tl-sum", entry.summary));

    var projects = entry.projects || [];
    if (projects.length) {
      var ul = make("ul", "tl-projects");
      ul.setAttribute("aria-label", projects.length > 1 ? "Projects" : "Project");
      projects.forEach(function (p) {
        var li = make("li");
        var a = make("a", null, p.title);
        a.href = p.page;
        li.appendChild(a);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    item.appendChild(card);
    return item;
  }

  (window.TIMELINE || []).forEach(function (entry) { list.appendChild(renderEntry(entry)); });
})();
