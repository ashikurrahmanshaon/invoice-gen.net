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
    $("#currency").value = inv.currency;
    $("#status").value = inv.status || "draft";
    syncDueIn();
    $$("[data-disc]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.disc === (inv.discountType === "%" ? "%" : "flat"))));
    setAccent(inv.accent, false);
    applyTemplate(inv.template, false);
    showLogo();
    renderItems();
    $$("#sheet textarea").forEach(autosize);
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
        '<label class="ir-desc"><span class="sr-only">Item ' + (i + 1) + ' description</span><textarea class="fi" rows="1" data-i="' + i + '" data-k="desc" placeholder="Description of item or service"></textarea></label>' +
        '<label class="ir-qty"><span class="ir-l">Qty</span><input class="fi" inputmode="decimal" data-i="' + i + '" data-k="qty" aria-label="Quantity, item ' + (i + 1) + '"></label>' +
        '<label class="ir-rate"><span class="ir-l">Rate</span><input class="fi" inputmode="decimal" data-i="' + i + '" data-k="rate" placeholder="0.00" aria-label="Rate, item ' + (i + 1) + '"></label>' +
        '<span class="ir-amt"><span class="ir-l">Amount</span><b data-amount="' + i + '"></b></span>' +
        '<button type="button" class="ir-x" data-remove="' + i + '" aria-label="Remove item ' + (i + 1) + '" title="Remove line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      box.appendChild(row);
      $('[data-k="desc"]', row).value = it.desc || "";
      $('[data-k="qty"]', row).value = it.qty;
      $('[data-k="rate"]', row).value = it.rate ? it.rate : "";
      autosize($('[data-k="desc"]', row));
    });
    update();
  }

  function update() {
    const t = IG.calc(inv);
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
    return t;
  }

  /* ---------- design ---------- */
  function setAccent(color, save) {
    inv.accent = color;
    $("#sheet").style.setProperty("--accent", color);
    $$(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === color)));
    if (save) changed();
  }
  function setTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "minimal";
    if (save && !reduce() && document.startViewTransition && inv.template !== t) {
      document.startViewTransition(() => applyTemplate(t, save));
      return;
    }
    applyTemplate(t, save);
  }
  function applyTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "minimal";
    inv.template = t;
    if (save) inv.tplPicked = true;
    const sheet = $("#sheet");
    IG.TEMPLATES.forEach((k) => sheet.classList.toggle("t-" + k, k === t));
    $$(".tpl-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.template === t)));
    if (save) changed();
  }

  /* ---------- logo ---------- */
  function showLogo() {
    const img = $("#logoImg");
    if (inv.logo) { img.src = inv.logo; img.hidden = false; $("#logoHint").hidden = true; $("#logoRemove").hidden = false; $("#logoDrop").classList.add("has-logo"); }
    else { img.hidden = true; img.removeAttribute("src"); $("#logoHint").hidden = false; $("#logoRemove").hidden = true; $("#logoDrop").classList.remove("has-logo"); }
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
  function itemsDone() { return inv.items.some((it) => String(it.desc).trim() && Number(it.rate) > 0); }
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
  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IG.store.set("ig_draft", inv), 300);
  }

  async function saveCloud(quiet) {
    if (!IG.cloud || !user) {
      if (!quiet) { IG.store.set("ig_draft", inv); window.location.href = "/login/?next=" + encodeURIComponent("/"); }
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
      IG.store.set("ig_draft", inv);
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
      name: inv.from.name, email: inv.from.email, address: inv.from.address, phone: inv.from.phone, taxId: inv.from.taxId,
      currency: inv.currency, accent: inv.accent, template: inv.template, logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH,
      taxLabel: inv.taxLabel, taxRate: inv.taxRate, notes: inv.notes, terms: inv.terms
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

  function pdfLibReady() {
    if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable) return true;
    IG.toast("The PDF maker is still loading. Try again in a moment.", "err");
    return false;
  }

  async function downloadPdf(e) {
    if (!checkReady() || !pdfLibReady()) return;
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

  function previewPdf() {
    if (!checkReady() || !pdfLibReady()) return;
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
    const keep = { from: inv.from, logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH, accent: inv.accent, currency: inv.currency, template: inv.template, notes: inv.notes, terms: inv.terms, taxLabel: inv.taxLabel, taxRate: inv.taxRate };
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

  function sendWithMailApp() {
    if (!pdfLibReady()) return;
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
        if (["discount", "taxRate", "shipping", "paid"].includes(el.dataset.f)) v = v.replace(/[^\d.]/g, "");
        setPath(inv, el.dataset.f, v);
        if (el.dataset.f === "issueDate" || el.dataset.f === "dueDate") {
          if (el.dataset.f === "issueDate" && $("#dueIn").value !== "") { inv.dueDate = IG.addDays(inv.issueDate, +$("#dueIn").value); $('[data-f="dueDate"]').value = inv.dueDate; }
          syncDueIn();
        }
      } else if (el.dataset.k) {
        const it = inv.items[+el.dataset.i];
        if (!it) return;
        it[el.dataset.k] = el.dataset.k === "desc" ? el.value : el.value.replace(/[^\d.]/g, "");
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

    // logo
    const drop = $("#logoDrop");
    drop.addEventListener("click", () => $("#logoFile").click());
    drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#logoFile").click(); } });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("drag"); readLogo(e.dataTransfer.files[0]); });
    $("#logoFile").addEventListener("change", (e) => { readLogo(e.target.files[0]); e.target.value = ""; });
    $("#logoRemove").addEventListener("click", () => { inv.logo = null; inv.logoW = 0; inv.logoH = 0; showLogo(); changed(); });

    // side panel
    const cur = $("#currency");
    cur.innerHTML = IG.CURRENCIES.map(([c, n]) => '<option value="' + c + '">' + c + " — " + n + "</option>").join("");
    cur.addEventListener("change", () => { inv.currency = cur.value; update(); changed(); });
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
    $("#sendLoginLink").addEventListener("click", () => IG.store.set("ig_draft", inv));

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (user) saveCloud(false); else { IG.store.set("ig_draft", inv); IG.toast("Draft saved in this browser. Log in to save it to your account."); }
      }
    });
  }

  async function start() {
    bind();
    const params = new URLSearchParams(window.location.search);
    const draft = IG.store.get("ig_draft", null);
    if (params.get("new") === "1" || !draft || !draft.items) {
      inv = IG.blankInvoice();
      if (draft && draft.from) { inv.from = draft.from; inv.logo = draft.logo; inv.logoW = draft.logoW; inv.logoH = draft.logoH; }
      if (params.get("new") === "1") { const u = new URL(window.location.href); u.searchParams.delete("new"); window.history.replaceState(null, "", u); }
    } else {
      inv = Object.assign(IG.blankInvoice(), draft);
      if (!inv.tplPicked) inv.template = "minimal";
    }
    const pre = IG.store.get("ig_prefill_client", null);
    if (pre) { inv.to = Object.assign({ name: "", email: "", address: "", phone: "" }, pre); IG.store.remove("ig_prefill_client"); }
    fillFields();

    user = await (IG.headerReady || IG.getUser());
    const note = $("#cloudNote");
    if (!IG.cloudReady) { $("#saveBtn").hidden = true; return; }
    if (!user) {
      note.innerHTML = '<a href="/login/?signup=1">Create a free account</a> to save invoices and email them to clients.';
      return;
    }
    note.innerHTML = "Logged in as <strong>" + esc(user.email) + '</strong>. <a href="/dashboard/">Dashboard</a>';

    const id = params.get("id"), dup = params.get("dup");
    if (id) {
      const { data, error } = await IG.cloud.from("invoices").select("id,data,status").eq("id", id).maybeSingle();
      if (error || !data) IG.toast("That invoice could not be opened. It may have been deleted.", "err");
      else { inv = Object.assign(IG.blankInvoice(), data.data, { id: data.id, status: data.status }); fillFields(); IG.store.set("ig_draft", inv); }
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
