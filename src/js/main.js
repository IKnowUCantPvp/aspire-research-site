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
