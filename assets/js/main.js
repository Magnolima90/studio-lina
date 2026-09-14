(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5585998048023"; // Studio Lina — 85 99804-8023

  function buildWaLink(message) {
    var text = encodeURIComponent(message || "Olá! Gostaria de agendar um horário no Studio Lina 💛");
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  // ---------- WhatsApp CTAs (header, hero, serviços, footer flutuante) ----------
  function wireWhatsappButtons() {
    var buttons = document.querySelectorAll(".wa-cta");
    buttons.forEach(function (btn) {
      var isServiceCard = btn.classList.contains("service-card");
      var handler = function (e) {
        e.preventDefault();
        var service = btn.getAttribute("data-service");
        var message = service
          ? "Olá! Gostaria de agendar o serviço de *" + service + "* no Studio Lina 💛"
          : btn.getAttribute("data-wa-message");
        window.open(buildWaLink(message), "_blank", "noopener");
      };
      btn.addEventListener("click", handler);
      if (isServiceCard) {
        btn.setAttribute("type", "button");
      }
    });
  }

  // ---------- Header: sombra/fundo ao rolar ----------
  function wireHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Menu mobile ----------
  function wireMobileNav() {
    var toggle = document.getElementById("navToggle");
    var close = document.getElementById("navClose");
    var overlay = document.getElementById("navOverlay");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    var open = function () {
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    };
    var closeMenu = function () {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      document.body.classList.contains("nav-open") ? closeMenu() : open();
    });
    if (close) close.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ---------- Tabs de serviços ----------
  function wireServiceTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        document.querySelectorAll(".service-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === "panel-" + target);
        });
      });
    });
  }

  // ---------- Galeria: lightbox ----------
  function wireGalleryLightbox() {
    var items = document.querySelectorAll(".gallery-item[data-full]");
    var lightbox = document.getElementById("lightbox");
    var img = document.getElementById("lightboxImg");
    var closeBtn = document.getElementById("lightboxClose");
    if (!items.length || !lightbox || !img) return;

    var open = function (src, alt) {
      img.setAttribute("src", src);
      img.setAttribute("alt", alt || "");
      lightbox.classList.add("open");
    };
    var close = function () {
      lightbox.classList.remove("open");
      img.setAttribute("src", "");
    };

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var full = item.getAttribute("data-full");
        var alt = item.querySelector("img") ? item.querySelector("img").getAttribute("alt") : "";
        open(full, alt);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // ---------- Animações ao rolar ----------
  function wireRevealOnScroll() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Rodapé: ano atual ----------
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireWhatsappButtons();
    wireHeaderScroll();
    wireMobileNav();
    wireServiceTabs();
    wireGalleryLightbox();
    wireRevealOnScroll();
    setYear();
  });
})();
