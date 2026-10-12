/* invoice-gen.net — invoice generator: type straight onto the invoice, options in the side panel */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let inv = null;
  let user = null;
  let clients = [];
  let saveTimer = null;
  let cloudSaving = false;

  const INSERTS = {
    bank: "Bank transfer\nBank: \nAccount name: \nAccount number / IBAN: \nSWIFT / BIC: \nPlease use the invoice number as the reference.",
    online: "Online payment\nPayPal: \nWise: ",
    link: "Pay online\nPayment link: "
  };

  function getPath(obj, path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj); }
  function setPath(obj, path, value) {
    const keys = path.split("."), last = keys.pop();
    keys.reduce((o, k) => (o[k] = o[k] || {}), obj)[last] = value;
  }
  const esc = (s) => IG.esc(s);
  const M = (v) => IG.money(v, inv.currency);

  function autosize(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + 2 + "px"; }

  /* ---------- state -> page ---------- */
  function fillFields() {
    $$("[data-f]").forEach((el) => {
      const v = getPath(inv, el.dataset.f);
      el.value = v == null ? "" : v;
    });
    IG.setRegion(inv.region);
    $("#region").value = inv.region;
    regionHint();
    $("#currency").value = inv.currency;
    $("#status").value = inv.status || "draft";
    renderFields();
    regionApply();
    docDefaults();
    docApply();
    syncDueIn();
    $$("[data-disc]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.disc === (inv.discountType === "%" ? "%" : "flat"))));
    setAccent(inv.accent, false);
    applyTemplate(inv.template, false);
    showLogo();
    renderItems();
    unitLabels();
    setMode(inv.mode, false);
    renderShifts();
    $$("#sheet textarea").forEach(autosize);
  }

  /* ---------- timesheet mode ---------- */
  const ICO_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const isTs = () => IG.isTimesheet(inv);
  function setMode(m, save) {
    m = m === "timesheet" ? "timesheet" : "standard";
    const was = inv.mode;
    inv.mode = m;
    if (!Array.isArray(inv.shifts) || !inv.shifts.length) inv.shifts = [IG.blankShift(inv.issueDate)];
    $("#create").classList.toggle("is-ts", m === "timesheet");
    $("#sheet").classList.toggle("has-code", !!IG.R(inv).code && m !== "timesheet");
    $$("#modeSwitch [data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    if (save && was !== m) {
      const sec = $(m === "timesheet" ? ".sh-time" : ".sh-items");
      if (sec && !reduce()) { sec.classList.remove("mode-in"); void sec.offsetWidth; sec.classList.add("mode-in"); }
      if (m === "timesheet") renderShifts();
      update(); changed();
    }
  }
  function hoursValue(sh) {
    if (sh.manual) return sh.hours == null ? "" : String(sh.hours);
    const h = IG.autoHours(sh);
    return h == null ? (sh.hours ? String(sh.hours) : "") : String(h);
  }
  function renderShifts() {
    const box = $("#tsRows"); if (!box) return;
    inv.shifts = Array.isArray(inv.shifts) && inv.shifts.length ? inv.shifts : [IG.blankShift(inv.issueDate)];
    const brk = IG.BREAKS.map((b) => '<option value="' + b + '">' + (b ? b + " min" : "None") + "</option>").join("");
    box.innerHTML = inv.shifts.map((sh, i) => {
      const n = i + 1;
      return '<div class="ts-row" data-row="' + i + '">' +
        '<label class="tr-date"><span class="ir-l">Date</span><input class="fi" type="date" data-s="' + i + '" data-sk="date" aria-label="Date, shift ' + n + '"></label>' +
        '<label class="tr-type"><span class="ir-l">Work type</span><input class="fi" list="workTypes" data-s="' + i + '" data-sk="type" placeholder="Kitchen" autocomplete="off" aria-label="Work type, shift ' + n + '"></label>' +
        '<label class="tr-start"><span class="ir-l">Start</span><input class="fi" type="time" data-s="' + i + '" data-sk="start" aria-label="Start time, shift ' + n + '"></label>' +
        '<label class="tr-end"><span class="ir-l">End</span><input class="fi" type="time" data-s="' + i + '" data-sk="end" aria-label="End time, shift ' + n + '"></label>' +
        '<label class="tr-brk"><span class="ir-l">Break</span><select class="fi" data-s="' + i + '" data-sk="brk" aria-label="Break, shift ' + n + '">' + brk + "</select></label>" +
        '<label class="tr-hrs"><span class="ir-l">Hours</span><input class="fi" inputmode="decimal" data-s="' + i + '" data-sk="hours" placeholder="0" aria-label="Hours, shift ' + n + '"></label>' +
        '<span class="tr-act"><button type="button" class="ir-x" data-sdup="' + i + '" aria-label="Copy shift ' + n + ' to the next day" title="Copy to next day">' + ICO_COPY + '</button>' +
        '<button type="button" class="ir-x" data-sx="' + i + '" aria-label="Remove shift ' + n + '" title="Remove shift">' + ICO_X + "</button></span></div>";
    }).join("");
    inv.shifts.forEach((sh, i) => {
      const q = (k) => $('[data-s="' + i + '"][data-sk="' + k + '"]', box);
      q("date").value = sh.date || ""; q("type").value = sh.type || ""; q("start").value = sh.start || ""; q("end").value = sh.end || "";
      q("brk").value = String(IG.BREAKS.indexOf(+sh.brk) >= 0 ? +sh.brk : 0);
      q("hours").value = hoursValue(sh);
      q("hours").classList.toggle("is-manual", !!sh.manual);
      ["date", "start", "end"].forEach((k) => q(k).classList.toggle("has-v", !!sh[k]));
    });
    update();
  }
  function nextShift(from) {
    const c = Object.assign({}, from, { id: IG.uid() });
    if (from.date) c.date = IG.addDays(from.date, 1);
    return c;
  }
  function shiftsDone() { return Number(inv.hourRate) > 0 && IG.totalHours(inv) > 0; }

  /* ---------- document type rules: quote, estimate, receipt, proforma ---------- */
  let lastKind = null;
  function docApply() {
    const kind = IG.docKind(inv.title), D = IG.DOCS[kind];
    $("#create").dataset.kind = kind;
    $$(".doc-pay").forEach((e) => (e.hidden = !D.receipt));
    $("#acceptBox").hidden = !D.accept;
    const dn = $("#tDocNote"); dn.hidden = !D.note; dn.textContent = D.note || "";
    $("#dueInLabel").textContent = D.validity ? "Valid for" : "Payment due";
    $$("#dueIn option").forEach((o) => {
      if (o.value === "") o.textContent = "Custom date";
      else if (o.value === "0") o.textContent = D.validity ? "Today only" : "On receipt";
      else o.textContent = (D.validity ? "" : "In ") + o.value + " days";
    });
    $("#dueInWrap").hidden = !!D.receipt;
    $("#statusWrap").hidden = !!D.receipt;
    if (D.receipt) { inv.status = "paid"; $("#status").value = "paid"; }
    if (!D.paidRow && Number(inv.paid)) { inv.paid = "0"; const pf = $('[data-f="paid"]'); if (pf) pf.value = "0"; }
  }
  /* switching type: swap in that type's standard terms and dates, keep anything the person wrote */
  function docDefaults() {
    const kind = IG.docKind(inv.title), D = IG.DOCS[kind];
    if (kind === lastKind) return;
    const was = lastKind ? IG.DOCS[lastKind] : null;
    lastKind = kind;
    if (IG.isDefaultTerms(inv.terms) && inv.terms !== D.terms) { inv.terms = D.terms; const t = $('[data-f="terms"]'); if (t) { t.value = D.terms; autosize(t); } }
    const days = inv.issueDate && inv.dueDate ? Math.round((new Date(inv.dueDate + "T00:00:00") - new Date(inv.issueDate + "T00:00:00")) / 864e5) : null;
    const defDays = was ? was.dueDays : IG.DOCS.invoice.dueDays;
    if (inv.issueDate && (days == null || days === defDays || D.receipt)) {
      inv.dueDate = IG.addDays(inv.issueDate, D.dueDays);
      const d = $('[data-f="dueDate"]'); if (d) d.value = inv.dueDate;
      syncDueIn();
    }
    if (D.receipt) inv.paidManual = false;
  }

  /* ---------- region rules: labels, extra boxes, checklist ---------- */
  function setLabel(input, text) {
    if (!input) return;
    const l = input.closest(".pf") && input.closest(".pf").querySelector(".pf-l");
    if (l && !l.querySelector("em")) l.textContent = text;
    input.setAttribute("aria-label", text);
  }
  function regionApply() {
    const R = IG.R(inv), sheet = $("#sheet");
    sheet.dataset.region = inv.region;
    const ft = $('[data-f="from.taxId"]');
    if (ft) { setLabel(ft, R.taxId || "Tax / VAT ID"); ft.placeholder = R.taxIdPh || "Optional"; }
    const ct = $(".reg-ctax");
    if (ct) { ct.hidden = !R.clientTaxId; if (R.clientTaxId) setLabel($('[data-f="to.taxId"]'), R.clientTaxId); }
    const bk = $(".reg-bank"); if (bk) bk.hidden = !R.bank;
    $$(".reg-supply").forEach((e) => (e.hidden = !R.supply));
    const ls = $('label[for="f-supply"]'); if (ls && R.supply) ls.textContent = R.supply;
    $$(".reg-pos").forEach((e) => (e.hidden = !R.pos));
    sheet.classList.toggle("has-code", !!R.code && !isTs());
    const hc = $("#hCode"); if (hc) hc.textContent = R.code || "";
    $$(".ir-code .ir-l").forEach((e) => (e.textContent = R.code || ""));
    $("#gstWrap").hidden = !R.split;
    $$("#gstSeg [data-gst]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.gst === (inv.gstSplit === "inter" ? "inter" : "intra"))));
    const tn = $("#taxNote"), allowed = R.notes || [];
    $("#taxNoteWrap").hidden = !allowed.length;
    $$("#taxNote option").forEach((o) => (o.hidden = !!o.value && allowed.indexOf(o.value) < 0));
    if (inv.taxNote && allowed.indexOf(inv.taxNote) < 0) inv.taxNote = "";
    tn.value = inv.taxNote || "";
    rateHint();
    renderCheck();
  }
  function rateHint() {
    const R = IG.R(inv), box = $("#regRate"); if (!box) return;
    const same = R.rate != null && Number(inv.taxRate) === R.rate;
    box.innerHTML = '<p>' + esc(R.rateHint || "") + '</p>' +
      (R.rate != null && !same ? '<button type="button" class="chip" id="useRate">Use ' + R.rate + "% " + esc(R.tax) + "</button>" : "");
  }
  function checkItems() {
    const R = IG.R(inv);
    const has = (v) => !!String(v || "").trim();
    const all = {
      title: ['The words "Tax Invoice" at the top', () => /tax invoice/i.test(inv.title || "")],
      number: ["Invoice number", () => has(inv.number)],
      date: ["Issue date", () => has(inv.issueDate)],
      supply: [(R.supply || "Date of supply") + ", if different", () => has(inv.supplyDate)],
      from: ["Your name and address", () => has(inv.from.name) && has(inv.from.address)],
      taxId: ["Your " + (R.taxId || "tax ID"), () => has(inv.from.taxId)],
      to: ["Client name and address", () => has(inv.to.name) && has(inv.to.address)],
      pos: ["Place of supply (state)", () => has(inv.placeOfSupply)],
      items: ["Each item with quantity and price", () => itemsDone()],
      rate: [(inv.taxLabel || R.tax) + " rate and amount", () => Number(inv.taxRate) > 0 || !!inv.taxNote],
      due: ["Due date or payment terms", () => has(inv.dueDate)]
    };
    return (R.check || []).map((k) => [all[k][0], all[k][1]()]);
  }
  function renderCheck() {
    const list = $("#regCheckList"); if (!list) return;
    const items = checkItems(), done = items.filter((x) => x[1]).length;
    $("#regCheckTitle").textContent = IG.R(inv).name + " checklist";
    $("#regCheckCount").textContent = done + "/" + items.length;
    $("#regCheckCount").classList.toggle("all", done === items.length);
    list.innerHTML = items.map(([t, ok]) => '<li class="' + (ok ? "ok" : "") + '"><i aria-hidden="true"></i>' + esc(t) + "</li>").join("");
  }

  /* ---------- region, units, extra fields ---------- */
  function regionHint() {
    const h = $("#regionHint"); if (!h) return;
    const R = IG.REGIONS[inv.region] || IG.REGIONS.us;
    h.textContent = IG.money(1234.5, inv.currency) + ", " + IG.formatDate(IG.isoDate(new Date()), inv.region) + ", " + (R.paper === "letter" ? "US Letter" : "A4") + " paper";
  }
  function unitLabels() {
    const U = IG.UNITS[inv.unit] || IG.UNITS.qty;
    $$("#unitSeg [data-unit]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.unit === (inv.unit || "qty"))));
    const hq = $("#hQty"), hr = $("#hRate");
    if (hq) hq.textContent = U.q; if (hr) hr.textContent = U.r;
    $$(".ir-qty .ir-l").forEach((e) => (e.textContent = U.q));
    $$(".ir-rate .ir-l").forEach((e) => (e.textContent = U.r));
  }
  function renderFields() {
    const box = $("#metaExtra"); if (!box) return;
    inv.fields = Array.isArray(inv.fields) ? inv.fields : [];
    box.innerHTML = inv.fields.map((f, i) =>
      '<input class="fi mf-l" data-fi="' + i + '" data-fk="label" placeholder="Field name" aria-label="Field name ' + (i + 1) + '">' +
      '<span class="mf-v"><input class="fi" data-fi="' + i + '" data-fk="value" placeholder="Value" aria-label="Field value ' + (i + 1) + '">' +
      '<button type="button" class="mf-x" data-fx="' + i + '" aria-label="Remove field ' + (i + 1) + '" title="Remove field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>').join("");
    inv.fields.forEach((f, i) => {
      $('[data-fi="' + i + '"][data-fk="label"]', box).value = f.label || "";
      $('[data-fi="' + i + '"][data-fk="value"]', box).value = f.value || "";
    });
  }

  function syncDueIn() {
    const days = inv.issueDate && inv.dueDate ? Math.round((new Date(inv.dueDate + "T00:00:00") - new Date(inv.issueDate + "T00:00:00")) / 864e5) : null;
    $("#dueIn").value = [0, 7, 14, 15, 30].indexOf(days) >= 0 ? String(days) : "";
  }

  function renderItems() {
    const box = $("#itemRows");
    box.innerHTML = "";
    inv.items.forEach((it, i) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML =
        '<label class="ir-desc"><span class="ir-l">Item ' + (i + 1) + '</span><textarea class="fi" rows="1" data-i="' + i + '" data-k="desc" placeholder="Description of item or service"></textarea></label>' +
        '<label class="ir-code"><span class="ir-l">' + esc(IG.R(inv).code || "Code") + '</span><input class="fi" data-i="' + i + '" data-k="code" placeholder="' + esc(IG.R(inv).code || "") + '" aria-label="Code, item ' + (i + 1) + '"></label>' +
        '<label class="ir-qty"><span class="ir-l">Qty</span><input class="fi" inputmode="decimal" data-i="' + i + '" data-k="qty" aria-label="Quantity, item ' + (i + 1) + '"></label>' +
        '<label class="ir-rate"><span class="ir-l">Rate</span><input class="fi" inputmode="decimal" data-i="' + i + '" data-k="rate" placeholder="0.00" aria-label="Rate, item ' + (i + 1) + '"></label>' +
        '<span class="ir-amt"><span class="ir-l">Amount</span><b data-amount="' + i + '"></b></span>' +
        '<button type="button" class="ir-x" data-remove="' + i + '" aria-label="Remove item ' + (i + 1) + '" title="Remove line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      box.appendChild(row);
      $('[data-k="desc"]', row).value = it.desc || "";
      $('[data-k="qty"]', row).value = it.qty;
      $('[data-k="code"]', row).value = it.code || "";
      $('[data-k="rate"]', row).value = it.rate ? it.rate : "";
      autosize($('[data-k="desc"]', row));
    });
    unitLabels();
    update();
  }

  function docLabels() {
    const L = IG.docLabels(inv.title), set = (sel, txt) => { const e = $(sel); if (e && e.textContent !== txt) e.textContent = txt; };
    set('label[for="f-number"]', L.no); set('label[for="f-due"]', L.due); set(".t-due > span", L.bal);
  }
  function progress() {
    const steps = { from: !!inv.from.name.trim(), to: !!inv.to.name.trim(), items: itemsDone() };
    const n = Object.values(steps).filter(Boolean).length;
    $$(".spp-list li").forEach((li) => li.classList.toggle("done", !!steps[li.dataset.step]));
    const bar = $("#progBar"), txt = $("#progText"), box = $(".sp-progress");
    if (bar) bar.style.width = (n / 3) * 100 + "%";
    if (txt) txt.textContent = n === 3 ? "Ready to download" : n + " of 3 done";
    if (box) box.classList.toggle("ready", n === 3);
    const mb = $(".mobile-bar"); if (mb) mb.style.setProperty("--prog", n / 3);
    $$("[data-section]").forEach((el) => el.classList.toggle("sec-done", !!steps[el.dataset.section]));
    const ih = $("#itemsHint"); if (ih) ih.hidden = steps.items;
    // phones: one clear "next step" above the action bar
    const ns = $("#nextStep");
    if (ns) {
      const order = ["from", "to", "items"], next = order.find((k) => !steps[k]);
      const text = { from: "Add your business name", to: "Add who it's for", items: isTs() ? "Add your shifts and rate per hour" : "Add an item and its price" };
      ns.hidden = !next;
      if (next) { ns.dataset.step = next; $("#nsNum").textContent = order.indexOf(next) + 1; $("#nsText").textContent = text[next]; }
    }
  }
  function focusStep(step) {
    let el = step === "from" ? $('[data-f="from.name"]') : step === "to" ? $('[data-f="to.name"]') : null;
    if (step === "items" && isTs()) {
      el = !(Number(inv.hourRate) > 0) ? $("#f-hourRate") : $('[data-s="' + Math.max(0, inv.shifts.findIndex((x) => !IG.shiftHours(x))) + '"][data-sk="start"]');
    } else if (step === "items") {
      const i = Math.max(0, inv.items.findIndex((it) => !String(it.desc).trim() || !(Number(it.rate) > 0)));
      el = !String(inv.items[i].desc).trim() ? $('[data-i="' + i + '"][data-k="desc"]') : $('[data-i="' + i + '"][data-k="rate"]');
    }
    if (!el) return;
    if (document.documentElement.classList.contains("sheet-open")) closeOptions();
    el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" });
    setTimeout(() => el.focus({ preventScroll: true }), 250);
  }
  function update() {
    docLabels();
    progress();
    let t = IG.calc(inv);
    if (IG.doc(inv.title).receipt && !inv.paidManual && Number(inv.paid) !== t.total) {
      inv.paid = String(t.total);
      const pf = $('[data-f="paid"]'); if (pf && document.activeElement !== pf) pf.value = inv.paid;
      t = IG.calc(inv);
    }
    if (isTs()) {
      const th = $("#tsHours"); if (th) th.textContent = IG.fmtHours(IG.totalHours(inv)) + " h";
      const tr = $("#tsRate"); if (tr) tr.textContent = M(+inv.hourRate || 0) + " / h";
      const ta = $("#tsAmount"); if (ta) ta.textContent = M(t.lines[0] || 0);
    }
    t.lines.forEach((amt, i) => { const c = $('[data-amount="' + i + '"]'); if (c) c.textContent = M(amt); });
    $("#tSub").textContent = M(t.subtotal);
    $("#tDisc").textContent = t.discount ? "-" + M(t.discount) : M(0);
    $("#tTax").textContent = M(t.tax);
    $("#tShip").textContent = M(t.shipping);
    $("#tTotal").textContent = M(t.total);
    $("#tPaid").textContent = t.paid ? "-" + M(t.paid) : M(0);
    const bal = $("#tBal"), nb = M(t.balance);
    if (bal.textContent && bal.textContent !== nb && !reduce()) { const r = bal.parentElement; r.classList.remove("bump"); void r.offsetWidth; r.classList.add("bump"); }
    bal.textContent = nb;
    $("#stamp").hidden = inv.status !== "paid";
    const R = IG.R(inv);
    const sp = $("#tSplit");
    if (sp) {
      const lines = R.split ? IG.taxLines(inv, t) : [];
      sp.hidden = !lines.length;
      sp.innerHTML = lines.map(([k, v]) => '<span>' + esc(k) + "</span><b>" + M(v) + "</b>").join("");
    }
    const tw = $("#tWords"); if (tw) { tw.hidden = !R.words || !t.total; tw.textContent = R.words ? "Amount in words: " + IG.amountInWords(t.total, inv.currency) : ""; }
    const ti = $("#tIncl"); if (ti) { ti.hidden = !R.inclNote || !t.tax; ti.textContent = R.inclNote ? "Total includes " + (inv.taxLabel || R.tax) + " of " + M(t.tax) : ""; }
    const tn = $("#tNote"); if (tn) { tn.hidden = !inv.taxNote; tn.textContent = inv.taxNote ? IG.TAX_NOTES[inv.taxNote] : ""; }
    renderCheck();
    return t;
  }

  /* ---------- design ---------- */
  function setAccent(color, save) {
    inv.accent = color;
    if (save) inv.accentPicked = true;
    $("#sheet").style.setProperty("--accent", color);
    $$(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === color)));
    if (save) changed();
  }
  function setTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "classic";
    if (save && !reduce() && document.startViewTransition && inv.template !== t) {
      document.startViewTransition(() => applyTemplate(t, save));
      return;
    }
    applyTemplate(t, save);
  }
  function applyTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "classic";
    inv.template = t;
    if (save) inv.tplPicked = true;
    const sheet = $("#sheet");
    IG.TEMPLATES.forEach((k) => sheet.classList.toggle("t-" + k, k === t));
    $$(".tpl-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.template === t)));
    if (save) changed();
  }

  /* ---------- logo ---------- */
  function showLogo() {
    const img = $("#logoImg"), has = !!inv.logo;
    if (has) { img.src = inv.logo; img.hidden = false; } else { img.hidden = true; img.removeAttribute("src"); }
    $("#logoDrop").hidden = !has; $("#logoDrop").classList.toggle("has-logo", has);
    $("#logoRemove").hidden = !has;
    $("#brandWord").hidden = has; $("#addLogo").hidden = has;
    brandName();
  }
  /* no logo: the business name stands in its place, as on most real invoices */
  function brandName() {
    const n = $("#brandName"); if (!n) return;
    const name = String(inv.from.name || "").trim();
    n.textContent = name || "Your business";
    n.parentElement.classList.toggle("is-empty", !name);
  }
  function readLogo(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return IG.toast("Use a PNG or JPG image for the logo.", "err");
    if (file.size > 3 * 1024 * 1024) return IG.toast("That logo is over 3 MB. Use a smaller image.", "err");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        inv.logo = c.toDataURL("image/png"); inv.logoW = c.width; inv.logoH = c.height;
        showLogo(); changed();
        IG.toast("Logo added.", "ok");
      };
      img.onerror = () => IG.toast("That image could not be read. Try another file.", "err");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- checks ---------- */
  function itemsDone() { return isTs() ? shiftsDone() : inv.items.some((it) => String(it.desc).trim() && Number(it.rate) > 0); }
  function flag(el, msg) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" });
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake", "invalid");
    setTimeout(() => el.focus({ preventScroll: true }), 300);
    IG.toast(msg, "err");
  }
  function checkReady() {
    if (!inv.from.name.trim()) { flag($('[data-f="from.name"]'), "Add your business name at the top of the invoice."); return false; }
    if (!inv.to.name.trim()) { flag($('[data-f="to.name"]'), "Add who the invoice is for under Bill to."); return false; }
    if (isTs() && !(Number(inv.hourRate) > 0)) { flag($("#f-hourRate"), "Add your rate per hour."); return false; }
    if (isTs() && !(IG.totalHours(inv) > 0)) { flag($('[data-s="0"][data-sk="start"]'), "Add at least one shift with a start and end time."); return false; }
    if (!itemsDone()) {
      const first = inv.items.findIndex((it) => !String(it.desc).trim() || !(Number(it.rate) > 0));
      const i = first < 0 ? 0 : first;
      const el = !String(inv.items[i].desc).trim() ? $('[data-i="' + i + '"][data-k="desc"]') : $('[data-i="' + i + '"][data-k="rate"]');
      flag(el, "Add at least one item with a rate.");
      return false;
    }
    if (!String(inv.number).trim()) { flag($("#f-number"), "Add an invoice number."); return false; }
    return true;
  }

  /* ---------- saving ---------- */
  let autoTimer = null;
  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IG.draft.set(inv), 300);
    // logged in: save to the account automatically once the basics are filled in
    if (user && inv.from.name.trim() && inv.to.name.trim()) {
      clearTimeout(autoTimer);
      setStatus("saving");
      const run = async () => { if (cloudSaving) { autoTimer = setTimeout(run, 800); return; } const ok = await saveCloud(true); setStatus(ok ? "saved" : "error"); };
      autoTimer = setTimeout(run, 1200);
    }
  }
  function setStatus(s) {
    const n = $("#cloudNote"); if (!n || !user) return;
    const map = { saving: "Saving to your account…", saved: "Saved to your account just now", error: "Not saved. Check your connection." };
    n.dataset.state = s;
    n.innerHTML = '<span class="dot"></span>' + map[s] + ' <a href="/dashboard/">Dashboard</a>';
  }

  async function saveCloud(quiet) {
    if (!IG.cloud || !user) {
      if (!quiet) { IG.draft.set(inv); window.location.href = "/login/?next=" + encodeURIComponent("/"); }
      return false;
    }
    if (cloudSaving) return false;
    cloudSaving = true;
    try {
      const t = IG.calc(inv);
      const row = {
        user_id: user.id, number: inv.number, client_name: inv.to.name || null, client_email: inv.to.email || null,
        issue_date: inv.issueDate || null, due_date: inv.dueDate || null, currency: inv.currency,
        total: t.total, balance: t.balance, status: inv.status || "draft", data: inv
      };
      const res = inv.id
        ? await IG.cloud.from("invoices").update(row).eq("id", inv.id).select("id").single()
        : await IG.cloud.from("invoices").insert(row).select("id").single();
      if (res.error) throw res.error;
      inv.id = res.data.id;
      IG.draft.set(inv);
      IG.bumpNumber(inv.number);
      const url = new URL(window.location.href);
      url.searchParams.set("id", inv.id);
      window.history.replaceState(null, "", url);
      await rememberClient();
      if (!quiet) IG.toast("Saved to your account.", "ok");
      return true;
    } catch (e) {
      IG.toast("Could not save: " + (e.message || "check your connection and try again."), "err");
      return false;
    } finally {
      cloudSaving = false;
    }
  }

  async function rememberClient() {
    const name = (inv.to.name || "").trim();
    if (!name || !user || clients.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const { data, error } = await IG.cloud.from("clients")
      .insert({ user_id: user.id, name, email: inv.to.email || null, address: inv.to.address || null, phone: inv.to.phone || null })
      .select().single();
    if (!error && data) { clients.push(data); fillClientSelect(); }
  }

  function fillClientSelect() {
    $("#clientSelect").innerHTML = '<option value="">Choose a saved client…</option>' +
      clients.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("");
    $("#clientPick").hidden = clients.length === 0;
  }

  async function loadCloudData() {
    const [{ data: cl }, { data: prof }] = await Promise.all([
      IG.cloud.from("clients").select("*").order("name"),
      IG.cloud.from("profiles").select("*").eq("id", user.id).maybeSingle()
    ]);
    clients = cl || [];
    fillClientSelect();
    if (prof && prof.data) {
      IG.store.set("ig_profile", Object.assign({}, IG.store.get("ig_profile", {}), prof.data));
      if (!inv.id && !inv.from.name) {
        const fresh = IG.blankInvoice(prof.data);
        inv.from = fresh.from;
        if (!inv.logo && fresh.logo) { inv.logo = fresh.logo; inv.logoW = fresh.logoW; inv.logoH = fresh.logoH; }
        fillFields();
      }
    }
  }

  async function saveProfile() {
    const p = Object.assign({}, IG.store.get("ig_profile", {}), {
      name: inv.from.name, email: inv.from.email, address: inv.from.address, phone: inv.from.phone, taxId: inv.from.taxId, bank: inv.from.bank,
      currency: inv.currency, region: inv.region, accent: inv.accent, accentPicked: !!inv.accentPicked, template: inv.template, tplPicked: !!inv.tplPicked, logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH,
      taxLabel: inv.taxLabel, taxRate: inv.taxRate, notes: inv.notes, terms: inv.terms, service: inv.service, hourRate: inv.hourRate
    });
    IG.store.set("ig_profile", p);
    if (IG.cloud && user) {
      const { error } = await IG.cloud.from("profiles").upsert({ id: user.id, data: p, updated_at: new Date().toISOString() });
      if (error) return IG.toast("Could not save your details: " + error.message, "err");
    }
    IG.toast("Saved. New invoices will start with your details, logo and design.", "ok");
  }

  /* ---------- actions ---------- */
  let readyFile = null;
  function showReady(f, why) {
    readyFile = f;
    $("#readyName").textContent = f.name;
    const save = $("#readySave"), open = $("#readyOpen");
    save.href = f.url; save.setAttribute("download", f.name);
    open.href = f.url;
    $("#readyShare").hidden = !IG.canShareFile(f.blob, f.name);
    $("#readyHint").textContent = IG.isInApp
      ? "This app's browser may block downloads. Tap Share, or open invoice-gen.net in Safari or Chrome."
      : IG.isIOS ? "On iPhone and iPad, tap Share and choose Save to Files, or open the PDF and use the share button."
      : why || "If the download didn't start, tap Save PDF.";
    const d = $("#pdfReady");
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }
  function closeReady() { const d = $("#pdfReady"); if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }

  async function pdfLibReady() {
    try { await IG.loadPdf(); return true; }
    catch (e) { IG.toast("The PDF maker could not load. Check your connection and try again.", "err"); return false; }
  }

  async function downloadPdf(e) {
    if (!checkReady() || !(await pdfLibReady())) return;
    try {
      const r = IG.savePdf(inv);
      IG.bumpNumber(inv.number);
      const b = e && e.currentTarget;
      if (b && !reduce()) { b.classList.remove("done-pop"); void b.offsetWidth; b.classList.add("done-pop"); }
      if (r.direct) IG.toast("Downloaded " + r.name, "ok");
      else showReady(r);
      closeOptions();
      if (user) saveCloud(true);
    } catch (err) {
      IG.toast("Could not make the PDF: " + err.message, "err");
    }
  }

  async function previewPdf() {
    if (!checkReady() || !(await pdfLibReady())) return;
    try {
      const r = IG.openPdf(inv);
      if (!r.opened) showReady(r, "Your browser blocked the new tab. Use Open PDF below.");
    } catch (err) {
      IG.toast("Could not make the PDF: " + err.message, "err");
    }
  }

  /* phone: options slide up from the bottom */
  function openOptions() {
    $("#sidePanel").classList.add("open");
    $("#spScrim").hidden = false;
    $("#mOptions").setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("sheet-open");
  }
  function closeOptions() {
    const p = $("#sidePanel");
    if (!p.classList.contains("open")) return;
    p.classList.remove("open");
    $("#spScrim").hidden = true;
    $("#mOptions").setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("sheet-open");
  }

  function newInvoice() {
    if (!window.confirm("Start a new invoice? Your business details and logo stay; the client and items are cleared.")) return;
    IG.bumpNumber(inv.number);
    const keep = { from: inv.from, logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH, accent: inv.accent, accentPicked: inv.accentPicked, currency: inv.currency, region: inv.region, unit: inv.unit, fields: (inv.fields || []).map((f) => ({ label: f.label, value: "" })), template: inv.template, tplPicked: inv.tplPicked, notes: inv.notes, terms: inv.terms, taxLabel: inv.taxLabel, taxRate: inv.taxRate, mode: inv.mode, service: inv.service, hourRate: inv.hourRate, shipTo: inv.shipTo };
    inv = Object.assign(IG.blankInvoice(), keep);
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState(null, "", url);
    fillFields();
    changed();
    $('[data-f="to.name"]').focus();
    IG.toast("New invoice " + inv.number + " started.", "ok");
  }

  /* ---------- email ---------- */
  function openSend() {
    if (!checkReady()) return;
    closeOptions();
    const t = IG.calc(inv);
    $("#sendTo").value = inv.to.email || "";
    $("#sendSubject").value = (inv.title || "Invoice") + " " + inv.number + " from " + inv.from.name;
    $("#sendMsg").value = "Hi " + (inv.to.name || "there") + ",\n\nPlease find attached " + (inv.title || "invoice").toLowerCase() + " " + inv.number +
      " for " + IG.money(t.balance, inv.currency) + (inv.dueDate ? ", due on " + IG.prettyDate(inv.dueDate) : "") + ".\n\nThank you,\n" + inv.from.name;
    $("#sendLoginNote").hidden = !!user;
    $("#sendNow").disabled = !user;
    $("#sendErr").hidden = true;
    const dlg = $("#sendModal");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    $("#sendTo").focus();
  }
  function closeSend() { const d = $("#sendModal"); if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }
  function sendError(msg) { const b = $("#sendErr"); b.textContent = msg; b.hidden = false; }

  async function sendNow() {
    const to = $("#sendTo").value.trim();
    if (!IG.validEmail(to)) return sendError("Enter your client's email address, like name@company.com.");
    const btn = $("#sendNow"), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      inv.to.email = to;
      $('[data-f="to.email"]').value = to;
      await saveCloud(true);
      const { data, error } = await IG.cloud.functions.invoke("send-invoice", {
        body: {
          to, subject: $("#sendSubject").value.trim() || "Invoice " + inv.number, message: $("#sendMsg").value,
          copyMe: $("#sendCopy").checked, fromName: inv.from.name, replyTo: inv.from.email || user.email,
          invoiceId: inv.id, fileName: IG.pdfFileName(inv), pdfBase64: IG.pdfBase64(inv)
        }
      });
      if (error) {
        let msg = error.message;
        try { const b = await error.context.json(); if (b && b.error) msg = b.error; } catch (e) { /* keep */ }
        throw new Error(msg);
      }
      if (data && data.error) throw new Error(data.error);
      if (inv.status === "draft") { inv.status = "sent"; $("#status").value = "sent"; saveCloud(true); update(); }
      closeSend();
      IG.toast("Invoice sent to " + to + ".", "ok");
    } catch (e) {
      sendError("Not sent: " + (e.message || "check your connection and try again."));
    } finally {
      btn.disabled = false; btn.innerHTML = label;
    }
  }

  async function sendWithMailApp() {
    if (!(await pdfLibReady())) return;
    let r;
    try { r = IG.savePdf(inv); } catch (e) { return sendError(e.message); }
    const href = "mailto:" + encodeURIComponent($("#sendTo").value.trim()) + "?subject=" + encodeURIComponent($("#sendSubject").value) +
      "&body=" + encodeURIComponent($("#sendMsg").value + "\n\n(The invoice PDF is attached.)");
    closeSend();
    if (!r.direct) { showReady(r, "Save the PDF, then attach it to your email."); return; }
    IG.toast("PDF downloaded. Attach it to the email that opens.");
    window.location.href = href;
  }

  /* ---------- wiring ---------- */
  function bind() {
    const sheet = $("#sheet");

    sheet.addEventListener("input", (e) => {
      const el = e.target;
      el.classList.remove("invalid");
      if (el.tagName === "TEXTAREA") autosize(el);
      if (el.dataset.f) {
        let v = el.value;
        if (["discount", "taxRate", "shipping", "paid", "hourRate"].includes(el.dataset.f)) v = v.replace(",", ".").replace(/[^\d.]/g, "");
        setPath(inv, el.dataset.f, v);
        if (el.dataset.f === "paid") inv.paidManual = true;
        if (el.dataset.f === "title" && IG.docKind(v) !== lastKind) { docDefaults(); docApply(); }
        if (el.dataset.f === "from.name") brandName();
        if (el.dataset.f === "taxRate") {
          if (inv.taxNote && Number(v) > 0) { inv.taxNote = ""; $("#taxNote").value = ""; }
          rateHint();
        }
        if (el.dataset.f === "issueDate" || el.dataset.f === "dueDate") {
          if (el.dataset.f === "issueDate" && $("#dueIn").value !== "") { inv.dueDate = IG.addDays(inv.issueDate, +$("#dueIn").value); $('[data-f="dueDate"]').value = inv.dueDate; }
          syncDueIn();
        }
      } else if (el.dataset.k) {
        const it = inv.items[+el.dataset.i];
        if (!it) return;
        it[el.dataset.k] = el.dataset.k === "desc" || el.dataset.k === "code" ? el.value : el.value.replace(",", ".").replace(/[^\d.]/g, "");
      } else return;
      update();
      changed();
    });

    sheet.addEventListener("click", (e) => {
      const c = e.target.closest("[data-insert], [data-disc]");
      if (!c) return;
      if (c.dataset.insert) {
        const add = INSERTS[c.dataset.insert];
        inv.notes = inv.notes.trim() ? inv.notes.trim() + "\n\n" + add : add;
        const t = $('[data-f="notes"]'); t.value = inv.notes; autosize(t); t.focus(); t.setSelectionRange(t.value.length, t.value.length);
      } else {
        inv.discountType = c.dataset.disc === "%" ? "%" : "flat";
        $$("[data-disc]").forEach((b) => b.setAttribute("aria-pressed", String(b === c)));
      }
      update(); changed();
    });

    // items
    $("#itemRows").addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove]");
      if (!b) return;
      const row = b.closest(".item-row");
      const finish = () => {
        inv.items.splice(+b.dataset.remove, 1);
        if (!inv.items.length) inv.items.push({ id: IG.uid(), desc: "", qty: 1, rate: 0 });
        renderItems(); changed();
      };
      if (!reduce()) { row.classList.add("row-out"); setTimeout(finish, 200); } else finish();
    });
    $("#itemRows").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.dataset.k === "rate" && +e.target.dataset.i === inv.items.length - 1) { e.preventDefault(); $("#addLine").click(); }
      if (e.key === "Enter" && e.target.dataset.k === "desc" && !e.shiftKey) { e.preventDefault(); const q = $('[data-i="' + e.target.dataset.i + '"][data-k="qty"]'); if (q) q.focus(); }
    });
    $("#addLine").addEventListener("click", () => {
      inv.items.push({ id: IG.uid(), desc: "", qty: 1, rate: 0 });
      renderItems();
      const rows = $$("#itemRows .item-row"), last = rows[rows.length - 1];
      last.classList.add("row-in");
      $('[data-k="desc"]', last).focus();
      changed();
    });

    // timesheet
    $("#payMethods").innerHTML = IG.PAY_METHODS.map((w) => '<option value="' + esc(w) + '">').join("");
    $("#workTypes").innerHTML = IG.WORK_TYPES.map((w) => '<option value="' + esc(w) + '">').join("");
    $("#modeSwitch").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-mode]"); if (!b) return;
      setMode(b.dataset.mode, true);
      if (b.dataset.mode === "timesheet") IG.toast("Timesheet invoice: add each shift and the hours are worked out for you.", "ok");
    });
    const tsInput = (e) => {
      const el = e.target.closest("[data-sk]"); if (!el) return;
      const sh = inv.shifts[+el.dataset.s]; if (!sh) return;
      el.classList.remove("invalid");
      const k = el.dataset.sk;
      if (k === "hours") {
        const v = el.value.replace(",", ".").replace(/[^\d.]/g, "");
        sh.hours = v; sh.manual = v !== "";
        el.classList.toggle("is-manual", sh.manual);
      } else {
        sh[k] = k === "brk" ? +el.value : el.value;
        if (el.type === "time" || el.type === "date") el.classList.toggle("has-v", !!el.value);
        if (k === "start" || k === "end" || k === "brk") {
          const h = IG.autoHours(sh);
          if (h != null) { sh.manual = false; sh.hours = h; const hi = $('[data-s="' + el.dataset.s + '"][data-sk="hours"]'); if (hi && document.activeElement !== hi) { hi.value = String(h); hi.classList.remove("is-manual"); } }
        }
      }
      update(); changed();
    };
    $("#tsRows").addEventListener("input", tsInput);
    $("#tsRows").addEventListener("change", (e) => { if (e.target.tagName === "SELECT") tsInput(e); });
    $("#tsRows").addEventListener("click", (e) => {
      const d = e.target.closest("[data-sdup]"), x = e.target.closest("[data-sx]");
      if (d) {
        const i = +d.dataset.sdup;
        inv.shifts.splice(i + 1, 0, nextShift(inv.shifts[i]));
        renderShifts(); changed();
        const row = $('#tsRows [data-row="' + (i + 1) + '"]'); if (row && !reduce()) row.classList.add("row-in");
        return;
      }
      if (!x) return;
      const row = x.closest(".ts-row");
      const finish = () => {
        inv.shifts.splice(+x.dataset.sx, 1);
        if (!inv.shifts.length) inv.shifts.push(IG.blankShift(inv.issueDate));
        renderShifts(); changed();
      };
      if (!reduce()) { row.classList.add("row-out"); setTimeout(finish, 200); } else finish();
    });
    $("#tsRows").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.dataset.sk === "hours" && +e.target.dataset.s === inv.shifts.length - 1) { e.preventDefault(); $("#addShift").click(); }
    });
    $("#addShift").addEventListener("click", () => {
      if (inv.shifts.length >= 200) return IG.toast("A timesheet can have up to 200 shifts.");
      const last = inv.shifts[inv.shifts.length - 1];
      const fresh = last && (last.start || last.end || last.type) ? nextShift(last) : IG.blankShift(last && last.date ? IG.addDays(last.date, 1) : inv.issueDate);
      inv.shifts.push(fresh);
      renderShifts();
      const rows = $$("#tsRows .ts-row"), lastRow = rows[rows.length - 1];
      if (!reduce()) lastRow.classList.add("row-in");
      const f = $('[data-sk="' + (fresh.start ? "end" : "start") + '"]', lastRow);
      if (f) f.focus({ preventScroll: true });
      lastRow.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest" });
      changed();
    });

    // logo
    const drop = $("#logoDrop");
    drop.addEventListener("click", () => $("#logoFile").click());
    $("#addLogo").addEventListener("click", () => $("#logoFile").click());
    $("#brandWord").addEventListener("click", () => { const f = $('[data-f="from.name"]'); f.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" }); setTimeout(() => f.focus({ preventScroll: true }), 250); });
    const brand = $("#shBrand");
    brand.addEventListener("dragover", (e) => { e.preventDefault(); brand.classList.add("drag"); });
    brand.addEventListener("dragleave", () => brand.classList.remove("drag"));
    brand.addEventListener("drop", (e) => { e.preventDefault(); brand.classList.remove("drag"); readLogo(e.dataTransfer.files[0]); });
    drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#logoFile").click(); } });
    $("#logoFile").addEventListener("change", (e) => { readLogo(e.target.files[0]); e.target.value = ""; });
    $("#logoRemove").addEventListener("click", () => { inv.logo = null; inv.logoW = 0; inv.logoH = 0; showLogo(); changed(); });

    // side panel
    const cur = $("#currency");
    cur.innerHTML = IG.CURRENCIES.map(([c, n]) => '<option value="' + c + '">' + c + " — " + n + "</option>").join("");
    cur.addEventListener("change", () => { inv.currency = cur.value; regionHint(); update(); changed(); });
    $("#dueIn").addEventListener("change", (e) => {
      if (e.target.value === "") return $('[data-f="dueDate"]').focus();
      inv.dueDate = IG.addDays(inv.issueDate, +e.target.value);
      $('[data-f="dueDate"]').value = inv.dueDate;
      changed();
    });
    $("#status").addEventListener("change", (e) => { inv.status = e.target.value; update(); changed(); });
    $("#clientSelect").addEventListener("change", (e) => {
      const c = clients.find((x) => x.id === e.target.value);
      if (!c) return;
      inv.to = { name: c.name || "", email: c.email || "", address: c.address || "", phone: c.phone || "" };
      fillFields(); changed(); e.target.value = "";
    });
    $("#tplPicker").addEventListener("click", (e) => { const b = e.target.closest(".tpl-btn"); if (b) setTemplate(b.dataset.template, true); });
    const sw = $("#swatches");
    sw.innerHTML = IG.ACCENTS.map(([c, n]) => '<button type="button" class="swatch" data-color="' + c + '" style="--c:' + c + '" aria-label="' + n + '" title="' + n + '" aria-pressed="false"></button>').join("");
    sw.addEventListener("click", (e) => { const b = e.target.closest(".swatch"); if (b) setAccent(b.dataset.color, true); });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-use-template]");
      if (!b) return;
      setTemplate(b.dataset.useTemplate, true);
      $("#create").scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
      IG.toast(b.dataset.useTemplate.charAt(0).toUpperCase() + b.dataset.useTemplate.slice(1) + " design selected.", "ok");
    });

    $("#downloadBtn").addEventListener("click", downloadPdf);
    const reg = $("#region");
    reg.innerHTML = Object.keys(IG.REGIONS).map((k) => '<option value="' + k + '">' + IG.REGIONS[k].name + "</option>").join("");
    reg.addEventListener("change", () => {
      const old = IG.REGIONS[inv.region] || IG.REGIONS.us, nw = IG.REGIONS[reg.value];
      inv.region = reg.value; IG.setRegion(inv.region);
      if (!inv.taxLabel || IG.TAX_NAMES.indexOf(inv.taxLabel) >= 0) { inv.taxLabel = nw.tax; const tl = $('[data-f="taxLabel"]'); if (tl) tl.value = nw.tax; }
      if (inv.currency === old.cur && nw.cur) { inv.currency = nw.cur; $("#currency").value = nw.cur; }
      if (IG.REGION_TITLES.indexOf(inv.title) >= 0 && nw.title && inv.title !== nw.title) { inv.title = nw.title; const ti = $('[data-f="title"]'); if (ti) ti.value = nw.title; }
      regionApply(); renderItems();
      regionHint(); update(); changed();
      IG.toast(nw.name + " style: " + (nw.paper === "letter" ? "US Letter" : "A4") + " paper, local number and date format.", "ok");
    });
    $("#gstSeg").addEventListener("click", (e) => {
      const b = e.target.closest("[data-gst]"); if (!b) return;
      inv.gstSplit = b.dataset.gst; regionApply(); update(); changed();
    });
    $("#taxNote").addEventListener("change", (e) => {
      inv.taxNote = e.target.value;
      if (inv.taxNote && Number(inv.taxRate) > 0) {
        inv.taxRate = "0"; $('[data-f="taxRate"]').value = "0"; rateHint();
        IG.toast((inv.taxLabel || "VAT") + " set to 0%: with this note no " + (inv.taxLabel || "VAT") + " is charged on the invoice.", "ok");
      }
      update(); changed();
    });
    $("#regRate").addEventListener("click", (e) => {
      if (!e.target.closest("#useRate")) return;
      const R = IG.R(inv);
      inv.taxNote = ""; $("#taxNote").value = "";
      inv.taxRate = String(R.rate); if (!inv.taxLabel || IG.TAX_NAMES.indexOf(inv.taxLabel) >= 0) inv.taxLabel = R.tax;
      $('[data-f="taxRate"]').value = inv.taxRate; $('[data-f="taxLabel"]').value = inv.taxLabel;
      rateHint(); update(); changed();
      IG.toast(R.rate + "% " + R.tax + " added.", "ok");
    });
    $("#unitSeg").addEventListener("click", (e) => {
      const b = e.target.closest("[data-unit]"); if (!b) return;
      inv.unit = b.dataset.unit; unitLabels(); changed();
    });
    $("#addField").addEventListener("click", () => {
      inv.fields = Array.isArray(inv.fields) ? inv.fields : [];
      if (inv.fields.length >= 6) return IG.toast("You can add up to 6 extra fields.");
      inv.fields.push({ label: "", value: "" }); renderFields(); changed();
      const el = $('#metaExtra [data-fi="' + (inv.fields.length - 1) + '"][data-fk="label"]'); if (el) el.focus();
    });
    $("#metaExtra").addEventListener("input", (e) => {
      const el = e.target.closest("[data-fi]"); if (!el) return;
      const f = inv.fields[+el.dataset.fi]; if (f) { f[el.dataset.fk] = el.value; changed(); }
    });
    $("#metaExtra").addEventListener("click", (e) => {
      const x = e.target.closest("[data-fx]"); if (!x) return;
      inv.fields.splice(+x.dataset.fx, 1); renderFields(); changed();
    });
    document.addEventListener("click", (e) => {
      const li = e.target.closest(".spp-list li");
      if (li) focusStep(li.dataset.step);
    });
    $("#nextStep").addEventListener("click", (e) => focusStep(e.currentTarget.dataset.step));
    // typing on a phone: hide the next-step hint, and Enter moves to the next box
    const root = document.documentElement;
    sheet.addEventListener("focusin", (e) => { if (e.target.matches(".fi")) root.classList.add("is-typing"); });
    sheet.addEventListener("focusout", () => setTimeout(() => { if (!sheet.contains(document.activeElement)) root.classList.remove("is-typing"); }, 60));
    $$('#sheet input.fi[data-f]').forEach((el) => el.setAttribute("enterkeyhint", "next"));
    sheet.addEventListener("keydown", (e) => {
      const el = e.target;
      if (e.key !== "Enter" || el.tagName !== "INPUT" || !el.dataset.f || e.isComposing) return;
      const all = $$("#sheet .fi").filter((x) => x.offsetParent !== null && !x.disabled);
      const nx = all[all.indexOf(el) + 1];
      if (nx) { e.preventDefault(); nx.focus(); }
    });
    $("#mDownload").addEventListener("click", downloadPdf);
    $("#sendBtn").addEventListener("click", openSend);
    $("#mSend").addEventListener("click", openSend);
    $("#saveBtn").addEventListener("click", () => saveCloud(false));
    $("#printBtn").addEventListener("click", () => { if (checkReady()) { closeOptions(); window.print(); } });
    $("#previewBtn").addEventListener("click", previewPdf);
    $("#mOptions").addEventListener("click", () => ($("#sidePanel").classList.contains("open") ? closeOptions() : openOptions()));
    $("#spClose").addEventListener("click", closeOptions);
    $("#spScrim").addEventListener("click", closeOptions);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOptions(); });
    $("#readyClose").addEventListener("click", closeReady);
    $("#readySave").addEventListener("click", () => setTimeout(closeReady, 400));
    $("#readyShare").addEventListener("click", async () => {
      if (!readyFile) return;
      try { await IG.sharePdf(readyFile.blob, readyFile.name, (inv.title || "Invoice") + " " + inv.number); closeReady(); }
      catch (e) { if (e && e.name !== "AbortError") IG.toast("Sharing didn't work here. Use Open PDF instead.", "err"); }
    });
    $("#newBtn").addEventListener("click", newInvoice);
    $("#profileBtn").addEventListener("click", saveProfile);
    $("#sendCancel").addEventListener("click", closeSend);
    $("#sendNow").addEventListener("click", sendNow);
    $("#sendMailApp").addEventListener("click", sendWithMailApp);
    $("#sendLoginLink").addEventListener("click", () => IG.draft.set(inv));

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCloud(false);
      }
    });
  }

  async function start() {
    bind();
    // warm up the PDF maker: on the first tap in the invoice, or once the page is idle
    const warm = () => IG.loadPdf().catch(() => {});
    $("#create").addEventListener("focusin", warm, { once: true });
    (window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(warm, { timeout: 4000 });
    const params = new URLSearchParams(window.location.search);
    const draft = IG.draft.get();
    if (params.get("new") === "1" || !draft || !draft.items) {
      inv = IG.blankInvoice();
      if (draft && draft.from) { inv.from = draft.from; inv.logo = draft.logo; inv.logoW = draft.logoW; inv.logoH = draft.logoH; }
      if (params.get("new") === "1") { const u = new URL(window.location.href); u.searchParams.delete("new"); window.history.replaceState(null, "", u); }
    } else {
      inv = Object.assign(IG.blankInvoice(), draft);
      if (!inv.tplPicked) inv.template = "classic";
      if (!inv.accentPicked) inv.accent = IG.DEFAULT_ACCENT;
    }
    // keyword pages (quote, receipt, estimate...) open with their own document title
    const pageDoc = ($("#create") && $("#create").dataset.doc) || "";
    if (pageDoc && (!inv.title || IG.DOC_TITLES.indexOf(inv.title) >= 0)) {
      inv.title = pageDoc === "Invoice" ? (IG.R(inv).title || "Invoice") : pageDoc;
      const pre3 = { Quotation: "QUO", Receipt: "REC", Estimate: "EST", "Proforma Invoice": "PRO", Invoice: "INV" }[pageDoc];
      const m = /^(INV|QUO|REC|EST|PRO)-(\d+)$/.exec(inv.number || "");
      if (pre3 && m) inv.number = pre3 + "-" + m[2];
    }
    const pageMode = ($("#create") && $("#create").dataset.mode) || "";
    const pageUnit = ($("#create") && $("#create").dataset.unit) || "";
    if (pageUnit && IG.UNITS[pageUnit]) inv.unit = pageUnit;
    if (pageMode) inv.mode = pageMode;
    if (!Array.isArray(inv.shifts) || !inv.shifts.length) inv.shifts = [IG.blankShift(inv.issueDate)];
    lastKind = IG.docKind((IG.draft.get() || {}).title || "Invoice");
    if (!IG.draft.get()) lastKind = null;
    const pre = IG.store.get("ig_prefill_client", null);
    if (pre) { inv.to = Object.assign({ name: "", email: "", address: "", phone: "" }, pre); IG.store.remove("ig_prefill_client"); }
    fillFields();

    user = await (IG.headerReady || IG.getUser());
    const note = $("#cloudNote");
    if (!IG.cfgReady) { $("#saveBtn").hidden = true; return; }
    if (!user) {
      note.innerHTML = 'Nothing is stored until you download it. <a href="/login/?signup=1">Create a free account</a> to keep invoices and email them.';
      return;
    }
    note.innerHTML = '<span class="dot"></span>Logged in as <strong>' + esc(user.email) + '</strong>. Changes save to your account automatically. <a href="/dashboard/">Dashboard</a>';
    note.dataset.state = "saved";

    const id = params.get("id"), dup = params.get("dup");
    if (id) {
      const { data, error } = await IG.cloud.from("invoices").select("id,data,status").eq("id", id).maybeSingle();
      if (error || !data) IG.toast("That invoice could not be opened. It may have been deleted.", "err");
      else { inv = Object.assign(IG.blankInvoice(), data.data, { id: data.id, status: data.status }); fillFields(); IG.draft.set(inv); }
    } else if (dup) {
      const { data } = await IG.cloud.from("invoices").select("data").eq("id", dup).maybeSingle();
      if (data) {
        inv = Object.assign(IG.blankInvoice(), data.data, { id: null, status: "draft", number: IG.nextNumber(), issueDate: IG.isoDate(new Date()) });
        inv.dueDate = IG.addDays(inv.issueDate, 14);
        fillFields();
      }
    }
    await loadCloudData();
  }

  document.addEventListener("DOMContentLoaded", start);
})();
