// Scroll progress pill: floats just below the header, fills as the visitor scrolls
(function () {
  var pill = document.querySelector(".scroll-progress");
  var bar = document.querySelector(".scroll-progress__bar");
  var header = document.querySelector(".site-header");
  if (!pill || !bar) return;

  function positionPill() {
    // Dock it just below the header's bottom edge so it sits on the page's
    // white background (with its own gold stroke) rather than overlapping
    // the header chrome.
    var headerH = header ? header.offsetHeight : 0;
    pill.style.top = headerH + 14 + "px";
  }

  function updateProgress() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = pct + "%";
  }

  positionPill();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", positionPill);
})();

// WebGL velvet prototype (subtle animated hero sheen)
(function () {
  var canvas = document.getElementById('velvet-canvas');
  if (!canvas) return;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  var vs = '\n' +
    'attribute vec2 a_pos;\n' +
    'varying vec2 v_uv;\n' +
    'void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0);}\n';

  var fs = '\n' +
    'precision highp float;\n' +
    'varying vec2 v_uv;\n' +
    'uniform float u_time;\n' +
    'uniform vec2 u_res;\n' +
    'vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }\n' +
    'float snoise(vec2 v){\n' +
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.5773502691896268, 0.024390243902439025);\n' +
    '  vec2 i = floor(v + dot(v, C.yy));\n' +
    '  vec2 x0 = v - i + dot(i, C.xx);\n' +
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);\n' +
    '  vec4 x12 = x0.xyxy + C.xxzz;\n' +
    '  x12.xy -= i1;\n' +
    '  i = mod(i, 289.0);\n' +
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\n' +
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n' +
    '  m = m*m; m = m*m;\n' +
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n' +
    '  vec3 h = abs(x) - 0.5;\n' +
    '  vec3 ox = floor(x + 0.5);\n' +
    '  vec3 a0 = x - ox;\n' +
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);\n' +
    '  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.y = a0.y * x12.x + h.y * x12.y; g.z = a0.z * x12.z + h.z * x12.w;\n' +
    '  return 130.0 * dot(m, g);\n' +
    '}\n' +
    'float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v += a * snoise(p); p *= 2.0; a *= 0.5;} return v; }\n' +
    'void main(){\n' +
    '  vec2 uv = v_uv * vec2(u_res.x/u_res.y,1.0);\n' +
    '  float t = u_time * 0.12;\n' +
    '  float n = fbm(uv * 1.6 - vec2(t*0.6, t*0.4));\n' +
    '  float n2 = fbm(uv * 3.0 + vec2(t*0.8, -t*0.5));\n' +
    '  float v = mix(n, n2, 0.45);\n' +
    '  vec3 base = vec3(0.04,0.1,0.19);\n' +
    '  vec3 highlight = vec3(0.09,0.19,0.32) * (0.6 + v*0.6);\n' +
    '  vec3 col = mix(base, highlight, smoothstep(-0.3,0.6,v));\n' +
    '  gl_FragColor = vec4(col, 1.0);\n' +
    '}\n';

  function compileShader(src, type) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('Shader compile error', gl.getShaderInfoLog(sh));
    }
    return sh;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compileShader(vs, gl.VERTEX_SHADER));
  gl.attachShader(prog, compileShader(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error', gl.getProgramInfoLog(prog));
    document.documentElement.classList.add('no-webgl');
    return;
  }
  gl.useProgram(prog);

  var aPos = gl.getAttribLocation(prog, 'a_pos');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes = gl.getUniformLocation(prog, 'u_res');

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  function render(now) {
    resize();
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var t = now * 0.001;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  window.addEventListener('resize', resize);
})();

// Animate SVG turbulence to create moving velvet folds
(function () {
  var t1 = document.getElementById('turb1');
  var t2 = document.getElementById('turb2');
  var d1 = document.getElementById('disp1');
  var d2 = document.getElementById('disp2');
  if (!t1 || !t2) return;
  var start = performance.now();
  function animate(now) {
    var t = (now - start) / 1000;
    var bf1 = 0.006 + Math.sin(t * 0.6) * 0.002 + (Math.sin(t * 0.13) * 0.0008);
    var bf2 = 0.018 + Math.cos(t * 0.45) * 0.006 + (Math.cos(t * 0.09) * 0.001);
    t1.setAttribute('baseFrequency', bf1.toFixed(5));
    t2.setAttribute('baseFrequency', bf2.toFixed(5));
    if (d1) d1.setAttribute('scale', (28 + Math.sin(t * 0.8) * 8 + Math.sin(t * 0.15) * 3).toFixed(1));
    if (d2) d2.setAttribute('scale', (10 + Math.cos(t * 0.6) * 6 + Math.cos(t * 0.11) * 2).toFixed(1));
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// Hero parallax layers (mouse/touch)
(function () {
  var hero = document.querySelector('.hero');
  var layers = document.querySelectorAll('.hero-bg__layer');
  if (!hero || !layers || layers.length === 0) return;

  var supportsPointer = window.PointerEvent !== undefined;
  var pos = { x: 0, y: 0 };
  var raf = null;

  function onMove(clientX, clientY) {
    var rect = hero.getBoundingClientRect();
    var x = (clientX - rect.left) / rect.width;
    var y = (clientY - rect.top) / rect.height;
    pos.x = (x - 0.5) * 2;
    pos.y = (y - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(update);
  }

  function update() {
    layers.forEach(function (layer, i) {
      var depth = (i + 1) / layers.length;
      var tx = pos.x * 10 * depth;
      var ty = pos.y * 8 * depth;
      var rot = pos.x * (2 * depth);
      layer.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) rotate(' + rot + 'deg) scale(' + (1 + depth * 0.015) + ')';
    });
    raf = null;
  }

  function reset() {
    pos.x = 0; pos.y = 0;
    if (!raf) raf = requestAnimationFrame(update);
  }

  if (supportsPointer) {
    hero.addEventListener('pointermove', function (e) { onMove(e.clientX, e.clientY); });
    hero.addEventListener('pointerleave', reset);
  } else {
    hero.addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
    hero.addEventListener('mouseleave', reset);
  }
})();

// FAQ accordion
(function () {
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    var btn = item.querySelector(".faq-item__q");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  });
})();

// Scroll-reveal: fade + slide up as sections/cards enter the viewport
(function () {
  var targets = document.querySelectorAll(
    ".section-head, .card, .benefit-card, .testimonial-card, .tier-card, .perk-card, " +
    ".step-card, .carousel__card, .pricing-hero-card, .mission-intro, .stat-line, .block, .timeline-block"
  );
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (t) { t.classList.add("reveal", "is-visible"); });
    return;
  }

  targets.forEach(function (el) { el.classList.add("reveal"); });

  // stagger siblings sharing a parent (e.g. cards in a grid)
  var seen = new Map();
  targets.forEach(function (el) {
    var parent = el.parentElement;
    var i = seen.get(parent) || 0;
    el.style.setProperty("--reveal-i", Math.min(i, 6));
    seen.set(parent, i + 1);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach(function (el) { observer.observe(el); });
})();

// Stats bar count-up: numbers animate from 0 to their value once scrolled into view
(function () {
  var nums = document.querySelectorAll(".stats-bar__num");
  if (!nums.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!match) return;
    var prefix = match[1];
    var digits = match[2];
    var suffix = match[3];
    var target = parseInt(digits.replace(/,/g, ""), 10);
    if (reduceMotion || !target) return;

    var duration = 1400;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = prefix + current.toLocaleString("en-US") + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = prefix + digits + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  if (!("IntersectionObserver" in window)) {
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  nums.forEach(function (el) { observer.observe(el); });
})();

// Sticky bottom CTA bar: appears once the hero has scrolled past, hides near the footer
(function () {
  var bar = document.querySelector(".sticky-cta");
  var hero = document.querySelector(".hero");
  if (!bar) return;

  var footer = document.querySelector(".site-footer");
  var showAfter = hero ? hero.offsetHeight * 0.7 : 400;

  function update() {
    var scrollY = window.scrollY || window.pageYOffset;
    var nearFooter = false;
    if (footer) {
      var footerTop = footer.getBoundingClientRect().top;
      nearFooter = footerTop < window.innerHeight * 0.6;
    }
    bar.classList.toggle("is-visible", scrollY > showAfter && !nearFooter);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

// Horizontal card carousels with prev/next arrow controls
(function () {
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    function cardWidth() {
      var card = track.querySelector(".carousel__card");
      if (!card) return track.clientWidth;
      var style = getComputedStyle(card);
      return card.offsetWidth + parseFloat(style.marginRight || 0) + 20;
    }

    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 4;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -cardWidth(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: cardWidth(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  });
})();
