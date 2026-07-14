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
