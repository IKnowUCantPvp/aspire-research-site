// Mobile nav toggle
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var list = document.querySelector(".primary-nav__list");
  if (!toggle || !list) return;
  toggle.addEventListener("click", function () {
    var isOpen = list.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  list.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      list.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// WebGL/GLSL velvet prototype (high-fidelity)
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

  // vertex shader
  var vs = '\n' +
    'attribute vec2 a_pos;\n' +
    'varying vec2 v_uv;\n' +
    'void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0);}\n';

  // fragment shader: fbm-based flowing velvet
  var fs = '\n' +
    'precision highp float;\n' +
    'varying vec2 v_uv;\n' +
    'uniform float u_time;\n' +
    'uniform vec2 u_res;\n' +
    '/* Classic 2D noise from iq */\n' +
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
    '  vec2 uv = v_uv * vec2(u_res.x/u_res.y,1.0);\n+    '  float t = u_time * 0.12;\n+    '  float n = fbm(uv * 1.6 - vec2(t*0.6, t*0.4));\n' +
    '  float n2 = fbm(uv * 3.0 + vec2(t*0.8, -t*0.5));\n' +
    '  float v = mix(n, n2, 0.45);\n+    '  vec3 base = vec3(0.03,0.09,0.17) * 1.0;\n+    '  vec3 highlight = vec3(0.08,0.16,0.28) * (0.6 + v*0.6);\n+    '  vec3 col = mix(base, highlight, smoothstep(-0.3,0.6,v));\n+    '  // sheen streaks\n' +
    '  float streak = smoothstep(0.45,0.7, fbm(uv*6.0 + vec2(t*1.2)) );\n+    '  col += vec3(0.08,0.12,0.18) * streak * 0.6;\n+    '  gl_FragColor = vec4(col, 1.0);\n+    '}\n';

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
    // oscillate baseFrequency subtly
    var bf1 = 0.006 + Math.sin(t * 0.6) * 0.002 + (Math.sin(t * 0.13) * 0.0008);
    var bf2 = 0.018 + Math.cos(t * 0.45) * 0.006 + (Math.cos(t * 0.09) * 0.001);
    t1.setAttribute('baseFrequency', bf1.toFixed(5));
    t2.setAttribute('baseFrequency', bf2.toFixed(5));
    // animate displacement scales for more visible folds
    if (d1) d1.setAttribute('scale', (28 + Math.sin(t * 0.8) * 8 + Math.sin(t * 0.15) * 3).toFixed(1));
    if (d2) d2.setAttribute('scale', (10 + Math.cos(t * 0.6) * 6 + Math.cos(t * 0.11) * 2).toFixed(1));
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// Hero headline typing animation
(function () {
  var textEl = document.getElementById('hero-title-text');
  var caret = document.querySelector('.hero-caret');
  var actions = document.querySelector('.hero__actions');
  var countdown = document.querySelector('.hero__countdown');
  var heroTitle = document.querySelector('.hero-title');
  if (!textEl || !heroTitle) return;

  var fullText = 'The #1 High School Research Experience.';
  var idx = 0;
  var defaultSpeed = 40; // ms per char
  // allow configuring typing speed via data attribute on hero-title
  var speed = defaultSpeed;
  try {
    var speedAttr = heroTitle && heroTitle.getAttribute('data-type-speed');
    if (speedAttr) speed = parseInt(speedAttr, 10) || defaultSpeed;
  } catch (e) {}

  function type() {
    if (idx <= fullText.length) {
      textEl.textContent = fullText.slice(0, idx);
      idx++;
      setTimeout(type, speed + Math.random() * 40);
    } else {
      // finished typing: show buttons and countdown
      heroTitle.classList.add('is-visible');
      if (actions) actions.classList.add('is-visible');
      if (countdown) countdown.classList.add('is-visible');
      if (caret) caret.style.display = 'none';
    }
  }

  // small delay so other assets can load
  window.addEventListener('load', function () {
    setTimeout(function () {
      heroTitle.classList.add('is-visible');
      type();
    }, 300);
  });
})();

// Hero parallax layers (mouse/touch)
(function () {
  var hero = document.querySelector('.hero');
  var layers = document.querySelectorAll('.hero-bg__layer');
  if (!hero || !layers || layers.length === 0) return;

  var supportsPointer = window.PointerEvent !== undefined;
  var cx = hero.clientWidth / 2;
  var cy = hero.clientHeight / 2;
  var pos = { x: cx, y: cy };
  var raf = null;

  function onMove(clientX, clientY) {
    var rect = hero.getBoundingClientRect();
    var x = (clientX - rect.left) / rect.width;
    var y = (clientY - rect.top) / rect.height;
    pos.x = (x - 0.5) * 2; // -1..1
    pos.y = (y - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(update);
  }

  function update() {
    layers.forEach(function (layer, i) {
      var depth = (i + 1) / layers.length; // 0..1
      var tx = pos.x * 10 * depth; // px
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

// Simple in-browser preview recorder (uses getDisplayMedia to capture tab/window)
(function () {
  // only show on localhost or when ?preview is present
  var enabled = location.hostname === 'localhost' || /[?&]preview(=|&|$)/.test(location.search) || /[?&]record(=|&|$)/.test(location.search);
  if (!enabled) return;
  var btn = document.createElement('button');
  btn.id = 'record-preview-btn';
  btn.type = 'button';
  btn.textContent = 'Record preview';
  btn.title = 'Record a short WebM preview of the page (you will be asked to share your screen/tab)';
  document.body.appendChild(btn);

  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
  }

  btn.addEventListener('click', function () {
    var duration = 4500; // ms
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then(function (stream) {
      var recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      var chunks = [];
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = function () {
        var blob = new Blob(chunks, { type: 'video/webm' });
        downloadBlob(blob, 'preview.webm');
        // stop tracks
        stream.getTracks().forEach(function (t) { t.stop(); });
      };
      recorder.start();
      setTimeout(function () { recorder.stop(); }, duration);
    }).catch(function (err) { console.warn('Preview recording canceled', err); });
  });
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

// Solution tabs
(function () {
  var nav = document.querySelector(".solution-tabs__nav");
  if (!nav) return;
  var buttons = nav.querySelectorAll(".solution-tabs__btn");
  var panels = document.querySelectorAll(".solution-tabs__panel");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab");
      buttons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === target);
      });
    });
  });
})();
