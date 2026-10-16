/* Hero illustration: a procedurally grown pyramidal-style neuron that slowly rotates. Drag to turn it,
   or pause it with the button. Accent dots stand for synapses. This is a placeholder until a neuron mesh
   reconstructed from the dissertation dataset replaces it. */
(function () {
  "use strict";

  var canvas = document.getElementById("neuron");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  /* Seeded random numbers so the neuron has the same shape on every visit. */
  var seed = 415;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function normalize(v) {
    var l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
  function wobble(d, amount) {
    return normalize([d[0] + (rand() - 0.5) * amount, d[1] + (rand() - 0.5) * amount, d[2] + (rand() - 0.5) * amount]);
  }

  /* Grow branches as short segments with a random walk, splitting at the end of each branch. */
  var segments = [];
  var synapses = [];
  function grow(start, dir, step, width, depth, maxDepth, pull) {
    var p = start, d = dir, n = 4 + Math.floor(rand() * 4);
    for (var k = 0; k < n; k++) {
      d = wobble([d[0] + pull[0] * 0.18, d[1] + pull[1] * 0.18, d[2] + pull[2] * 0.18], 0.45);
      var q = [p[0] + d[0] * step, p[1] + d[1] * step, p[2] + d[2] * step];
      segments.push({ a: p, b: q, w: width });
      if (rand() < 0.22) synapses.push(q);
      p = q;
      width *= 0.93;
    }
    if (depth < maxDepth) {
      var branches = rand() < 0.7 ? 2 : 1;
      for (var j = 0; j < branches; j++) {
        grow(p, wobble(d, 1.2), step * 0.84, width * 0.82, depth + 1, maxDepth, pull);
      }
    }
  }
  grow([0, 0.05, 0], [0, 1, 0], 0.075, 3.4, 0, 4, [0, 0.9, 0]); /* apical dendrite */
  for (var i = 0; i < 6; i++) {                                  /* basal dendrites */
    var a = (i / 6) * Math.PI * 2 + rand() * 0.6;
    grow([0, -0.02, 0], normalize([Math.cos(a), -0.3 - rand() * 0.5, Math.sin(a)]), 0.055, 2.4, 0, 3, [0, -0.35, 0]);
  }
  grow([0, -0.05, 0], [0, -1, 0], 0.085, 1.1, 1, 3, [0, -0.8, 0]); /* axon */

  /* Bounds: center the shape and size it so it never leaves the canvas while rotating. */
  var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  segments.forEach(function (s) {
    [s.a, s.b].forEach(function (p) {
      for (var k = 0; k < 3; k++) {
        if (p[k] < min[k]) min[k] = p[k];
        if (p[k] > max[k]) max[k] = p[k];
      }
    });
  });
  var cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2, cz = (min[2] + max[2]) / 2;
  var radiusH = 0, halfV = 0;
  segments.forEach(function (s) {
    var p = s.b;
    radiusH = Math.max(radiusH, Math.hypot(p[0] - cx, p[2] - cz));
    halfV = Math.max(halfV, Math.abs(p[1] - cy));
  });

  var W = 0, H = 0, scale = 1, angle = 0.7, tilt = 0.15;
  var colors = { ink: "#12161d", accent: "#d0245e" };

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue("--ink").trim() || colors.ink;
    colors.accent = cs.getPropertyValue("--accent").trim() || colors.accent;
  }
  function resize() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(W / 2 / radiusH, H / 2 / (halfV * 1.15)) * 0.9;
  }
  function project(p) {
    var x = p[0] - cx, y = p[1] - cy, z = p[2] - cz;
    var ca = Math.cos(angle), sa = Math.sin(angle);
    var x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    var depth = z2 / radiusH;            /* about -1 near to 1 far */
    var f = 4 / (4 + depth);             /* gentle perspective */
    return [W / 2 + x1 * scale * f, H / 2 - y2 * scale * f, depth, f];
  }
  function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.strokeStyle = colors.ink;
    var unit = (scale * radiusH) / 160;
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i], a = project(s.a), b = project(s.b);
      var depth = (a[2] + b[2]) / 2;
      ctx.globalAlpha = Math.max(0.18, Math.min(0.95, 0.6 - depth * 0.35));
      ctx.lineWidth = Math.max(0.6, s.w * 0.68 * unit * a[3]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.fillStyle = colors.accent;
    for (var j = 0; j < synapses.length; j++) {
      var q = project(synapses[j]);
      ctx.globalAlpha = Math.max(0.35, Math.min(1, 0.85 - q[2] * 0.3));
      ctx.beginPath();
      ctx.arc(q[0], q[1], Math.max(1.2, 1.6 * unit * q[3]), 0, Math.PI * 2);
      ctx.fill();
    }
    var c = project([0, 0, 0]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.ink;
    ctx.beginPath();
    ctx.ellipse(c[0], c[1], 6 * unit * c[3], 8 * unit * c[3], 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function onMediaChange(query, fn) {
    if (query.addEventListener) query.addEventListener("change", fn);
    else if (query.addListener) query.addListener(fn);
  }

  /* Animation runs only while the canvas is on screen, the tab is visible, motion is allowed
     and the visitor has not paused it. One frame request at a time, rotation speed in radians per second. */
  var SPIN = 0.24;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var rafId = 0, lastTime = 0, onScreen = true, paused = false;
  var dragging = false, dragId = null, lastX = 0, lastY = 0;
  function loop(now) {
    var dt = lastTime ? Math.min(now - lastTime, 100) / 1000 : 0;
    lastTime = now;
    if (!dragging) angle += SPIN * dt;
    draw();
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (rafId || paused || reduceMotion.matches || !onScreen || document.hidden) return;
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  /* Pause and play control (motion that runs longer than five seconds needs one). */
  var toggle = document.getElementById("neuron-toggle");
  function syncToggle() {
    if (!toggle) return;
    toggle.hidden = reduceMotion.matches;
    toggle.textContent = paused ? "Play" : "Pause";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      paused = !paused;
      if (paused) stop(); else start();
      syncToggle();
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      onScreen = es[0].isIntersecting;
      if (onScreen) start(); else stop();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  onMediaChange(reduceMotion, function () {
    if (reduceMotion.matches) stop(); else start();
    syncToggle();
    draw();
  });

  canvas.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    dragId = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging || e.pointerId !== dragId) return;
    angle += (e.clientX - lastX) * 0.01;
    tilt = Math.max(-0.7, Math.min(0.7, tilt + (e.clientY - lastY) * 0.006));
    lastX = e.clientX;
    lastY = e.clientY;
    if (!rafId) draw();
  });
  function endDrag(e) {
    if (e.pointerId === dragId) { dragging = false; dragId = null; }
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  function refreshColors() { readColors(); draw(); }
  new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  onMediaChange(window.matchMedia("(prefers-color-scheme: dark)"), refreshColors);
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); draw(); }).observe(canvas);
  } else {
    window.addEventListener("resize", function () { resize(); draw(); });
  }

  readColors();
  resize();
  draw();
  syncToggle();
  start();
})();
