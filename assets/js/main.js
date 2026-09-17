(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5585998048023"; // Studio Lina — 85 99804-8023

  function buildWaLink(message) {
    var text = encodeURIComponent(message || "Olá! Gostaria de agendar um horário no Studio Lina 💛");
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  // ---------- Tracking (preparado para GTM/dataLayer e Meta Pixel) ----------
  // Não gera erro se GTM/Pixel ainda não estiverem instalados nesta página.
  function trackEvent(eventName, params) {
    try {
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
      }
    } catch (e) {}
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", params || {});
      }
    } catch (e) {}
  }

  // ---------- WhatsApp CTAs (header, hero, serviços, curso, footer flutuante) ----------
  function wireWhatsappButtons() {
    var buttons = document.querySelectorAll(".wa-cta");
    buttons.forEach(function (btn) {
      var isServiceCard = btn.classList.contains("service-card") || btn.classList.contains("price-row") || btn.classList.contains("tier");
      var handler = function (e) {
        e.preventDefault();
        var service = btn.getAttribute("data-service");
        var message = service
          ? "Olá, quero agendar: " + service + " 💛"
          : btn.getAttribute("data-wa-message");
        trackEvent("cta_click", { cta_label: btn.getAttribute("data-track-label") || service || "whatsapp" });
        window.open(buildWaLink(message), "_blank", "noopener");
      };
      btn.addEventListener("click", handler);
      if (isServiceCard) {
        btn.setAttribute("type", "button");
      }
    });
  }

  // ---------- Botão flutuante do WhatsApp: mensagem varia conforme a seção visível ----------
  function wireContextualWhatsapp() {
    var floatBtn = document.querySelector(".wa-float");
    if (!floatBtn || !("IntersectionObserver" in window)) return;

    var messages = {
      areas: "Olá! Gostaria de agendar depilação no Studio Lina 💛",
      servicos: "Olá! Gostaria de saber mais sobre os serviços do Studio Lina 💛",
      sobre: "Olá! Gostaria de agendar um horário no Studio Lina 💛",
      localizacao: "Olá! Gostaria de confirmar o horário e a localização do Studio Lina.",
      depoimentos: "Olá! Gostaria de agendar um horário no Studio Lina 💛",
      curso: "Olá! Quero saber mais sobre o Curso Profissional de Depilação do Studio Lina 💛"
    };
    var defaultMessage = floatBtn.getAttribute("data-wa-message");

    var sections = Object.keys(messages)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          floatBtn.setAttribute("data-wa-message", messages[entry.target.id] || defaultMessage);
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px" });

    sections.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Formulário simples do curso → WhatsApp ----------
  function wireLeadForm() {
    var form = document.getElementById("leadForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("leadName");
      var name = (nameInput && nameInput.value || "").trim();
      var message = name
        ? "Olá! Meu nome é " + name + " e tenho interesse no Curso Profissional de Depilação do Studio Lina."
        : "Olá! Tenho interesse no Curso Profissional de Depilação do Studio Lina 💛";
      trackEvent("cta_click", { cta_label: "lead_form" });
      trackEvent("generate_lead", { form: "curso-depilacao" });
      window.open(buildWaLink(message), "_blank", "noopener");
    });
  }


  // ---------- Accordion de preços avulsos (fechado por padrão, em qualquer tela) ----------
  function wirePriceAccordion() {
    var groups = document.querySelectorAll(".price-list-group");
    if (!groups.length) return;

    groups.forEach(function (group) {
      var toggle = group.querySelector(".price-list-toggle");
      var body = group.querySelector(".price-list-body");
      if (!toggle || !body) return;

      var setOpen = function (open) {
        group.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        body.style.maxHeight = open ? body.scrollHeight + "px" : null;
      };

      setOpen(false);

      toggle.addEventListener("click", function () {
        setOpen(!group.classList.contains("open"));
      });
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

  // ---------- Accordion de categorias (mobile): cada categoria abre/fecha independente ----------
  function wireCategoryAccordion() {
    var toggles = document.querySelectorAll(".category-toggle");
    if (!toggles.length) return;

    toggles.forEach(function (toggle) {
      var body = toggle.nextElementSibling;
      if (!body || !body.classList.contains("service-panel-body")) return;

      toggle.addEventListener("click", function () {
        var isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
        body.style.maxHeight = isOpen ? null : body.scrollHeight + "px";
      });
    });

    window.addEventListener("resize", function () {
      toggles.forEach(function (toggle) {
        var body = toggle.nextElementSibling;
        if (body && toggle.getAttribute("aria-expanded") === "true") {
          body.style.maxHeight = body.scrollHeight + "px";
        }
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
    var revealEls = document.querySelectorAll(".reveal, .blur-reveal, .reveal-sm");
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

  // ---------- Alternância claro/escuro ----------
  function wireThemeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var STORAGE_KEY = "studiolina-theme";

    var syncButton = function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    };
    syncButton();

    btn.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "dark");
      }
      try { localStorage.setItem(STORAGE_KEY, isDark ? "light" : "dark"); } catch (e) {}
      syncButton();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireWhatsappButtons();
    wireContextualWhatsapp();
    wireLeadForm();
    wirePriceAccordion();
    wireHeaderScroll();
    wireMobileNav();
    wireServiceTabs();
    wireCategoryAccordion();
    wireGalleryLightbox();
    wireRevealOnScroll();
    wireThemeToggle();
    setYear();
  });
})();
