/* ===========================================================================
   Antaraal — shared UI (nav, footer, modal, local storage)
   =========================================================================== */
(function () {
  var LOGO = "m/antaraal-logo.png";

  var NAV = [
    { label: "Products", href: "products.html" },
    { label: "Vendor",   href: "vendors.html"  },
    { label: "Buyer",    href: "buyers.html"   },
  ];
  var CTA = { label: "Apply", href: "apply.html" };

  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  /* ---------- header ---------- */
  function buildNav() {
    var links = NAV.map(function (n) {
      var active = n.href.toLowerCase() === here ? " nav__link--active" : "";
      return '<a class="nav__link' + active + '" href="' + n.href + '">' + n.label + "</a>";
    }).join("");

    var el = h(
      '<header class="nav">' +
        '<div class="nav__inner">' +
          '<a class="nav__logo" href="index.html" aria-label="Antaraal home">' +
            '<img src="' + LOGO + '" alt="Antaraal">' +
          "</a>" +
          '<div class="nav__spacer"></div>' +
          '<button class="nav__burger" aria-label="Menu" aria-expanded="false">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
          "</button>" +
          '<nav class="nav__links">' + links +
            '<a class="nav__cta" href="' + CTA.href + '">' + CTA.label + "</a>" +
          "</nav>" +
        "</div>" +
      "</header>"
    );

    var burger = el.querySelector(".nav__burger");
    var menu = el.querySelector(".nav__links");
    function isMobile() { return window.matchMedia("(max-width:820px)").matches; }
    function setOpen(open) {
      menu.hidden = isMobile() ? !open : false;
      burger.setAttribute("aria-expanded", String(open));
    }
    setOpen(false);
    burger.addEventListener("click", function () {
      setOpen(menu.hidden);
    });
    window.addEventListener("resize", function () { setOpen(false); });

    return el;
  }

  /* ---------- footer ---------- */
  function buildFooter() {
    return h(
      '<footer class="foot"><div class="wrap foot__inner">' +
        '<a class="foot__logo" href="index.html"><img src="' + LOGO + '" alt="Antaraal"></a>' +
        '<div class="foot__links">' +
          '<a href="products.html">Products</a>' +
          '<a href="vendors.html">Vendor</a>' +
          '<a href="buyers.html">Buyer</a>' +
          '<a href="apply.html">Apply</a>' +
          '<a href="index.html">Home</a>' +
        "</div>" +
        "<small>&copy; " + new Date().getFullYear() + " Antaraal. All rights reserved.</small>" +
      "</div></footer>"
    );
  }

  function mount() {
    var host = document.getElementById("app");
    if (!host) return;
    document.body.insertBefore(buildNav(), document.body.firstChild);
    document.body.appendChild(buildFooter());
  }

  /* ---------- tiny local store (per browser) ---------- */
  var Store = {
    get: function (key, fallback) {
      try { return JSON.parse(localStorage.getItem("antaraal:" + key)) || fallback; }
      catch (e) { return fallback; }
    },
    push: function (key, value) {
      var arr = Store.get(key, []);
      arr.push(Object.assign({ _ts: Date.now() }, value));
      try { localStorage.setItem("antaraal:" + key, JSON.stringify(arr)); } catch (e) {}
      return arr;
    },
    count: function (key) { return Store.get(key, []).length; },
  };

  /* ---------- modal ---------- */
  function modal(title, bodyNode) {
    var box = h(
      '<div class="modal"><div class="modal__wrap modal__box">' +
        '<button class="modal__x" aria-label="Close">&times;</button>' +
        '<h3></h3><div class="modal__body"></div>' +
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

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function daysLeft(iso) {
    var d = new Date(iso + "T00:00:00");
    return Math.ceil((d - Date.now()) / 86400000);
  }

  window.Antaraal = {
    data: window.ANTARAAL_DATA || {},
    Store: Store,
    modal: modal,
    h: h,
    esc: esc,
    fmtDate: fmtDate,
    daysLeft: daysLeft,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
