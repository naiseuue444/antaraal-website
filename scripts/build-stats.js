#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Antaraal — regenerate every derived vendor count from app/vendors.js
   (the single source of truth).

     node scripts/build-stats.js

   Updates:
     • app/stats.js                    (read by the homepage + product page)
     • index.html                       (homepage stat counters + labels)
     • m/1yBA…DzuWCxhs.mjs               (hydrated homepage stat counters + labels)

   The Vendor page counts app/vendors.js directly in the browser, so it is
   always live. Run this script whenever you add / edit / remove vendors.
   --------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const src = fs.readFileSync(path.join(root, "app/vendors.js"), "utf8");
const list = JSON.parse(src.slice(src.indexOf("["), src.lastIndexOf("]") + 1));

const AERO = /\bAS\s?9100\b|\bAS\s?9110\b|\bAS\s?9120\b|\bEN\s?9100\b|\bEN\s?9110\b|NADCAP|CEMILAC|EASA\s?PART[- ]?145|CAR[- ]?145|AQMS\s?9110/i;

let verified = 0;
const caps = new Set(), locs = new Set();
for (const v of list) {
  const lvl = v.certLevel || (AERO.test(v.certText || "") ? "aerospace" : (v.certText ? "iso" : "none"));
  if (lvl === "aerospace") verified++;
  (v.categories || []).forEach((c) => caps.add(c));
  if (v.location) locs.add(v.location);
}
const S = {
  vendors: list.length,
  verified,
  pending: list.length - verified,
  capabilities: caps.size,
  locations: locs.size,
};

/* ---- app/stats.js ---- */
fs.writeFileSync(
  path.join(root, "app/stats.js"),
  "/* Auto-generated from app/vendors.js — run `node scripts/build-stats.js` after editing vendor data. */\n" +
  "window.ANTARAAL_STATS = " + JSON.stringify(S) + ";\n"
);

/* ---- homepage counters ----
   [ old label , new label , new value ]  — first stat group then second     */
const rounded = S.vendors >= 100 ? Math.floor(S.vendors / 10) * 10 : S.vendors;
const capsN   = S.capabilities;
const MAP = [
  ["Verified vendors", "Listed suppliers",   rounded, true],   // "+" suffix
  ["Parts listed",     "Aerospace-verified", S.verified, false],
  ["Cities served",    "Locations",          S.locations, false],
  ["Certifications",   "Aerospace-verified", S.verified, false],
];
// "Capabilities" keeps its label, just the number
const NUMS = [
  ["Capabilities", capsN, false],
];

function patchModule(file) {
  let s = fs.readFileSync(file, "utf8"), n = 0;
  // labels
  for (const [oldL, newL] of MAP) {
    const re = new RegExp("children:`" + oldL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "`", "g");
    if (re.test(s)) { s = s.replace(re, "children:`" + newL + "`"); n++; }
  }
  // first-group targetValues by (now-updated) label proximity is fiddly; instead
  // rewrite the four known targetValues in document order: 500,1200,12  + 30 + 500,25,8
  s = s.replace(/targetValue:500,/g, "targetValue:" + rounded + ",");
  s = s.replace(/targetValue:1200,/g, "targetValue:" + S.verified + ",");
  s = s.replace(/targetValue:12,/g, "targetValue:" + S.locations + ",");
  s = s.replace(/targetValue:30,/g, "targetValue:" + capsN + ",");
  s = s.replace(/UIKsWXOdN:500,/g, "UIKsWXOdN:" + rounded + ",");
  s = s.replace(/UIKsWXOdN:25,/g, "UIKsWXOdN:" + S.verified + ",");
  s = s.replace(/UIKsWXOdN:8,/g, "UIKsWXOdN:" + S.locations + ",");
  s = s.replace(/nkGqvTHvs:`Certifications`/g, "nkGqvTHvs:`Aerospace-verified`");
  s = s.replace(/nkGqvTHvs:`Regions`/g, "nkGqvTHvs:`Locations`");
  s = s.replace(/nkGqvTHvs:`Vendors`/g, "nkGqvTHvs:`Suppliers`");
  fs.writeFileSync(file, s);
  return n;
}

function patchSSR(file) {
  let s = fs.readFileSync(file, "utf8");
  for (const [oldL, newL] of MAP) {
    s = s.split(">" + oldL + "</h5>").join(">" + newL + "</h5>");
    s = s.split(">" + oldL + "</p>").join(">" + newL + "</p>");
  }
  s = s.replace(/nowrap">500<!-- -->\+<\/span>/g, 'nowrap">' + rounded + '<!-- -->+</span>');
  s = s.replace(/nowrap">1200<!-- -->\+<\/span>/g, 'nowrap">' + S.verified + "</span>");
  s = s.replace(/nowrap">12<\/span>/g, 'nowrap">' + S.locations + "</span>");
  s = s.replace(/nowrap">30<\/span>/g, 'nowrap">' + capsN + "</span>");
  s = s.replace(/nowrap">25<!-- -->\+<\/span>/g, 'nowrap">' + S.verified + "</span>");
  s = s.replace(/nowrap">8<\/span>/g, 'nowrap">' + S.locations + "</span>");
  s = s.replace(/>Certifications<\/p>/g, ">Aerospace-verified</p>");
  s = s.replace(/>Regions<\/p>/g, ">Locations</p>");
  s = s.replace(/>Vendors<\/p>/g, ">Suppliers</p>");
  fs.writeFileSync(file, s);
}

const mod = path.join(root, "m/1yBA6OXgjKuyHrR7YGG_EeXRAsIKFjaN4oxXkSAq6e0.DzuWCxhs.mjs");
patchModule(mod);
patchSSR(path.join(root, "index.html"));

console.log("stats:", S);
console.log("updated app/stats.js, index.html, homepage module");
