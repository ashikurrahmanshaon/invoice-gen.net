/* invoice-gen.net — invoice editor: guided steps on the left, live A4 preview on the right */
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
  let renderQueued = false;

  const INSERTS = {
    bank: "Bank transfer\nBank: \nAccount name: \nAccount number: \nBranch / routing: ",
    mobile: "Mobile payment\nbKash (personal): \nNagad: \nPlease use the invoice number as the reference.",
    online: "Online payment\nPayPal: \nPayoneer: "
  };

  /* ---------- helpers ---------- */
  function getPath(obj, path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj); }
  function setPath(obj, path, value) {
    const keys = path.split("."), last = keys.pop();
    keys.reduce((o, k) => (o[k] = o[k] || {}), obj)[last] = value;
  }
  const esc = (s) => IG.esc(s);
  const nl2br = (s) => esc(s).replace(/\n/g, "<br>");
  const M = (v) => IG.money(v, inv.currency);

  /* ---------- fill the form from state ---------- */
  function fillFields() {
    $$("[data-f]").forEach((el) => {
      const v = getPath(inv, el.dataset.f);
      el.value = v == null ? "" : v;
    });
    $("#currency").value = inv.currency;
    $("#status").value = inv.status || "draft";
    $$("[data-disc]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.disc === (inv.discountType === "%" ? "%" : "flat"))));
    setAccent(inv.accent, false);
    applyTemplate(inv.template, false);
    showLogo();
    renderItems();
  }

  /* ---------- items ---------- */
  function renderItems() {
    const box = $("#itemRows");
    box.innerHTML = "";
    inv.items.forEach((it, i) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML =
        '<label class="ir-desc"><span class="sr-only">Description, item ' + (i + 1) + '</span><input class="in" data-i="' + i + '" data-k="desc" placeholder="Item or service"></label>' +
        '<label class="ir-qty"><span class="ir-l">Qty</span><input class="in" inputmode="decimal" data-i="' + i + '" data-k="qty" aria-label="Quantity, item ' + (i + 1) + '"></label>' +
        '<label class="ir-rate"><span class="ir-l">Rate</span><input class="in" inputmode="decimal" data-i="' + i + '" data-k="rate" placeholder="0.00" aria-label="Rate, item ' + (i + 1) + '"></label>' +
        '<span class="ir-amt"><span class="ir-l">Amount</span><b data-amount="' + i + '"></b></span>' +
        '<button type="button" class="ir-x" data-remove="' + i + '" aria-label="Remove item ' + (i + 1) + '" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      box.appendChild(row);
      $('[data-k="desc"]', row).value = it.desc || "";
      $('[data-k="qty"]', row).value = it.qty;
      $('[data-k="rate"]', row).value = it.rate ? it.rate : "";
    });
    update();
  }

  /* ---------- totals, progress, summaries, preview ---------- */
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
    if (bal.textContent && bal.textContent !== nb) { const r = bal.parentElement; r.classList.remove("bump"); void r.offsetWidth; r.classList.add("bump"); }
    bal.textContent = nb;
    progress(t);
    queueRender();
    return t;
  }

  function itemsDone() { return inv.items.some((it) => String(it.desc).trim() && Number(it.rate) > 0); }
  function progress(t) {
    const done = { business: !!inv.from.name.trim(), client: !!inv.to.name.trim(), items: itemsDone() };
    const n = Object.values(done).filter(Boolean).length;
    $("#progBar").style.width = (n / 3) * 100 + "%";
    $("#progText").textContent = n === 3 ? "Ready to download" : n + " of 3 required steps done";
    $("#editor").classList.toggle("ready", n === 3);
    const filledItems = inv.items.filter((it) => String(it.desc).trim() || Number(it.rate)).length;
    const summaries = {
      business: inv.from.name.trim() || "Who the invoice is from",
      client: inv.to.name.trim() || "Who you're billing",
      details: (inv.number || "No number") + ", due " + (inv.dueDate ? IG.prettyDate(inv.dueDate) : "not set") + ", " + inv.currency,
      items: filledItems ? filledItems + (filledItems === 1 ? " item, " : " items, ") + M(t.subtotal) : "Products or services you're charging for",
      payment: "Balance due " + M(t.balance) + (inv.status === "paid" ? ", paid" : ""),
      notes: inv.notes.trim() ? "Payment details added" : "Payment details for your client"
    };
    Object.keys(summaries).forEach((k) => { const el = $('[data-summary="' + k + '"]'); if (el) el.textContent = summaries[k]; });
    ["business", "client", "items"].forEach((k) => $("#step-" + k).classList.toggle("done", done[k]));
    ["details", "payment", "notes"].forEach((k) => {
      const d = k === "details" ? !!inv.number : k === "payment" ? done.items : !!inv.notes.trim();
      $("#step-" + k).classList.toggle("done", d);
    });
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderPreview(); });
  }

  function renderPreview() {
    const t = IG.calc(inv);
    const ph = (v, p) => (String(v || "").trim() ? nl2br(v) : '<span class="ph">' + p + "</span>");
    const party = (p, label, phName) =>
      '<div class="pv-party"><small>' + label + "</small><b>" + ph(p.name, phName) + "</b>" +
      (p.address ? "<span>" + nl2br(p.address) + "</span>" : "") +
      (p.email ? "<span>" + esc(p.email) + "</span>" : "") +
      (p.phone ? "<span>" + esc(p.phone) + "</span>" : "") +
      (p.taxId ? "<span>Tax ID: " + esc(p.taxId) + "</span>" : "") + "</div>";
    const meta = [["Invoice no.", inv.number], ["Issue date", IG.prettyDate(inv.issueDate)], ["Due date", IG.prettyDate(inv.dueDate)]];
    if (inv.poNumber) meta.push(["PO / reference", inv.poNumber]);
    const rows = inv.items.map((it, i) => {
      const empty = !String(it.desc).trim() && !Number(it.rate);
      return "<tr" + (empty ? ' class="empty"' : "") + "><td>" + (String(it.desc).trim() ? esc(it.desc) : '<span class="ph">Item description</span>') + '</td><td class="n">' + esc(it.qty) + '</td><td class="n">' + M(Number(it.rate) || 0) + '</td><td class="n">' + M(t.lines[i]) + "</td></tr>";
    }).join("");
    const tr = (k, v, cls) => '<div class="pv-t' + (cls ? " " + cls : "") + '"><span>' + k + "</span><b>" + v + "</b></div>";
    let totals = tr("Subtotal", M(t.subtotal));
    if (t.discount) totals += tr("Discount" + (inv.discountType === "%" ? " (" + esc(inv.discount) + "%)" : ""), "-" + M(t.discount));
    if (t.tax) totals += tr(esc(inv.taxLabel || "Tax") + " (" + esc(inv.taxRate) + "%)", M(t.tax));
    if (t.shipping) totals += tr("Shipping", M(t.shipping));
    totals += tr("Total", M(t.total), "grand");
    if (t.paid) totals += tr("Amount paid", "-" + M(t.paid));
    totals += tr("Balance due", M(t.balance), "due");

    $("#pvPage").innerHTML =
      '<div class="pv t-' + inv.template + '">' +
        '<div class="pv-top">' +
          '<div class="pv-logo">' + (inv.logo ? '<img src="' + inv.logo + '" alt="">' : "") + "</div>" +
          '<div class="pv-title"><h4>' + esc(inv.title || "Invoice") + '</h4><dl>' +
            meta.map(([k, v]) => "<dt>" + k + "</dt><dd>" + (v ? esc(v) : "—") + "</dd>").join("") + "</dl></div>" +
        "</div>" +
        '<div class="pv-parties">' + party(inv.from, "From", "Your business name") + party(inv.to, "Bill to", "Client name") + "</div>" +
        '<table class="pv-items"><thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead><tbody>' + rows + "</tbody></table>" +
        '<div class="pv-totals">' + totals + "</div>" +
        (inv.notes.trim() ? '<div class="pv-note"><small>Notes</small><p>' + nl2br(inv.notes) + "</p></div>" : "") +
        (inv.terms.trim() ? '<div class="pv-note"><small>Terms</small><p>' + nl2br(inv.terms) + "</p></div>" : "") +
        (inv.status === "paid" ? '<div class="pv-stamp">Paid</div>' : "") +
        '<div class="pv-foot">Made with invoice-gen.net</div>' +
      "</div>";
    $("#pvPage").style.setProperty("--acc", inv.accent);
    fitPreview();
  }

  function fitPreview() {
    const stage = $("#pvStage"), page = $("#pvPage");
    if (!stage.clientWidth) return;
    const s = Math.min(1, stage.clientWidth / 794);
    page.style.transform = "scale(" + s + ")";
    stage.style.height = Math.ceil(page.offsetHeight * s) + "px";
  }

  /* ---------- design & colour ---------- */
  function setAccent(color, save) {
    inv.accent = color;
    $$(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === color)));
    if (save) { queueRender(); changed(); }
  }
  function setTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "classic";
    if (save && !reduce() && document.startViewTransition && inv.template !== t) {
      document.startViewTransition(() => { applyTemplate(t, save); renderPreview(); });
      return;
    }
    applyTemplate(t, save);
  }
  function applyTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "classic";
    inv.template = t;
    $$(".tpl-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.template === t)));
    if (save) { queueRender(); changed(); }
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
        showLogo(); queueRender(); changed();
        IG.toast("Logo added.", "ok");
      };
      img.onerror = () => IG.toast("That image could not be read. Try another file.", "err");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- steps ---------- */
  function openStep(key, focus) {
    const s = $("#step-" + key);
    if (!s) return;
    s.classList.add("open");
    $(".step-head", s).setAttribute("aria-expanded", "true");
    if (focus) {
      $("#editor").dataset.view = "edit";
      $$(".ed-tabs [data-view]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === "edit")));
      setTimeout(() => {
        s.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
        const f = typeof focus === "string" ? $(focus, s) : null;
        if (f) f.focus({ preventScroll: true });
      }, 120);
    }
  }
  function toggleStep(s) {
    const open = !s.classList.contains("open");
    s.classList.toggle("open", open);
    $(".step-head", s).setAttribute("aria-expanded", String(open));
  }

  function missing() {
    if (!inv.from.name.trim()) return ["business", '[data-f="from.name"]', "Add your business name in step 1."];
    if (!inv.to.name.trim()) return ["client", '[data-f="to.name"]', "Add your client's name in step 2."];
    if (!itemsDone()) return ["items", '[data-k="desc"]', "Add at least one item with a rate in step 4."];
    if (!String(inv.number).trim()) return ["details", "#f-number", "Add an invoice number in step 3."];
    return null;
  }
  function checkReady() {
    const m = missing();
    if (!m) return true;
    openStep(m[0], m[1]);
    const el = $(m[1], $("#step-" + m[0]));
    if (el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake", "invalid"); }
    IG.toast(m[2], "err");
    return false;
  }

  /* ---------- saving ---------- */
  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IG.store.set("ig_draft", inv), 300);
  }

  async function saveCloud(quiet) {
    if (!IG.cloud || !user) {
      if (!quiet) { IG.store.set("ig_draft", inv); window.location.href = "/login/?next=" + encodeURIComponent("/#create"); }
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
    IG.toast("Saved. New invoices will start with these details.", "ok");
  }

  /* ---------- actions ---------- */
  function celebrate(btn) {
    if (!btn || reduce()) return;
    btn.classList.remove("done-pop"); void btn.offsetWidth; btn.classList.add("done-pop");
  }

  async function downloadPdf(e) {
    if (!checkReady()) return;
    try {
      IG.buildPdf(inv).save(IG.pdfFileName(inv));
      IG.bumpNumber(inv.number);
      celebrate(e && e.currentTarget);
      IG.toast("PDF downloaded: " + IG.pdfFileName(inv), "ok");
      if (user) saveCloud(true);
    } catch (err) {
      IG.toast(err.message, "err");
    }
  }

  function newInvoice() {
    if (!window.confirm("Start a new invoice? Your business details stay; the client and items are cleared.")) return;
    IG.bumpNumber(inv.number);
    const keep = { from: inv.from, logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH, accent: inv.accent, currency: inv.currency, template: inv.template };
    inv = Object.assign(IG.blankInvoice(), keep);
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState(null, "", url);
    fillFields();
    changed();
    openStep("client", '[data-f="to.name"]');
    IG.toast("New invoice " + inv.number + " started.", "ok");
  }

  /* ---------- email ---------- */
  function openSend() {
    if (!checkReady()) return;
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
      fillFields();
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
    try { IG.buildPdf(inv).save(IG.pdfFileName(inv)); } catch (e) { return sendError(e.message); }
    const href = "mailto:" + encodeURIComponent($("#sendTo").value.trim()) + "?subject=" + encodeURIComponent($("#sendSubject").value) +
      "&body=" + encodeURIComponent($("#sendMsg").value + "\n\n(The invoice PDF is attached.)");
    closeSend();
    IG.toast("PDF downloaded. Attach it to the email that opens.");
    window.location.href = href;
  }

  /* ---------- wiring ---------- */
  function bind() {
    const form = $("#edForm");

    form.addEventListener("input", (e) => {
      const el = e.target;
      el.classList.remove("invalid");
      if (el.dataset.f) {
        let v = el.value;
        if (["discount", "taxRate", "shipping", "paid"].includes(el.dataset.f)) v = v.replace(/[^\d.]/g, "");
        setPath(inv, el.dataset.f, v);
      } else if (el.dataset.k) {
        const it = inv.items[+el.dataset.i];
        if (!it) return;
        it[el.dataset.k] = el.dataset.k === "desc" ? el.value : el.value.replace(/[^\d.]/g, "");
      } else return;
      update();
      changed();
    });

    $$(".step-head").forEach((h) => h.addEventListener("click", () => toggleStep(h.closest(".step"))));
    // "Continue" buttons
    const steps = $$(".step");
    steps.forEach((s, i) => {
      if (i === steps.length - 1) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-ink btn-sm step-next";
      b.innerHTML = "Continue to " + esc($(".step-title b", steps[i + 1]).childNodes[0].textContent.trim()) +
        ' <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
      b.addEventListener("click", () => {
        s.classList.remove("open"); $(".step-head", s).setAttribute("aria-expanded", "false");
        openStep(steps[i + 1].dataset.step, "input, textarea, select");
      });
      $(".step-inner", s).appendChild(b);
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
    });
    $("#addLine").addEventListener("click", () => {
      inv.items.push({ id: IG.uid(), desc: "", qty: 1, rate: 0 });
      renderItems();
      const rows = $$("#itemRows .item-row");
      const last = rows[rows.length - 1];
      last.classList.add("row-in");
      $('[data-k="desc"]', last).focus();
      changed();
    });

    // chips
    form.addEventListener("click", (e) => {
      const c = e.target.closest(".chip, [data-disc]");
      if (!c) return;
      if (c.dataset.title) { inv.title = c.dataset.title; $('[data-f="title"]').value = inv.title; }
      else if (c.dataset.due != null) { inv.dueDate = IG.addDays(inv.issueDate, +c.dataset.due); $('[data-f="dueDate"]').value = inv.dueDate; }
      else if (c.dataset.insert) {
        const add = INSERTS[c.dataset.insert];
        inv.notes = inv.notes.trim() ? inv.notes.trim() + "\n\n" + add : add;
        const ta = $('[data-f="notes"]'); ta.value = inv.notes; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      } else if (c.dataset.disc) {
        inv.discountType = c.dataset.disc === "%" ? "%" : "flat";
        $$("[data-disc]").forEach((b) => b.setAttribute("aria-pressed", String(b === c)));
      } else return;
      c.classList.remove("tapped"); void c.offsetWidth; c.classList.add("tapped");
      update(); changed();
    });

    // logo
    const drop = $("#logoDrop");
    drop.addEventListener("click", () => $("#logoFile").click());
    drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#logoFile").click(); } });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("drag"); readLogo(e.dataTransfer.files[0]); });
    $("#logoFile").addEventListener("change", (e) => { readLogo(e.target.files[0]); e.target.value = ""; });
    $("#logoRemove").addEventListener("click", () => { inv.logo = null; inv.logoW = 0; inv.logoH = 0; showLogo(); queueRender(); changed(); });

    // selects
    const cur = $("#currency");
    cur.innerHTML = IG.CURRENCIES.map(([c, n]) => '<option value="' + c + '">' + c + " — " + n + "</option>").join("");
    cur.addEventListener("change", () => { inv.currency = cur.value; renderItems(); changed(); });
    $("#status").addEventListener("change", (e) => { inv.status = e.target.value; update(); changed(); });
    $("#clientSelect").addEventListener("change", (e) => {
      const c = clients.find((x) => x.id === e.target.value);
      if (!c) return;
      inv.to = { name: c.name || "", email: c.email || "", address: c.address || "", phone: c.phone || "" };
      fillFields(); changed(); e.target.value = "";
    });

    // design & colour
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

    // phone tabs
    $$(".ed-tabs [data-view]").forEach((b) => b.addEventListener("click", () => {
      $("#editor").dataset.view = b.dataset.view;
      $$(".ed-tabs [data-view]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      if (b.dataset.view === "preview") requestAnimationFrame(fitPreview);
    }));

    // actions
    $("#downloadBtn").addEventListener("click", downloadPdf);
    $("#mDownload").addEventListener("click", downloadPdf);
    $("#sendBtn").addEventListener("click", openSend);
    $("#mSend").addEventListener("click", openSend);
    $("#saveBtn").addEventListener("click", () => saveCloud(false));
    $("#printBtn").addEventListener("click", () => { if (checkReady()) window.print(); });
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

    if ("ResizeObserver" in window) new ResizeObserver(fitPreview).observe($("#pvStage"));
    else window.addEventListener("resize", fitPreview);
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
    }
    const pre = IG.store.get("ig_prefill_client", null);
    if (pre) { inv.to = Object.assign({ name: "", email: "", address: "", phone: "" }, pre); IG.store.remove("ig_prefill_client"); }
    fillFields();
    if (pre) openStep("details");

    user = await (IG.headerReady || IG.getUser());
    const note = $("#cloudNote");
    if (!IG.cloudReady) { $("#saveBtn").hidden = true; return; }
    if (!user) {
      note.innerHTML = '<a href="/login/?signup=1&next=%2F%23create">Create a free account</a> to save invoices and clients, and to email invoices to clients.';
      return;
    }
    note.innerHTML = "Logged in as <strong>" + esc(user.email) + '</strong>. <a href="/dashboard/">Open your dashboard</a>';

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
    if (id || dup) setTimeout(() => $("#create").scrollIntoView({ block: "start" }), 50);
    await loadCloudData();
  }

  document.addEventListener("DOMContentLoaded", start);
})();
