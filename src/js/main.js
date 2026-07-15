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
  var speed = 40; // ms per char

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
