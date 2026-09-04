/* ===========================================================================
   Antaraal — page data
   ---------------------------------------------------------------------------
   This is the ONLY file you edit to populate Products / Vendor / Buyer pages.
   Replace the sample rows below with your real catalogue. Keep the field names.
   =========================================================================== */

window.ANTARAAL_DATA = {

  /* -------------------------------------------------------------------------
     PRODUCT CATEGORIES  (shown as filter chips on the Products page)
     ---------------------------------------------------------------------- */
  categories: [
    "Avionics",
    "Airframe & Structures",
    "Engine & APU",
    "Landing Gear",
    "Interiors",
    "Consumables & Hardware",
  ],

  /* -------------------------------------------------------------------------
     PRODUCTS  (Products page)
       id         unique slug
       name       product / part name
       category   must match one of `categories`
       partNo     manufacturer / catalogue number (optional)
       industry   free text — used by the "vendor by industry" search
       vendorId   id of the vendor that supplies it (links to Vendor page)
       vendorName display name of that vendor
     ---------------------------------------------------------------------- */
  products: [
    { id:"p-nav-radio",  name:"VHF Nav/Comm Transceiver", category:"Avionics",
      partNo:"KX-155A", industry:"Avionics & instrumentation",
      vendorId:"v-skyline", vendorName:"Skyline Avionics Pvt Ltd" },

    { id:"p-brake-assy", name:"Main Wheel Brake Assembly", category:"Landing Gear",
      partNo:"BA-32-114", industry:"Landing gear & braking systems",
      vendorId:"v-garuda", vendorName:"Garuda Aerostructures" },

    { id:"p-seat-track", name:"Seat Track Extrusion (per m)", category:"Airframe & Structures",
      partNo:"ST-7075-2.1", industry:"Airframe machining & extrusions",
      vendorId:"v-orbit", vendorName:"Orbit Precision Works" },
  ],

  /* -------------------------------------------------------------------------
     VENDORS  (Vendor page)
       id          unique slug (referenced by products + tenders)
       name        company name
       verified    true  -> "Verified by Antaraal" badge + highlighted card
                   false -> plain card, marked "Unverified"
       location    city, country
       rating      0–5 (one decimal ok)
       reviews     number of reviews behind that rating
       leadTime    typical lead time, free text
       capacity    monthly / annual capacity, free text
       efficiency  on-time / yield %, free text
       leads       open enquiries count
       calls       calls booked / handled count
       fields      array of industries served (used by Products search)
     ---------------------------------------------------------------------- */
  vendors: [
    { id:"v-skyline", name:"Skyline Avionics Pvt Ltd", verified:true,
      location:"Bengaluru, IN", rating:4.7, reviews:38,
      leadTime:"3–5 weeks", capacity:"120 units / month", efficiency:"96% on-time",
      leads:14, calls:9, fields:["Avionics","Antennas","Aerospace Certifications"] },

    { id:"v-garuda", name:"Garuda Aerostructures", verified:true,
      location:"Hyderabad, IN", rating:4.4, reviews:21,
      leadTime:"6–9 weeks", capacity:"40 assemblies / month", efficiency:"92% on-time",
      leads:8, calls:5, fields:["Aerostructures","Aerospace Machining","Brakes"] },

    { id:"v-orbit", name:"Orbit Precision Works", verified:false,
      location:"Pune, IN", rating:3.9, reviews:6,
      leadTime:"4–7 weeks", capacity:"Not disclosed", efficiency:"Self-reported 90%",
      leads:3, calls:1, fields:["CNC Machining","Aerospace Machining","Extrusions"] },
  ],

  /* -------------------------------------------------------------------------
     TENDERS  (Buyer page)  — 2 to 3 active tenders
       id            unique slug
       title         what the buyer needs
       buyer         buyer / airline / operator name
       private       true  -> "Private company" badge
       capacity      buyer's stated procurement capacity / volume
       quantity      quantity required
       deadline      ISO date string "YYYY-MM-DD"
       location      delivery location
       summary       1–2 line description
     ---------------------------------------------------------------------- */
  tenders: [
    { id:"t-brake-batch", title:"Brake assemblies — A320 family, 60 units",
      buyer:"IndeAir Fleet Services", private:false,
      capacity:"₹8–12 Cr / quarter", quantity:"60 units", deadline:"2026-10-15",
      location:"Delhi (DEL)",
      summary:"New or serviceable main wheel brake assemblies with full trace and 8130-3." },

    { id:"t-avionics-fit", title:"VHF Nav/Comm retrofit — 12 aircraft",
      buyer:"Confidential regional carrier", private:true,
      capacity:"₹3–5 Cr", quantity:"12 shipsets", deadline:"2026-11-02",
      location:"Bengaluru (BLR)",
      summary:"Supply + STC support for VHF Nav/Comm transceivers across a turboprop fleet." },

    { id:"t-seat-track", title:"Seat track extrusions — 400 m",
      buyer:"Antaraal Interiors Partner", private:false,
      capacity:"₹40–60 L", quantity:"400 running metres", deadline:"2026-09-28",
      location:"Pune (PNQ)",
      summary:"7075-T6 seat track extrusions to drawing, batch-tested, delivered in 4 lots." },
  ],
};
