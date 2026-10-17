/* Dissertation hero: real neurons reconstructed from the EM volume (window.NEURONS, assets/data/neurons.js),
   drawn as skeletons with the synapses they receive and send. Drag to rotate, switch neurons with the
   buttons, pause with the Pause button. Falls back to a generated neuron if the data file is missing. */
(function () {
  "use strict";

  var canvas = document.getElementById("neuron");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var data = window.NEURONS || [];

  function onMediaChange(query, fn) {
    if (query.addEventListener) query.addEventListener("change", fn);
    else if (query.addListener) query.addListener(fn);
  }
  function triples(flat) {
    var out = [];
    for (var i = 0; i + 2 < flat.length; i += 3) out.push([flat[i], flat[i + 1], flat[i + 2]]);
    return out;
  }

  /* Shape: segments plus synapse points, with bounds used to fit the canvas while rotating. */
  function finish(segments, synIn, synOut, meta) {
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    segments.forEach(function (s) {
      [s.a, s.b].forEach(function (p) {
        for (var k = 0; k < 3; k++) { if (p[k] < min[k]) min[k] = p[k]; if (p[k] > max[k]) max[k] = p[k]; }
      });
    });
    var c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    var rH = 1, hV = 1;
    segments.forEach(function (s) {
      rH = Math.max(rH, Math.hypot(s.b[0] - c[0], s.b[2] - c[2]));
      hV = Math.max(hV, Math.abs(s.b[1] - c[1]));
    });
    return { segments: segments, synIn: synIn, synOut: synOut, center: c, radiusH: rH, halfV: hV, meta: meta || null };
  }

  function fromData(n) {
    var P = n.nodes, segs = [];
    for (var i = 0; i < n.parent.length; i++) {
      var j = n.parent[i];
      if (j < 0) continue;
      segs.push({ a: [P[3 * i], P[3 * i + 1], P[3 * i + 2]], b: [P[3 * j], P[3 * j + 1], P[3 * j + 2]], axon: n.axon[i] === 1 });
    }
    return finish(segs, triples(n.synIn), triples(n.synOut), n);
  }

  /* Fallback: a procedurally grown pyramidal-style neuron (seeded, so it looks the same every visit). */
  function generated() {
    var seed = 415;
    function rand() {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function wobble(d, a) { return norm([d[0] + (rand() - 0.5) * a, d[1] + (rand() - 0.5) * a, d[2] + (rand() - 0.5) * a]); }
    var segs = [], syn = [];
    function grow(p, d, step, depth, maxDepth, pull, axon) {
      var n = 4 + Math.floor(rand() * 4);
      for (var k = 0; k < n; k++) {
        d = wobble([d[0] + pull[0] * 0.18, d[1] + pull[1] * 0.18, d[2] + pull[2] * 0.18], 0.45);
        var q = [p[0] + d[0] * step, p[1] + d[1] * step, p[2] + d[2] * step];
        segs.push({ a: p, b: q, axon: axon });
        if (!axon && rand() < 0.22) syn.push(q);
        p = q;
      }
      if (depth < maxDepth) {
        var branches = rand() < 0.7 ? 2 : 1;
        for (var j = 0; j < branches; j++) grow(p, wobble(d, 1.2), step * 0.84, depth + 1, maxDepth, pull, axon);
      }
    }
    grow([0, 5, 0], [0, 1, 0], 7.5, 0, 4, [0, 0.9, 0], false);
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2 + rand() * 0.6;
      grow([0, -2, 0], norm([Math.cos(a), -0.3 - rand() * 0.5, Math.sin(a)]), 5.5, 0, 3, [0, -0.35, 0], false);
    }
    grow([0, -5, 0], [0, -1, 0], 8.5, 1, 3, [0, -0.8, 0], true);
    return finish(segs, syn, [], null);
  }

  var shapes = data.length ? data.map(fromData) : [generated()];
  var current = 0;
  var shape = shapes[0];

  var W = 0, H = 0, scale = 1, angle = 0.6, tilt = 0.12;
  var colors = { ink: "#12161d", accent: "#c41e56", accent2: "#0f766e" };
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue("--ink").trim() || colors.ink;
    colors.accent = cs.getPropertyValue("--accent").trim() || colors.accent;
    colors.accent2 = cs.getPropertyValue("--accent-2").trim() || colors.accent2;
  }
  function fit() { scale = Math.min(W / 2 / shape.radiusH, H / 2 / (shape.halfV * 1.08)) * 0.92; }
  function resize() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fit();
  }
  function project(p, out) {
    var c = shape.center;
    var x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
    var ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt);
    var x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
    var y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    var depth = z2 / shape.radiusH, f = 4 / (4 + depth);
    out[0] = W / 2 + x1 * scale * f; out[1] = H / 2 - y2 * scale * f; out[2] = depth;
    return out;
  }

  /* Draw in a few depth bands per color, one path each, so thousands of segments stay fast. */
  var BANDS = 4;
  function band(depth) { return Math.max(0, Math.min(BANDS - 1, Math.floor((depth + 1) / 2 * BANDS))); }
  function alphaFor(b) { return 0.95 - b * 0.22; }
  var A = [0, 0, 0], B = [0, 0, 0];
  function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    var unit = Math.max(0.7, Math.min(1.6, (scale * shape.radiusH) / 170));
    [false, true].forEach(function (isAxon) {
      for (var b = BANDS - 1; b >= 0; b--) {
        ctx.beginPath();
        var any = false;
        for (var i = 0; i < shape.segments.length; i++) {
          var s = shape.segments[i];
          if (s.axon !== isAxon) continue;
          project(s.a, A); project(s.b, B);
          if (band((A[2] + B[2]) / 2) !== b) continue;
          ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); any = true;
        }
        if (!any) continue;
        ctx.globalAlpha = alphaFor(b) * (isAxon ? 0.9 : 1);
        ctx.strokeStyle = isAxon ? colors.accent2 : colors.ink;
        ctx.lineWidth = (isAxon ? 0.8 : 1.15) * unit;
        ctx.stroke();
      }
    });
    function dots(list, color, size) {
      ctx.fillStyle = color;
      for (var b = BANDS - 1; b >= 0; b--) {
        ctx.globalAlpha = Math.min(1, alphaFor(b) + 0.05);
        for (var i = 0; i < list.length; i++) {
          project(list[i], A);
          if (band(A[2]) !== b) continue;
          ctx.fillRect(A[0] - size / 2, A[1] - size / 2, size, size);
        }
      }
    }
    dots(shape.synOut, colors.accent2, 2.2 * unit);
    dots(shape.synIn, colors.accent, 2.2 * unit);
    project([0, 0, 0], A);
    ctx.globalAlpha = 1; ctx.fillStyle = colors.ink;
    ctx.beginPath(); ctx.arc(A[0], A[1], 5 * unit, 0, Math.PI * 2); ctx.fill();
  }

  /* Neuron switcher and stats line (built only when real data is present). */
  var picker = document.getElementById("neuron-picker");
  var stats = document.getElementById("neuron-stats");
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  function syncStats() {
    if (!stats) return;
    var m = shape.meta;
    if (!m) { stats.textContent = "Illustration of a neuron."; return; }
    stats.textContent = "Cell " + m.id + ": " + fmt(m.counts["in"]) + " synapses received, " + fmt(m.counts.out) + " sent" +
      (m.axonLabelled ? "." : ". Axon and dendrites are not separated for this cell.");
  }
  function select(k) {
    current = k; shape = shapes[k]; fit(); draw(); syncStats();
    if (picker) picker.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === k)); });
  }
  if (picker && data.length > 1) {
    data.forEach(function (n, i) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = "Neuron " + (i + 1);
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", function () { select(i); });
      picker.appendChild(b);
    });
  } else if (picker) {
    picker.hidden = true;
  }

  /* Animation runs only while visible, motion is allowed and the visitor has not paused it. */
  var SPIN = 0.22;
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
  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

  var toggle = document.getElementById("neuron-toggle");
  function syncToggle() {
    if (!toggle) return;
    toggle.hidden = reduceMotion.matches;
    toggle.textContent = paused ? "Play" : "Pause";
  }
  if (toggle) toggle.addEventListener("click", function () { paused = !paused; if (paused) stop(); else start(); syncToggle(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) start(); else stop(); }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  onMediaChange(reduceMotion, function () { if (reduceMotion.matches) stop(); else start(); syncToggle(); draw(); });

  canvas.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true; dragId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging || e.pointerId !== dragId) return;
    angle += (e.clientX - lastX) * 0.01;
    tilt = Math.max(-0.7, Math.min(0.7, tilt + (e.clientY - lastY) * 0.006));
    lastX = e.clientX; lastY = e.clientY;
    if (!rafId) draw();
  });
  function endDrag(e) { if (e.pointerId === dragId) { dragging = false; dragId = null; } }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  function refreshColors() { readColors(); draw(); }
  new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  onMediaChange(window.matchMedia("(prefers-color-scheme: dark)"), refreshColors);
  if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); draw(); }).observe(canvas);
  else window.addEventListener("resize", function () { resize(); draw(); });

  readColors(); resize(); draw(); syncStats(); syncToggle(); start();
})();
