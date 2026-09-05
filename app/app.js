/* ===========================================================================
   Antaraal — shared UI
   nav · footer · modal · local store · dynamic counts · hero slider ·
   cookie consent · general-query chat · company details
   =========================================================================== */
(function () {
  var LOGO = "m/antaraal-logo.png";

  var NAV = [
    { label: "Products", href: "products.html" },
    { label: "Vendor",   href: "vendors.html"  },
    { label: "Buyer",    href: "buyers.html"   },
  ];
  var CTA = { label: "Apply", href: "apply.html" };

  /* ---- company details (single source of truth) ---------------------------
     Update these values; every footer + the chat bot picks them up.        */
  var COMPANY = {
    name: "Antaraal",
    tagline: "Aerospace supply-chain sourcing platform",
    address: "Unit 101, Oxford Towers, 139/88 HAL Old Airport Rd, H.A.L II Stage, " +
             "Bangalore North, Bangalore 560008, Karnataka, India",
    email: "support@antaraalspace.com",
    phone: "9036548611",
    linkedin: "https://www.linkedin.com/company/antaraal-space/",
    instagram: "https://www.instagram.com/antaraalspace"
  };

  /* Vendor verification is NOT live yet — until Antaraal has actually run its
     checks, no supplier is shown as "Verified" and the verified counts read 0.
     Every profile still shows its full details (certifications included).
     Flip this to true to switch the badges + counts back on.                */
  var VERIFICATION_LIVE = false;

  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function daysLeft(iso) { return Math.ceil((new Date(iso + "T00:00:00") - Date.now()) / 86400000); }

  /* ---------- data source: vendor list is the source of truth ---------- */
  function vendorList() { return (window.ANTARAAL_VENDORS && window.ANTARAAL_VENDORS.length) ? window.ANTARAAL_VENDORS : null; }
  function stats() {
    var v = vendorList();
    if (v) {
      var verified = VERIFICATION_LIVE ? v.filter(function (x) { return x.verified; }).length : 0;
      var caps = {}, locs = {}, certified = 0;
      v.forEach(function (x) {
        (x.categories || []).forEach(function (c) { caps[c] = 1; });
        if (x.location) locs[x.location] = 1;
        if (x.certLevel && x.certLevel !== "none") certified++;
      });
      return { vendors: v.length, verified: verified, pending: v.length - verified,
               capabilities: Object.keys(caps).length, locations: Object.keys(locs).length,
               certified: certified };
    }
    var base = window.ANTARAAL_STATS || { vendors: 0, verified: 0, pending: 0, capabilities: 0, locations: 0, certified: 0 };
    if (!VERIFICATION_LIVE) base = Object.assign({}, base, { verified: 0, pending: base.vendors });
    return base;
  }

  /* ---------- tiny local store ---------- */
  var Store = {
    get: function (k, f) { try { return JSON.parse(localStorage.getItem("antaraal:" + k)) || f; } catch (e) { return f; } },
    set: function (k, v) { try { localStorage.setItem("antaraal:" + k, JSON.stringify(v)); } catch (e) {} },
    push: function (k, v) { var a = Store.get(k, []); a.push(Object.assign({ _ts: Date.now() }, v)); Store.set(k, a); return a; },
    count: function (k) { return Store.get(k, []).length; }
  };

  /* ---------- modal ---------- */
  function modal(title, bodyNode) {
    var box = h(
      '<div class="modal"><div class="modal__wrap modal__box">' +
        '<button class="modal__x" aria-label="Close">&times;</button><h3></h3><div class="modal__body"></div>' +
      "</div></div>"
    );
    box.querySelector("h3").textContent = title;
    box.querySelector(".modal__body").appendChild(bodyNode);
    function close() { box.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    box.querySelector(".modal__x").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
    return { el: box, close: close };
  }

  /* ---------- header (app pages only) ---------- */
  function buildNav() {
    var links = NAV.map(function (n) {
      return '<a class="nav__link' + (n.href.toLowerCase() === here ? " nav__link--active" : "") +
             '" href="' + n.href + '">' + n.label + "</a>";
    }).join("");
    var el = h(
      '<header class="nav"><div class="nav__inner">' +
        '<a class="nav__logo" href="index.html" aria-label="Antaraal home"><img src="' + LOGO + '" alt="Antaraal"></a>' +
        '<div class="nav__spacer"></div>' +
        '<button class="nav__burger" aria-label="Menu" aria-expanded="false">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
        "</button>" +
        '<nav class="nav__links">' + links + '<a class="nav__cta" href="' + CTA.href + '">' + CTA.label + "</a></nav>" +
      "</div></header>"
    );
    var burger = el.querySelector(".nav__burger"), menu = el.querySelector(".nav__links");
    function isMobile() { return window.matchMedia("(max-width:860px)").matches; }
    function setOpen(o) { menu.hidden = isMobile() ? !o : false; burger.setAttribute("aria-expanded", String(o)); }
    setOpen(false);
    burger.addEventListener("click", function () { setOpen(menu.hidden); });
    window.addEventListener("resize", function () { setOpen(false); });
    return el;
  }

  /* ---------- footer (app pages) ---------- */
  function buildFooter() {
    var s = stats();
    return h(
      '<footer class="foot"><div class="wrap">' +
        '<div class="foot__top">' +
          '<div class="foot__brand">' +
            '<a class="foot__logo" href="index.html"><img src="' + LOGO + '" alt="Antaraal"></a>' +
            '<p>' + esc(COMPANY.tagline) + '. <b>' + s.vendors + '</b> suppliers listed across <b>' + s.locations + '</b> locations.</p>' +
            socialRow() +
          "</div>" +
          '<div class="foot__links">' +
            '<a href="products.html">Products</a><a href="vendors.html">Vendors</a>' +
            '<a href="buyers.html">Buyers</a><a href="apply.html">Apply</a><a href="index.html">Home</a>' +
          "</div>" +
          companyCard() +
        "</div>" +
        '<div class="foot__bar">' +
          "<small>&copy; " + new Date().getFullYear() + " " + esc(COMPANY.name) + ". All rights reserved.</small>" +
          '<small><a href="#" data-az-cookie-settings>Cookie preferences</a></small>' +
        "</div>" +
      "</div></footer>"
    );
  }

  function socialRow() {
    return '<div class="foot__social">' +
      '<a href="' + esc(COMPANY.linkedin) + '" target="_blank" rel="noopener" aria-label="Antaraal on LinkedIn">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>' +
      "</a>" +
      '<a href="' + esc(COMPANY.instagram) + '" target="_blank" rel="noopener" aria-label="Antaraal on Instagram">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>' +
      "</a></div>";
  }

  function companyCard() {
    var phoneDigits = COMPANY.phone.replace(/\D/g, "");
    return '<address class="foot__company">' +
      '<span class="foot__k">Registered office</span>' +
      '<span>' + esc(COMPANY.address) + "</span>" +
      '<a href="mailto:' + esc(COMPANY.email) + '">' + esc(COMPANY.email) + "</a>" +
      '<a href="tel:+91' + esc(phoneDigits) + '">+91 ' + esc(COMPANY.phone) + "</a>" +
    "</address>";
  }

  /* ---------- inject the company / contact band on the Framer homepage ---------- */
  function homeFooterCompany() {
    var f = document.querySelector("footer:not(.foot)");
    if (!f) return;
    /* place it as a sibling AFTER the Framer footer so hydration can't wipe it */
    var anchor = f.parentElement || document.body;
    if (anchor.querySelector(":scope > .az-home-company")) return;
    var phoneDigits = COMPANY.phone.replace(/\D/g, "");
    var year = new Date().getFullYear();
    var wrap = h(
      '<div class="az-home-company"><div class="az-home-company__inner">' +
        '<div class="azc-col azc-brand">' +
          '<a class="azc-logo" href="index.html"><img src="' + LOGO + '" alt="Antaraal"></a>' +
          "<p>" + esc(COMPANY.tagline) + ".</p>" +
          socialRow() +
        "</div>" +
        '<div class="azc-col">' +
          '<span class="foot__k">Registered office</span>' +
          "<p>" + esc(COMPANY.address) + "</p>" +
        "</div>" +
        '<div class="azc-col">' +
          '<span class="foot__k">Contact</span>' +
          '<a href="mailto:' + esc(COMPANY.email) + '">' + esc(COMPANY.email) + "</a>" +
          '<a href="tel:+91' + esc(phoneDigits) + '">+91 ' + esc(COMPANY.phone) + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="az-home-company__bar">' +
        "<small>&copy; " + year + " " + esc(COMPANY.name) + ". All rights reserved.</small>" +
        '<small class="azc-legal">' +
          '<a href="#" data-az-cookie-settings>Cookie preferences</a>' +
        "</small>" +
      "</div>" +
      '<a class="azc-bigmark" href="index.html" aria-label="Antaraal home">' +
        '<img src="' + LOGO + '" alt="Antaraal"></a>' +
      "</div>"
    );
    if (f.nextSibling) anchor.insertBefore(wrap, f.nextSibling);
    else anchor.appendChild(wrap);
  }

  /* ---------- dynamic vendor counts ---------- */
  function applyCounts() {
    var s = stats();
    document.querySelectorAll("[data-az-stat]").forEach(function (el) {
      var key = el.getAttribute("data-az-stat");
      if (s[key] != null) el.textContent = key === "vendors" && s[key] >= 100
        ? (Math.floor(s[key] / 10) * 10) + "+" : String(s[key]);
    });

    /* Homepage Framer counters — keep the rendered number matching the data
       even if scripts/build-stats.js has not been re-run after a vendor edit. */
    if (!s.vendors) return;
    var LIVE = {
      "listed suppliers": Math.floor(s.vendors / 10) * 10,
      "suppliers": Math.floor(s.vendors / 10) * 10,
      "aerospace-verified": s.verified,
      "quality-certified": s.certified,
      "capabilities": s.capabilities,
      "locations": s.locations
    };
    function patch() {
      document.querySelectorAll("h5, p").forEach(function (lbl) {
        var key = (lbl.textContent || "").trim().toLowerCase();
        if (!(key in LIVE)) return;
        var tile = lbl.closest('[data-framer-name="About Counter"]') ||
                   lbl.closest('[data-framer-name*="Stastitic"]') ||
                   (lbl.parentElement && lbl.parentElement.parentElement);
        var num = tile && tile.querySelector("span");
        if (!num || !/\d/.test(num.textContent)) return;   // wait until animation done
        var suffix = (key === "listed suppliers" || key === "suppliers") ? "+" : "";
        var want = LIVE[key] + suffix;
        if (num.textContent.trim() !== want) { num.textContent = want; num.title = s.vendors + " suppliers listed"; }
      });
    }
    [1500, 4000, 7000].forEach(function (t) { setTimeout(patch, t); });
  }

  /* ---------- hero background (homepage) ----------
     Single still image only. Framer re-hydrates and wipes the SSR <img>, so we
     keep re-inserting our own layer. No slideshow — the hero image stays put. */
  var HERO_IMG = "hero.jpg";
  function heroSlider() {
    var bg = document.querySelector('[data-framer-name="Hero Background"]');
    if (!bg) return;
    if (bg.querySelector(".az-hero")) return;              /* already there */

    var slider = h('<div class="az-hero" aria-hidden="true"></div>');
    var s = h('<div class="az-hero__slide is-active"></div>');
    s.style.backgroundImage = "url('" + HERO_IMG + "')";
    slider.appendChild(s);
    bg.insertBefore(slider, bg.firstChild);
  }
  /* Framer re-hydrates the hero + footer and wipes injected nodes — keep re-inserting */
  function watchHomeInjections() {
    if (document.getElementById("app")) return;
    var run = function () { heroSlider(); homeFooterCompany(); chat(); };
    run();
    [300, 900, 1800, 3000, 5000, 8000].forEach(function (t) { setTimeout(run, t); });
    var mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 12000);   /* hydration settled */
  }

  /* ---------- cookie consent ---------- */
  function cookieBanner(force) {
    var KEY = "cookie-consent";
    var existing = Store.get(KEY, null);
    if (existing && !force) { return; }
    if (document.querySelector(".az-cookie")) return;

    var el = h(
      '<div class="az-cookie" role="dialog" aria-label="Cookie notice">' +
        '<div class="az-cookie__text">' +
          "We use a few essential cookies to run the site and, with your consent, analytics to improve it. " +
          '<a href="#" data-more>Learn more</a>.' +
        "</div>" +
        '<div class="az-cookie__actions">' +
          '<button class="az-cookie__btn az-cookie__btn--ghost" data-decline>Essential only</button>' +
          '<button class="az-cookie__btn az-cookie__btn--accept" data-accept>Accept all</button>' +
        "</div>" +
      "</div>"
    );
    function choose(v) {
      Store.set(KEY, { choice: v, at: new Date().toISOString() });
      el.remove();
      document.dispatchEvent(new CustomEvent("antaraal:cookies", { detail: v }));
    }
    el.querySelector("[data-accept]").addEventListener("click", function () { choose("all"); });
    el.querySelector("[data-decline]").addEventListener("click", function () { choose("essential"); });
    el.querySelector("[data-more]").addEventListener("click", function (e) {
      e.preventDefault();
      el.querySelector(".az-cookie__text").innerHTML =
        "Essential cookies keep the site working (navigation, form state, your cookie choice). " +
        "Analytics cookies are only set if you choose “Accept all” and help us understand which " +
        "capabilities buyers search for. You can change this any time from the footer.";
    });
    document.body.appendChild(el);
  }

  /* ---------- general-query chat ---------- */
  var KB = [
    { q: /what is antaraal|about (antaraal|this)|who are you/i,
      a: "Antaraal is an aerospace supply-chain platform. Buyers discover and shortlist aerospace " +
         "vendors by capability and certification; vendors list their manufacturing and special-process " +
         "capabilities and respond to RFQs." },
    { q: /how (do i|to).*(apply|join|register|list)|become a (vendor|supplier)/i,
      a: "Open the <a href='apply.html'>Apply</a> page and choose “Apply as Vendor”. You’ll add your " +
         "company, capabilities, certifications and contact details. Our team reviews new vendors within " +
         "two business days." },
    { q: /buyer|source|find (a )?(vendor|supplier)|rfq|tender/i,
      a: "Browse <a href='products.html'>Products</a> by capability, or the full <a href='vendors.html'>Vendor</a> " +
         "directory with certification and location filters. Post a requirement on the " +
         "<a href='buyers.html'>Buyer</a> page and listed vendors can apply or bid." },
    { q: /verif|certif|as ?9100|nadcap/i,
      a: "Antaraal's own vendor verification is not live yet, so every supplier currently shows as " +
         "<b>pending verification</b>. Each profile still lists the certifications the supplier has " +
         "published (AS/EN 9100, AS 9120, NADCAP, ISO 9001, CEMILAC, CAR/EASA Part-145 and so on) so you " +
         "can assess them directly. Verified badges will return once our checks are complete." },
    { q: /lead ?time|delivery|how long|turnaround/i,
      a: "Each vendor profile shows typical lead time and on-time-delivery where the vendor has published it. " +
         "Firm lead and delivery dates are always confirmed per RFQ — request a quote to get committed dates." },
    { q: /contact|email|phone|call|reach|support|address|office/i,
      a: "You can reach us at <a href='mailto:" + COMPANY.email + "'>" + COMPANY.email + "</a> or " +
         "<a href='tel:+91" + COMPANY.phone.replace(/\D/g, "") + "'>+91 " + COMPANY.phone + "</a>. " +
         "Office: " + COMPANY.address + "." },
    { q: /price|cost|fee|charge|pricing/i,
      a: "Listing on the vendor directory is free while we build the network. RFQ and sourcing tools are " +
         "included. For enterprise sourcing support, email " +
         "<a href='mailto:" + COMPANY.email + "'>" + COMPANY.email + "</a>." }
  ];
  function botReply(text) {
    for (var i = 0; i < KB.length; i++) if (KB[i].q.test(text)) return KB[i].a;
    return "I can help with general questions about Antaraal — how to apply as a vendor, how buyers source " +
           "parts, what “Verified” means, or lead / delivery times. For anything specific, email " +
           "<a href='mailto:" + COMPANY.email + "'>" + COMPANY.email + "</a>.";
  }
  function chat() {
    if (document.querySelector(".az-chat")) return;
    var el = h(
      '<div class="az-chat">' +
        '<button class="az-chat__fab" aria-label="Open help chat">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>' +
        "</button>" +
        '<section class="az-chat__panel" hidden aria-label="General help">' +
          '<header class="az-chat__head"><b>Ask Antaraal</b><span>General queries &amp; help</span>' +
            '<button class="az-chat__x" aria-label="Close">&times;</button></header>' +
          '<div class="az-chat__log"></div>' +
          '<form class="az-chat__form"><input type="text" placeholder="Ask a question…" aria-label="Your question" autocomplete="off" required>' +
            '<button type="submit" aria-label="Send">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>' +
            "</button></form>" +
          '<p class="az-chat__note">Automated general-query assistant. Not a substitute for a quote or contract.</p>' +
        "</section>" +
      "</div>"
    );
    var fab = el.querySelector(".az-chat__fab"),
        panel = el.querySelector(".az-chat__panel"),
        log = el.querySelector(".az-chat__log"),
        form = el.querySelector(".az-chat__form"),
        input = form.querySelector("input");

    function add(who, html) {
      var m = h('<div class="az-chat__msg az-chat__msg--' + who + '"></div>');
      m.innerHTML = html;
      log.appendChild(m); log.scrollTop = log.scrollHeight;
    }
    function open(v) {
      panel.hidden = !v; fab.setAttribute("aria-expanded", String(v));
      if (v) el.classList.remove("az-chat--away");
      else if (el._azChatSync) el._azChatSync();
      if (v && !log.childElementCount) {
        add("bot", "Hi — I’m the Antaraal general-query assistant. Ask me about applying as a vendor, " +
                   "sourcing parts, verification, or lead times.");
        ["How do I apply as a vendor?", "What does Verified mean?", "How are lead times shown?"].forEach(function (s) {
          var b = h('<button class="az-chat__chip"></button>'); b.textContent = s;
          b.addEventListener("click", function () { send(s); });
          log.appendChild(b);
        });
      }
      if (v) setTimeout(function () { input.focus(); }, 50);
    }
    function send(text) {
      log.querySelectorAll(".az-chat__chip").forEach(function (c) { c.remove(); });
      add("me", esc(text));
      setTimeout(function () { add("bot", botReply(text)); }, 260);
    }
    fab.addEventListener("click", function () { open(panel.hidden); });
    el.querySelector(".az-chat__x").addEventListener("click", function () { open(false); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var t = input.value.trim(); if (!t) return; input.value = ""; send(t);
    });
    document.body.appendChild(el);

    /* On the Framer homepage the hero (video / main image) is a pinned layer, so
       keep the launcher out of it: hide while near the top, reveal once the
       reader has scrolled roughly a screen down. */
    if (!document.getElementById("app")) {
      var sync = function () {
        var past = (window.pageYOffset || 0) > Math.max(360, window.innerHeight * 0.7);
        el.classList.toggle("az-chat--away", !past && panel.hidden);
      };
      sync();
      window.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync, { passive: true });
      el._azChatSync = sync;   /* let open()/close() re-sync */
    }
  }

  /* ---------- widget styles (self-contained, load anywhere) ---------- */
  function injectCSS() {
    if (document.getElementById("az-widget-css")) return;
    var css = document.createElement("style");
    css.id = "az-widget-css";
    css.textContent = [
      /* hero slider */
      ".az-hero{position:absolute;inset:0;z-index:0;overflow:hidden}",
      ".az-hero__slide{position:absolute;inset:0;background-size:cover;background-position:center 42%;opacity:0;transition:opacity 1.4s ease}",
      ".az-hero__slide.is-active{opacity:1}",
      "[data-framer-name='Hero Background']{background-color:#0c1226}",
      "[data-framer-name='Hero Background'] video{opacity:0!important}",
      /* footer (app pages) */
      ".foot .foot__top{display:grid;grid-template-columns:1.4fr .7fr 1.6fr;gap:34px;padding:6px 0 30px}",
      ".foot__brand p{margin:12px 0 14px;font-size:13px;color:rgba(255,255,255,.55);max-width:34ch;line-height:1.6}",
      ".foot__brand b{color:#fff}",
      ".foot__social{display:flex;gap:10px}",
      ".foot__social a{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);border-radius:9px;color:rgba(255,255,255,.7)}",
      ".foot__social a:hover{color:#fff;border-color:rgba(255,255,255,.4)}",
      ".foot__links{display:flex;flex-direction:column;gap:9px;font-size:13.5px}",
      ".foot__company{font-style:normal;display:flex;flex-direction:column;gap:7px;font-size:12.5px;color:rgba(255,255,255,.6);line-height:1.6}",
      ".foot__company .foot__k{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4)}",
      ".foot__company a{color:rgba(255,255,255,.82)}.foot__company a:hover{color:#fff}",
      ".foot__bar{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)}",
      ".foot__bar a{color:rgba(255,255,255,.45)}.foot__bar a:hover{color:#fff}",
      "@media(max-width:820px){.foot .foot__top{grid-template-columns:1fr;gap:26px}}",
      /* homepage company / contact band — white text on the wine footer,
         forced below the Framer footer (which carries order:1003) */
      ".az-home-company{order:1004;background:#5E2140;color:rgba(255,255,255,.78);padding:48px 24px 34px;font-family:'Inter',system-ui,sans-serif;font-size:13.5px;line-height:1.65;border-top:1px solid rgba(255,255,255,.16)}",
      ".az-home-company__inner{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1.3fr 1fr;gap:30px 48px;align-items:start}",
      ".az-home-company .azc-col{display:flex;flex-direction:column;gap:10px}",
      ".az-home-company p{margin:0;color:rgba(255,255,255,.72);max-width:42ch}",
      ".az-home-company a{color:#fff;text-decoration:none}",
      ".az-home-company a:hover{text-decoration:underline}",
      ".az-home-company .foot__k{font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.5)}",
      ".az-home-company .azc-logo img{height:26px;width:auto;filter:brightness(0) invert(1)}",
      ".az-home-company .foot__social{margin-top:4px}",
      ".az-home-company .foot__social a{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.28);border-radius:9px;color:#fff}",
      ".az-home-company .foot__social a:hover{background:rgba(255,255,255,.12)}",
      ".az-home-company__bar{max-width:1160px;margin:26px auto 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.2);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px 20px;font-size:12px;color:rgba(255,255,255,.6)}",
      ".az-home-company__bar .azc-legal{display:flex;gap:18px;flex-wrap:wrap}",
      ".az-home-company__bar a{color:rgba(255,255,255,.75)}",
      ".az-home-company .azc-bigmark{display:block;max-width:1160px;margin:30px auto 0;text-align:center}",
      ".az-home-company .azc-bigmark img{height:clamp(44px,8vw,84px);width:auto;filter:brightness(0) invert(1);opacity:.92}",
      "@media(max-width:820px){.az-home-company{padding:34px 22px 24px}.az-home-company__inner{grid-template-columns:1fr;gap:24px}.az-home-company__bar{flex-direction:column}}",
      /* cookie */
      ".az-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:300;max-width:720px;margin:0 auto;background:#0c1226;color:#fff;border-radius:16px;padding:16px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;box-shadow:0 24px 60px -20px rgba(0,0,0,.5);font-family:'Inter',system-ui,sans-serif;font-size:13px;line-height:1.55}",
      ".az-cookie__text{flex:1;min-width:220px;color:rgba(255,255,255,.8)}",
      ".az-cookie__text a{color:#fff;text-decoration:underline}",
      ".az-cookie__actions{display:flex;gap:8px}",
      ".az-cookie__btn{border:0;cursor:pointer;font:inherit;font-weight:600;font-size:12.5px;padding:9px 16px;border-radius:999px;white-space:nowrap}",
      ".az-cookie__btn--ghost{background:transparent;border:1px solid rgba(255,255,255,.28);color:#fff}",
      ".az-cookie__btn--accept{background:#5E2140;color:#fff}",
      "@media(max-width:520px){.az-cookie__actions{width:100%}.az-cookie__btn{flex:1}}",
      /* chat */
      ".az-chat{position:fixed;right:20px;bottom:20px;z-index:290;font-family:'Inter',system-ui,sans-serif;transition:opacity .3s ease,transform .3s ease}",
      ".az-chat--away{opacity:0;transform:translateY(14px);pointer-events:none}",
      ".az-chat__panel[hidden]{display:none!important}",
      ".az-chat__fab{width:54px;height:54px;border:0;border-radius:50%;background:#5E2140;color:#fff;cursor:pointer;box-shadow:0 16px 40px -12px rgba(94,33,64,.6);display:grid;place-items:center;transition:transform .15s}",
      ".az-chat__fab:hover{transform:translateY(-2px)}",
      ".az-chat__panel{position:absolute;right:0;bottom:66px;width:340px;max-width:calc(100vw - 32px);background:#fff;border:1px solid rgba(30,26,46,.12);border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -18px rgba(30,26,46,.35);display:flex;flex-direction:column}",
      ".az-chat__head{background:#0c1226;color:#fff;padding:14px 16px;position:relative}",
      ".az-chat__head b{display:block;font-size:14px}.az-chat__head span{font-size:11.5px;color:rgba(255,255,255,.6)}",
      ".az-chat__x{position:absolute;right:10px;top:10px;background:none;border:0;color:rgba(255,255,255,.7);font-size:18px;cursor:pointer}",
      ".az-chat__log{padding:14px;display:flex;flex-direction:column;gap:9px;max-height:44vh;overflow:auto;background:#FBF7EF}",
      ".az-chat__msg{font-size:13px;line-height:1.5;padding:9px 12px;border-radius:12px;max-width:85%}",
      ".az-chat__msg a{color:#5E2140;text-decoration:underline}",
      ".az-chat__msg--bot{background:#fff;border:1px solid rgba(30,26,46,.1);align-self:flex-start}",
      ".az-chat__msg--me{background:#5E2140;color:#fff;align-self:flex-end}",
      ".az-chat__msg--me a{color:#fff}",
      ".az-chat__chip{font-size:12px;text-align:left;background:#fff;border:1px solid rgba(94,33,64,.3);color:#5E2140;border-radius:999px;padding:6px 12px;cursor:pointer;align-self:flex-start}",
      ".az-chat__chip:hover{background:#5E2140;color:#fff}",
      ".az-chat__form{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(30,26,46,.1)}",
      ".az-chat__form input{flex:1;border:1px solid rgba(30,26,46,.14);border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;outline:none}",
      ".az-chat__form input:focus{border-color:#5E2140}",
      ".az-chat__form button{border:0;width:38px;border-radius:50%;background:#5E2140;color:#fff;cursor:pointer;display:grid;place-items:center}",
      ".az-chat__note{margin:0;padding:8px 12px 10px;font-size:10.5px;color:rgba(30,26,46,.4);text-align:center}",
      "@media(max-width:520px){.az-chat__panel{width:calc(100vw - 32px)}}"
    ].join("");
    document.head.appendChild(css);
  }

  /* ---------- boot ---------- */
  function boot() {
    injectCSS();
    var host = document.getElementById("app");
    if (host) {                                   /* app pages */
      document.body.insertBefore(buildNav(), document.body.firstChild);
      document.body.appendChild(buildFooter());
    } else {                                       /* Framer homepage */
      watchHomeInjections();
    }
    applyCounts();
    cookieBanner(false);
    chat();

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-az-cookie-settings]")) { e.preventDefault(); cookieBanner(true); }
    });
  }

  window.Antaraal = {
    data: window.ANTARAAL_DATA || {},
    Store: Store, modal: modal, h: h, esc: esc, fmtDate: fmtDate, daysLeft: daysLeft,
    stats: stats, COMPANY: COMPANY, openChat: chat,
    verificationLive: VERIFICATION_LIVE
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
