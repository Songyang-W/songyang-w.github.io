/* Shared behaviour for every page: theme toggle and email copy. */
(function () {
  "use strict";

  var root = document.documentElement;
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function onMediaChange(query, fn) {
    if (query.addEventListener) query.addEventListener("change", fn);
    else if (query.addListener) query.addListener(fn);
  }

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
  onMediaChange(darkQuery, syncThemeButton);
  syncThemeButton();

  /* Looping videos: play only while visible and when motion is allowed, with a pause button. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("video[data-loop]").forEach(function (video) {
    var btn = video.parentNode.querySelector(".motion-btn");
    var paused = reduceMotion.matches, visible = false;
    function sync() {
      if (!paused && visible) {
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () { /* autoplay blocked */ });
      } else {
        video.pause();
      }
      if (btn) btn.textContent = paused ? "Play" : "Pause";
    }
    if (btn) btn.addEventListener("click", function () { paused = !paused; sync(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(video);
    } else {
      visible = true;
      sync();
    }
  });

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
      var status = document.getElementById("copy-status");
      var confirm = function () {
        btn.textContent = "Copied";
        if (status) status.textContent = "Email address copied";
        setTimeout(function () {
          btn.textContent = label;
          if (status) status.textContent = "";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(target.textContent.trim()).then(confirm, function () { selectText(target); });
      } else {
        selectText(target);
      }
    });
  });
})();
