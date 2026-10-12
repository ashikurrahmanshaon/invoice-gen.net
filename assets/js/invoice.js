/* invoice-gen.net — invoice data model, maths and money formatting */
(function () {
  "use strict";
  const IG = (window.IG = window.IG || {});

  IG.CURRENCIES = [
    ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"], ["CAD", "Canadian Dollar"],
    ["AUD", "Australian Dollar"], ["CHF", "Swiss Franc"], ["JPY", "Japanese Yen"], ["SGD", "Singapore Dollar"],
    ["AED", "UAE Dirham"], ["SAR", "Saudi Riyal"], ["INR", "Indian Rupee"], ["BDT", "Bangladeshi Taka"],
    ["NZD", "New Zealand Dollar"], ["CNY", "Chinese Yuan"], ["NGN", "Nigerian Naira"], ["KES", "Kenyan Shilling"],
    ["ZAR", "South African Rand"], ["PHP", "Philippine Peso"], ["IDR", "Indonesian Rupiah"], ["NPR", "Nepalese Rupee"],
    ["MYR", "Malaysian Ringgit"], ["PKR", "Pakistani Rupee"], ["SEK", "Swedish Krona"], ["BRL", "Brazilian Real"],
    ["MXN", "Mexican Peso"], ["TRY", "Turkish Lira"], ["QAR", "Qatari Riyal"], ["KWD", "Kuwaiti Dinar"]
  ];

  // Labels that change with the document type typed at the top (Invoice, Quote, Receipt...)
  IG.DOC_TITLES = ["Invoice", "Quotation", "Quote", "Receipt", "Proforma Invoice", "Estimate", "Tax Invoice", "Bill"];
  IG.docLabels = function (title) {
    const t = String(title || "").toLowerCase();
    if (t.indexOf("quot") >= 0) return { no: "Quote no.", due: "Valid until", bal: "Total due" };
    if (t.indexOf("estimate") >= 0) return { no: "Estimate no.", due: "Valid until", bal: "Estimated total" };
    if (t.indexOf("receipt") >= 0) return { no: "Receipt no.", due: "Payment date", bal: "Balance due" };
    return { no: "Invoice no.", due: "Due date", bal: "Balance due" };
  };

  IG.TEMPLATES = ["classic", "modern", "minimal"];

  IG.ACCENTS = [["#111827", "Black"], ["#047857", "Emerald"], ["#1d4ed8", "Blue"], ["#7c3aed", "Purple"], ["#be123c", "Red"], ["#c2410c", "Orange"]];
  IG.DEFAULT_ACCENT = "#111827";

  const pad = (n) => String(n).padStart(2, "0");
  IG.isoDate = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };
  IG.addDays = function (iso, days) {
    const d = iso ? new Date(iso + "T00:00:00") : new Date();
    d.setDate(d.getDate() + days);
    return IG.isoDate(d);
  };
  IG.prettyDate = function (iso) { return IG.formatDate(iso); };

  IG.uid = function () {
    return Math.random().toString(36).slice(2, 10);
  };

  IG.nextNumber = function () {
    const n = IG.store.get("ig_counter", 0) + 1;
    return "INV-" + String(n).padStart(4, "0");
  };
  IG.bumpNumber = function (num) {
    const m = /(\d+)\s*$/.exec(num || "");
    if (!m) return;
    const n = parseInt(m[1], 10);
    if (n > IG.store.get("ig_counter", 0)) IG.store.set("ig_counter", n);
  };

  IG.blankInvoice = function (profile) {
    const p = profile || IG.store.get("ig_profile", {}) || {};
    const today = IG.isoDate(new Date());
    const reg = IG.REGIONS[p.region] ? p.region : IG.guessRegion();
    return {
      id: null,
      title: IG.REGIONS[reg].title || "Invoice",
      region: reg,
      unit: "qty",
      fields: [],
      number: IG.nextNumber(),
      issueDate: today,
      dueDate: IG.addDays(today, p.dueDays != null ? p.dueDays : 14),
      poNumber: "",
      currency: p.currency || IG.REGIONS[reg].cur || "USD",
      template: (p.tplPicked && p.template) || "classic",
      accent: (p.accentPicked && p.accent) || IG.DEFAULT_ACCENT,
      accentPicked: !!(p.accentPicked && p.accent),
      logo: p.logo || null,
      logoW: p.logoW || 0,
      logoH: p.logoH || 0,
      from: {
        name: p.name || "",
        email: p.email || "",
        address: p.address || "",
        phone: p.phone || "",
        taxId: p.taxId || "",
        bank: p.bank || ""
      },
      to: { name: "", email: "", address: "", phone: "", taxId: "" },
      supplyDate: "",
      placeOfSupply: "",
      gstSplit: "intra",
      taxNote: "",
      items: [{ id: IG.uid(), desc: "", qty: 1, rate: 0 }],
      mode: "standard",
      service: p.service || "",
      hourRate: p.hourRate || "",
      shipTo: "",
      shifts: [IG.blankShift(today)],
      discount: 0,
      discountType: "%",
      taxLabel: p.taxLabel || IG.REGIONS[reg].tax,
      taxRate: p.taxRate != null ? p.taxRate : 0,
      shipping: 0,
      paid: 0,
      notes: p.notes || "",
      terms: p.terms || "Payment is due by the due date shown above. Thank you for your business.",
      status: "draft"
    };
  };

  const num = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isFinite(n) ? n : 0;
  };
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  /* ---------- timesheet (shifts with start, end and break) ---------- */
  IG.WORK_TYPES = ["Kitchen", "House", "Kitchen & House", "House (Deep Cleaning)", "Bar", "Service", "Front of house", "Cleaning", "Dishwashing", "Delivery", "Event", "Training"];
  IG.BREAKS = [0, 15, 30, 45, 60, 90];
  IG.blankShift = function (date) {
    return { id: IG.uid(), date: date || IG.isoDate(new Date()), type: "", start: "", end: "", brk: 0, hours: "", manual: false };
  };
  const mins = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  /* hours between start and end, minus the break; an end at or before the start runs past midnight */
  IG.autoHours = function (s) {
    const a = mins(s.start), b = mins(s.end);
    if (a == null || b == null) return null;
    let d = b - a;
    if (d <= 0) d += 1440;
    d -= +s.brk || 0;
    return Math.max(0, Math.round((d / 60 + Number.EPSILON) * 100) / 100);
  };
  IG.shiftHours = function (s) {
    if (!s.manual) { const h = IG.autoHours(s); if (h != null) return h; }
    const n = parseFloat(String(s.hours == null ? "" : s.hours).replace(",", "."));
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  };
  IG.totalHours = function (inv) {
    return Math.round((inv.shifts || []).reduce((a, s) => a + IG.shiftHours(s), 0) * 100) / 100;
  };
  IG.isTimesheet = (inv) => inv && inv.mode === "timesheet";
  IG.effectiveItems = function (inv) {
    if (!IG.isTimesheet(inv)) return inv.items || [];
    return [{ id: "ts", desc: (inv.service || "").trim() || "Hours worked", qty: IG.totalHours(inv), rate: inv.hourRate }];
  };
  IG.fmtHours = function (h) {
    const loc = (IG.REGIONS[IG.region] || IG.REGIONS.us).locale;
    try { return new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(h || 0); } catch (e) { return String(h || 0); }
  };
  IG.fmtTime = function (t) {
    const m = mins(t);
    if (m == null) return "";
    const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
    if (IG.region === "us") return ((h % 12) || 12) + ":" + mm + (h < 12 ? " AM" : " PM");
    return String(h).padStart(2, "0") + ":" + mm;
  };
  IG.fmtBreak = (b) => (+b ? (+b) + " min" : "0 min");

  IG.calc = function (inv) {
    const lines = IG.effectiveItems(inv).map((it) => round2(num(it.qty) * num(it.rate)));
    const subtotal = round2(lines.reduce((a, b) => a + b, 0));
    const discount = inv.discountType === "%" ? round2(subtotal * num(inv.discount) / 100) : round2(num(inv.discount));
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = round2(afterDiscount * num(inv.taxRate) / 100);
    const shipping = round2(num(inv.shipping));
    const total = round2(afterDiscount + tax + shipping);
    const paid = round2(num(inv.paid));
    const balance = round2(total - paid);
    return { lines, subtotal, discount, tax, shipping, total, paid, balance };
  };

  /* Regional styles. Each profile follows that region's invoice rules:
     UK: HMRC full VAT invoice · EU: VAT Directive art. 226 · India: CGST Rule 46
     UAE: FTA tax invoice · Australia: ATO tax invoice · Canada: CRA GST/HST
     Japan: qualified invoice system. Fields that a region doesn't use stay hidden. */
  IG.REGIONS = {
    us: { name: "United States", locale: "en-US", paper: "letter", tax: "Sales tax", date: "mdy", cur: "USD",
      title: "Invoice", taxId: "EIN / Tax ID", taxIdPh: "Optional", rateHint: "Sales tax depends on the state and city.",
      check: ["number", "date", "from", "to", "items", "due"] },
    uk: { name: "United Kingdom", locale: "en-GB", paper: "a4", tax: "VAT", date: "dmy-text", cur: "GBP",
      title: "Invoice", taxId: "VAT reg. no.", taxIdPh: "GB123456789", clientTaxId: "Client VAT no.", supply: "Tax point", rate: 20,
      rateHint: "Standard VAT is 20%. Only charge VAT if you are VAT registered.", notes: ["rc", "exempt"],
      check: ["number", "date", "supply", "from", "taxId", "to", "items", "rate"] },
    eu: { name: "Europe", locale: "de-DE", paper: "a4", tax: "VAT", date: "dmy-dot", cur: "EUR",
      title: "Invoice", taxId: "VAT ID", taxIdPh: "DE123456789", clientTaxId: "Client VAT ID", supply: "Date of supply", bank: true, layout: "eu",
      rateHint: "VAT is set by each country, from 17% to 27%. Small businesses that are exempt can add the exemption note.", notes: ["rc", "exempt"],
      check: ["number", "date", "supply", "from", "taxId", "to", "items", "rate"] },
    ca: { name: "Canada", locale: "en-CA", paper: "letter", tax: "GST", date: "dmy-text", cur: "CAD",
      title: "Invoice", taxId: "GST/HST no.", taxIdPh: "123456789 RT0001", rate: 5,
      rateHint: "GST is 5%. Provinces with HST use 13% to 15%; name the tax HST if so.",
      check: ["number", "date", "from", "taxId", "to", "items", "rate"] },
    au: { name: "Australia / New Zealand", locale: "en-AU", paper: "a4", tax: "GST", date: "dmy-slash", cur: "AUD",
      title: "Tax Invoice", taxId: "ABN", taxIdPh: "51 824 753 556", clientTaxId: "Client ABN", rate: 10, inclNote: true,
      rateHint: "GST is 10% in Australia and 15% in New Zealand (use GST number instead of ABN).",
      check: ["title", "number", "date", "from", "taxId", "to", "items", "rate"] },
    jp: { name: "Japan", locale: "ja-JP", paper: "a4", tax: "Consumption tax", date: "ymd-slash", cur: "JPY",
      title: "Invoice", taxId: "Registration no.", taxIdPh: "T1234567890123", supply: "Transaction date", rate: 10, rateSummary: true,
      rateHint: "Standard rate 10%, reduced rate 8% for food and newspapers. The tax is shown per rate.",
      check: ["number", "supply", "from", "taxId", "to", "items", "rate"] },
    asia: { name: "Asia (other)", locale: "en-SG", paper: "a4", tax: "GST", date: "dmy-slash", cur: "SGD",
      title: "Invoice", taxId: "Tax / GST reg. no.", taxIdPh: "Optional",
      rateHint: "Singapore GST is 9%. Use your local tax name and rate.",
      check: ["number", "date", "from", "to", "items"] },
    sa: { name: "India / South Asia", locale: "en-IN", paper: "a4", tax: "GST", date: "dmy-slash", cur: "INR",
      title: "Tax Invoice", taxId: "GSTIN", taxIdPh: "22AAAAA0000A1Z5", clientTaxId: "Client GSTIN", pos: true, code: "HSN/SAC",
      split: true, words: true, sign: true, rate: 18, layout: "in",
      rateHint: "Common GST rates are 5%, 12%, 18% and 28%. Same state: CGST + SGST. Other state: IGST.",
      check: ["title", "number", "date", "from", "taxId", "to", "pos", "items", "rate"] },
    me: { name: "Middle East (UAE, Gulf)", locale: "en-AE", paper: "a4", tax: "VAT", date: "dmy-slash", cur: "AED",
      title: "Tax Invoice", taxId: "TRN", taxIdPh: "100123456700003", clientTaxId: "Client TRN", supply: "Date of supply", rate: 5,
      rateHint: "UAE VAT is 5%; Saudi Arabia 15%. Show the TRN of both sides on B2B invoices.", notes: ["rc"],
      check: ["title", "number", "date", "supply", "from", "taxId", "to", "items", "rate"] }
  };
  IG.TAX_NOTES = {
    rc: "Reverse charge: the customer is liable for the VAT on this supply.",
    exempt: "VAT exempt: no VAT is charged under the small business scheme."
  };
  IG.TAX_NAMES = ["Tax", "Sales tax", "VAT", "GST", "Sales Tax", "Consumption tax"];
  IG.REGION_TITLES = ["Invoice", "Tax Invoice"];
  IG.guessRegion = function () {
    const l = (navigator.language || "en-US").toLowerCase();
    if (l === "en-gb" || l === "en-ie") return l === "en-ie" ? "eu" : "uk";
    if (/^en-(au|nz)/.test(l)) return "au";
    if (/^en-ca/.test(l) || /^fr-ca/.test(l)) return "ca";
    if (/^ja/.test(l)) return "jp";
    if (/^(de|fr|es|it|nl|pt|pl|sv|da|fi|nb|no|cs|sk|hu|ro|el|bg|hr|sl|et|lv|lt)/.test(l)) return "eu";
    if (/^(zh|ko|th|vi|id|ms|fil)/.test(l) || /^en-(sg|my|ph|hk)/.test(l)) return "asia";
    if (/^(hi|bn|ur|ta|te|ne|si|mr|gu|kn|ml|pa)/.test(l) || /^en-(in|pk|bd|lk|np)/.test(l)) return "sa";
    if (/^(ar|he|fa)/.test(l) || /^en-(ae|sa|qa|kw|bh|om)/.test(l)) return "me";
    return "us";
  };
  IG.R = function (inv) { return IG.REGIONS[(inv && inv.region) || IG.region] || IG.REGIONS.us; };

  /* India: tax split into CGST + SGST (same state) or IGST (other state) */
  IG.taxLines = function (inv, t) {
    const R = IG.R(inv), rate = parseFloat(inv.taxRate) || 0;
    if (!t.tax && !rate) return [];
    if (R.split) {
      if (inv.gstSplit === "inter") return [["IGST (" + rate + "%)", t.tax]];
      const half = Math.round((t.tax / 2 + Number.EPSILON) * 100) / 100;
      const r2 = Math.round(rate / 2 * 100) / 100;
      return [["CGST (" + r2 + "%)", half], ["SGST (" + r2 + "%)", Math.round((t.tax - half) * 100) / 100]];
    }
    return [[(inv.taxLabel || R.tax || "Tax") + " (" + rate + "%)", t.tax]];
  };

  /* Amount in words, as written on Indian (lakh, crore) and international invoices */
  const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function below1000(n) {
    let s = "";
    if (n >= 100) { s += ONES[Math.floor(n / 100)] + " hundred"; n %= 100; if (n) s += " and "; }
    if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += "-" + ONES[n % 10]; }
    else if (n) s += ONES[n];
    return s;
  }
  function words(n, indian) {
    if (n === 0) return "zero";
    const parts = [];
    const units = indian ? [[1e7, "crore"], [1e5, "lakh"], [1e3, "thousand"]] : [[1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
    for (const [v, w] of units) { if (n >= v) { parts.push(words(Math.floor(n / v), indian) + " " + w); n %= v; } }
    if (n) parts.push(below1000(n));
    return parts.join(" ");
  }
  const CUR_WORDS = { INR: ["rupees", "paise"], USD: ["dollars", "cents"], EUR: ["euros", "cents"], GBP: ["pounds", "pence"], AED: ["dirhams", "fils"], SAR: ["riyals", "halalas"], BDT: ["taka", "paisa"], PKR: ["rupees", "paisa"], NPR: ["rupees", "paisa"], LKR: ["rupees", "cents"], AUD: ["dollars", "cents"], CAD: ["dollars", "cents"], SGD: ["dollars", "cents"] };
  IG.amountInWords = function (amount, currency) {
    const a = Math.abs(Math.round((amount || 0) * 100));
    const whole = Math.floor(a / 100), frac = a % 100;
    const cw = CUR_WORDS[currency] || [currency, "cents"];
    const indian = ["INR", "BDT", "PKR", "NPR"].indexOf(currency) >= 0;
    let s = words(whole, indian) + " " + cw[0];
    if (frac) s += " and " + words(frac, false) + " " + cw[1];
    s += " only";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  IG.region = "us";
  IG.setRegion = function (r) { IG.region = IG.REGIONS[r] ? r : "us"; };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  IG.formatDate = function (iso, region) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    const R = IG.REGIONS[region || IG.region] || IG.REGIONS.us;
    const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0"), y = d.getFullYear();
    switch (R.date) {
      case "mdy": return MON[d.getMonth()] + " " + d.getDate() + ", " + y;
      case "dmy-dot": return dd + "." + mm + "." + y;
      case "dmy-slash": return dd + "/" + mm + "/" + y;
      case "iso": return y + "-" + mm + "-" + dd;
      case "ymd-slash": return y + "/" + mm + "/" + dd;
      default: return d.getDate() + " " + MON[d.getMonth()] + " " + y;
    }
  };
  /* What the quantity column counts */
  IG.UNITS = {
    qty: { name: "Quantity", q: "Qty", r: "Rate" },
    hours: { name: "Hours", q: "Hours", r: "Rate / hr" },
    days: { name: "Days", q: "Days", r: "Rate / day" }
  };

  const fmtCache = {};
  IG.money = function (amount, currency) {
    const c = currency || "USD";
    const loc = (IG.REGIONS[IG.region] || IG.REGIONS.us).locale;
    const key = loc + c;
    try {
      if (!fmtCache[key]) {
        fmtCache[key] = new Intl.NumberFormat(loc, { style: "currency", currency: c, currencyDisplay: "narrowSymbol" });
      }
      return fmtCache[key].format(amount || 0);
    } catch (e) {
      return c + " " + (amount || 0).toFixed(2);
    }
  };

  /* PDF fonts only cover Latin-1 + €, so swap other symbols for the ISO code */
  IG.moneyPdf = function (amount, currency) {
    const s = IG.money(amount, currency).replace("\uFFE5", "\u00A5");
    // eslint-disable-next-line no-control-regex
    if (/^[\u0000-ÿ€\s\-−.,0-9]*$/.test(s)) return s.replace("−", "-");
    let fd = 2;
    try { fd = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits; } catch (e) { /* keep 2 */ }
    const digits = new Intl.NumberFormat((IG.REGIONS[IG.region] || IG.REGIONS.us).locale, { minimumFractionDigits: fd, maximumFractionDigits: fd }).format(Math.abs(amount || 0));
    const sym = { INR: "Rs.", PKR: "Rs.", NPR: "Rs.", LKR: "Rs." }[currency] || currency;
    return (amount < 0 ? "-" : "") + sym + " " + digits;
  };

  IG.validEmail = function (s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());
  };
})();
