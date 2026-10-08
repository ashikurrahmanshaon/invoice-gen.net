/* invoice-gen.net — the invoice builder page */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  let inv = null;
  let user = null;
  let clients = [];
  let saveTimer = null;
  let cloudSaving = false;

  /* ---------- field binding ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
    target[last] = value;
  }

  function fillFields() {
    $$("[data-f]").forEach((el) => {
      const v = getPath(inv, el.dataset.f);
      el.value = v == null ? "" : v;
    });
    $("#currency").value = inv.currency;
    $("#status").value = inv.status || "draft";
    setAccent(inv.accent, false);
    setTemplate(inv.template, false);
    showLogo();
    renderItems();
    autosizeAll();
    updateStamp();
  }

  function autosize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }
  function autosizeAll() {
    $$(".sheet textarea").forEach(autosize);
  }

  /* ---------- line items ---------- */
  function renderItems() {
    const tbody = $("#itemRows");
    tbody.innerHTML = "";
    inv.items.forEach((it, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td><textarea rows="1" data-i="' + i + '" data-k="desc" placeholder="Item or service description" aria-label="Description, line ' + (i + 1) + '"></textarea></td>' +
        '<td class="num"><input inputmode="decimal" data-i="' + i + '" data-k="qty" aria-label="Quantity, line ' + (i + 1) + '"></td>' +
        '<td class="num"><input inputmode="decimal" data-i="' + i + '" data-k="rate" placeholder="0.00" aria-label="Rate, line ' + (i + 1) + '"></td>' +
        '<td class="num amount" data-amount="' + i + '"></td>' +
        '<td><button type="button" class="row-x" data-remove="' + i + '" aria-label="Remove line ' + (i + 1) + '">×</button></td>';
      tbody.appendChild(tr);
      $('[data-k="desc"]', tr).value = it.desc || "";
      $('[data-k="qty"]', tr).value = it.qty;
      $('[data-k="rate"]', tr).value = it.rate ? it.rate : "";
    });
    $$("textarea", tbody).forEach(autosize);
    recalc();
  }

  function recalc() {
    const t = IG.calc(inv);
    const M = (v) => IG.money(v, inv.currency);
    t.lines.forEach((amt, i) => {
      const cell = $('[data-amount="' + i + '"]');
      if (cell) cell.textContent = M(amt);
    });
    $("#tSub").textContent = M(t.subtotal);
    $("#tDisc").textContent = t.discount ? "-" + M(t.discount) : M(0);
    $("#tTax").textContent = M(t.tax);
    $("#tShip").textContent = M(t.shipping);
    $("#tTotal").textContent = M(t.total);
    $("#tPaid").textContent = t.paid ? "-" + M(t.paid) : M(0);
    $("#tBal").textContent = M(t.balance);
    return t;
  }

  /* ---------- accent, logo, stamp ---------- */
  function setAccent(color, save) {
    inv.accent = color;
    $("#sheet").style.setProperty("--accent", color);
    $$(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === color)));
    if (save) changed();
  }

  function setTemplate(t, save) {
    if (IG.TEMPLATES.indexOf(t) < 0) t = "classic";
    inv.template = t;
    const sheet = $("#sheet");
    IG.TEMPLATES.forEach((k) => sheet.classList.toggle("t-" + k, k === t));
    $$(".tpl-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.template === t)));
    if (save) changed();
  }

  function showLogo() {
    const drop = $("#logoDrop");
    const img = $("#logoImg");
    if (inv.logo) {
      img.src = inv.logo;
      img.hidden = false;
      $("#logoHint").hidden = true;
      drop.classList.add("has-logo");
    } else {
      img.hidden = true;
      img.removeAttribute("src");
      $("#logoHint").hidden = false;
      drop.classList.remove("has-logo");
    }
  }

  function readLogo(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      IG.toast("Use a PNG or JPG image for the logo.", "err");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      IG.toast("That logo is over 3 MB. Use a smaller image.", "err");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // shrink to max 600px and convert to PNG so every PDF reader shows it
        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        inv.logo = c.toDataURL("image/png");
        inv.logoW = c.width;
        inv.logoH = c.height;
        showLogo();
        changed();
      };
      img.onerror = () => IG.toast("That image could not be read. Try another file.", "err");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function updateStamp() {
    const s = $("#stamp");
    s.classList.remove("show");
    if (inv.status === "paid") {
      s.textContent = "Paid";
      s.classList.add("paid");
    } else {
      s.classList.remove("paid");
      s.style.opacity = "";
    }
  }

  function thunk(word) {
    if (inv.status === "paid") return;
    const s = $("#stamp");
    s.textContent = word;
    s.classList.remove("show");
    void s.offsetWidth; // restart the animation
    s.classList.add("show");
    clearTimeout(thunk.t);
    thunk.t = setTimeout(() => s.classList.remove("show"), 2600);
  }

  /* ---------- saving ---------- */
  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => IG.store.set("ig_draft", inv), 300);
  }

  function rowFor(inv, t) {
    return {
      user_id: user.id,
      number: inv.number,
      client_name: inv.to.name || null,
      client_email: inv.to.email || null,
      issue_date: inv.issueDate || null,
      due_date: inv.dueDate || null,
      currency: inv.currency,
      total: t.total,
      balance: t.balance,
      status: inv.status || "draft",
      data: inv
    };
  }

  async function saveCloud(quiet) {
    if (!IG.cloud || !user) {
      if (!quiet) window.location.href = "/login/?next=" + encodeURIComponent("/" + window.location.search);
      return false;
    }
    if (cloudSaving) return false;
    cloudSaving = true;
    const btn = $("#saveBtn");
    if (!quiet) btn.disabled = true;
    try {
      const t = IG.calc(inv);
      const row = rowFor(inv, t);
      let res;
      if (inv.id) {
        res = await IG.cloud.from("invoices").update(row).eq("id", inv.id).select("id").single();
      } else {
        res = await IG.cloud.from("invoices").insert(row).select("id").single();
      }
      if (res.error) throw res.error;
      inv.id = res.data.id;
      IG.store.set("ig_draft", inv);
      IG.bumpNumber(inv.number);
      const url = new URL(window.location.href);
      url.searchParams.set("id", inv.id);
      window.history.replaceState(null, "", url);
      await rememberClient();
      if (!quiet) {
        IG.toast("Saved to your account.", "ok");
        thunk("Saved");
      }
      return true;
    } catch (e) {
      IG.toast("Could not save: " + (e.message || "check your connection and try again."), "err");
      return false;
    } finally {
      cloudSaving = false;
      btn.disabled = false;
    }
  }

  async function rememberClient() {
    const name = (inv.to.name || "").trim();
    if (!name || !user) return;
    const exists = clients.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    const { data, error } = await IG.cloud
      .from("clients")
      .insert({ user_id: user.id, name, email: inv.to.email || null, address: inv.to.address || null, phone: inv.to.phone || null })
      .select()
      .single();
    if (!error && data) {
      clients.push(data);
      fillClientSelect();
    }
  }

  /* ---------- clients ---------- */
  function fillClientSelect() {
    const sel = $("#clientSelect");
    sel.innerHTML = '<option value="">Choose a saved client…</option>' +
      clients.map((c) => '<option value="' + c.id + '">' + IG.esc(c.name) + "</option>").join("");
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
      // fill an empty "From" block from the saved business profile
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
    IG.toast("Saved. Your details will fill in every new invoice.", "ok");
  }

  /* ---------- actions ---------- */
  function checkReady() {
    if (!inv.number.trim()) return "Add an invoice number first.";
    if (!inv.from.name.trim()) return "Add your business name in the From section.";
    if (!inv.to.name.trim()) return "Add who the invoice is for in the Bill to section.";
    return null;
  }

  async function downloadPdf() {
    const problem = checkReady();
    if (problem) return IG.toast(problem, "err");
    try {
      IG.buildPdf(inv).save(IG.pdfFileName(inv));
      IG.bumpNumber(inv.number);
      thunk("Ready");
      if (user) saveCloud(true);
    } catch (e) {
      IG.toast(e.message, "err");
    }
  }

  function newInvoice() {
    if (!window.confirm("Start a new invoice? Your business details stay; this invoice's client and items are cleared.")) return;
    IG.bumpNumber(inv.number);
    const keepFrom = inv.from;
    const keep = { logo: inv.logo, logoW: inv.logoW, logoH: inv.logoH, accent: inv.accent, currency: inv.currency, template: inv.template };
    inv = IG.blankInvoice();
    inv.from = Object.assign({}, inv.from, keepFrom);
    Object.assign(inv, keep);
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState(null, "", url);
    fillFields();
    changed();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- email ---------- */
  function openSend() {
    const problem = checkReady();
    if (problem) return IG.toast(problem, "err");
    const dlg = $("#sendModal");
    const t = IG.calc(inv);
    $("#sendTo").value = inv.to.email || "";
    $("#sendSubject").value = (inv.title || "Invoice") + " " + inv.number + " from " + inv.from.name;
    $("#sendMsg").value =
      "Hi " + (inv.to.name || "there") + ",\n\n" +
      "Please find attached " + (inv.title || "invoice").toLowerCase() + " " + inv.number + " for " + IG.money(t.balance, inv.currency) +
      (inv.dueDate ? ", due on " + IG.prettyDate(inv.dueDate) : "") + ".\n\n" +
      "Thank you,\n" + inv.from.name;
    $("#sendLoginNote").hidden = !!user;
    $("#sendNow").disabled = !user;
    $("#sendErr").hidden = true;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    $("#sendTo").focus();
  }

  function closeSend() {
    const dlg = $("#sendModal");
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function sendError(msg) {
    const box = $("#sendErr");
    box.textContent = msg;
    box.hidden = false;
  }

  async function sendNow() {
    const to = $("#sendTo").value.trim();
    if (!IG.validEmail(to)) return sendError("Enter your client's email address, like name@company.com.");
    const subject = $("#sendSubject").value.trim() || "Invoice " + inv.number;
    const message = $("#sendMsg").value;
    const btn = $("#sendNow");
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      inv.to.email = to;
      fillFields();
      await saveCloud(true);
      const { data, error } = await IG.cloud.functions.invoke("send-invoice", {
        body: {
          to,
          subject,
          message,
          copyMe: $("#sendCopy").checked,
          fromName: inv.from.name,
          replyTo: inv.from.email || user.email,
          invoiceId: inv.id,
          fileName: IG.pdfFileName(inv),
          pdfBase64: IG.pdfBase64(inv)
        }
      });
      if (error) {
        let msg = error.message;
        try {
          const body = await error.context.json();
          if (body && body.error) msg = body.error;
        } catch (e) { /* keep default message */ }
        throw new Error(msg);
      }
      if (data && data.error) throw new Error(data.error);
      if (inv.status === "draft") {
        inv.status = "sent";
        $("#status").value = "sent";
        saveCloud(true);
      }
      closeSend();
      IG.toast("Invoice sent to " + to + ".", "ok");
      thunk("Sent");
    } catch (e) {
      sendError("Not sent: " + (e.message || "check your connection and try again."));
    } finally {
      btn.disabled = false;
      btn.textContent = "Send invoice";
    }
  }

  function sendWithMailApp() {
    const to = $("#sendTo").value.trim();
    try {
      IG.buildPdf(inv).save(IG.pdfFileName(inv));
    } catch (e) {
      return sendError(e.message);
    }
    const href = "mailto:" + encodeURIComponent(to) +
      "?subject=" + encodeURIComponent($("#sendSubject").value) +
      "&body=" + encodeURIComponent($("#sendMsg").value + "\n\n(The invoice PDF is attached.)");
    closeSend();
    IG.toast("PDF downloaded. Attach it to the email that just opened.");
    window.location.href = href;
  }

  /* ---------- wiring ---------- */
  function bind() {
    const sheet = $("#sheet");

    sheet.addEventListener("input", (e) => {
      const el = e.target;
      if (el.tagName === "TEXTAREA") autosize(el);
      if (el.dataset.f) {
        let v = el.value;
        if (["discount", "taxRate", "shipping", "paid"].includes(el.dataset.f)) v = v.replace(/[^\d.]/g, "");
        setPath(inv, el.dataset.f, v);
        if (el.dataset.f === "number") IG.store.set("ig_number_touched", true);
      } else if (el.dataset.k) {
        const it = inv.items[+el.dataset.i];
        if (!it) return;
        it[el.dataset.k] = el.dataset.k === "desc" ? el.value : el.value.replace(/[^\d.]/g, "");
      }
      recalc();
      changed();
    });
    sheet.addEventListener("change", (e) => {
      if (e.target.dataset.f === "discountType") recalc();
    });

    $("#itemRows").addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove]");
      if (!b) return;
      inv.items.splice(+b.dataset.remove, 1);
      if (!inv.items.length) inv.items.push({ id: IG.uid(), desc: "", qty: 1, rate: 0 });
      renderItems();
      changed();
    });
    $("#itemRows").addEventListener("keydown", (e) => {
      // Enter in the last rate field adds a new line
      if (e.key === "Enter" && e.target.dataset.k === "rate" && +e.target.dataset.i === inv.items.length - 1) {
        e.preventDefault();
        $("#addLine").click();
      }
    });
    $("#addLine").addEventListener("click", () => {
      inv.items.push({ id: IG.uid(), desc: "", qty: 1, rate: 0 });
      renderItems();
      changed();
      const last = $$('#itemRows [data-k="desc"]').pop();
      if (last) last.focus();
    });

    // logo
    const drop = $("#logoDrop");
    drop.addEventListener("click", (e) => {
      if (e.target.closest("#logoRemove")) return;
      $("#logoFile").click();
    });
    drop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#logoFile").click(); }
    });
    drop.addEventListener("dragover", (e) => e.preventDefault());
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      readLogo(e.dataTransfer.files[0]);
    });
    $("#logoFile").addEventListener("change", (e) => {
      readLogo(e.target.files[0]);
      e.target.value = "";
    });
    $("#logoRemove").addEventListener("click", () => {
      inv.logo = null; inv.logoW = 0; inv.logoH = 0;
      showLogo();
      changed();
    });

    // settings
    const curSel = $("#currency");
    curSel.innerHTML = IG.CURRENCIES.map(([c, n]) => '<option value="' + c + '">' + c + " — " + n + "</option>").join("");
    curSel.addEventListener("change", () => { inv.currency = curSel.value; recalc(); changed(); });
    $("#status").addEventListener("change", (e) => { inv.status = e.target.value; updateStamp(); changed(); });

    const sw = $("#swatches");
    sw.innerHTML = IG.ACCENTS.map(([c, n]) =>
      '<button type="button" class="swatch" data-color="' + c + '" style="background:' + c + '" aria-label="' + n + '" aria-pressed="false"></button>').join("");
    $("#tplPicker").addEventListener("click", (e) => {
      const b = e.target.closest(".tpl-btn");
      if (b) setTemplate(b.dataset.template, true);
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-use-template]");
      if (!b) return;
      setTemplate(b.dataset.useTemplate, true);
      $("#create").scrollIntoView({ behavior: "smooth", block: "start" });
      IG.toast(b.textContent.replace("Use ", "") + " design selected.", "ok");
    });
    sw.addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (b) setAccent(b.dataset.color, true);
    });

    $("#clientSelect").addEventListener("change", (e) => {
      const c = clients.find((x) => x.id === e.target.value);
      if (!c) return;
      inv.to = { name: c.name || "", email: c.email || "", address: c.address || "", phone: c.phone || "" };
      fillFields();
      changed();
      e.target.value = "";
    });

    // actions
    $("#downloadBtn").addEventListener("click", downloadPdf);
    $("#mDownload").addEventListener("click", downloadPdf);
    $("#mSend").addEventListener("click", openSend);
    $("#sendBtn").addEventListener("click", openSend);
    $("#saveBtn").addEventListener("click", () => saveCloud(false));
    $("#printBtn").addEventListener("click", () => window.print());
    $("#newBtn").addEventListener("click", newInvoice);
    $("#profileBtn").addEventListener("click", saveProfile);

    // email dialog
    $("#sendCancel").addEventListener("click", closeSend);
    $("#sendNow").addEventListener("click", sendNow);
    $("#sendMailApp").addEventListener("click", sendWithMailApp);
    $("#sendLoginLink").addEventListener("click", () => IG.store.set("ig_draft", inv));

    // keyboard shortcut: Ctrl/Cmd + S saves
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (user) saveCloud(false);
        else { IG.store.set("ig_draft", inv); IG.toast("Draft kept in this browser. Log in to save it to your account."); }
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
      if (params.get("new") === "1") {
        const url = new URL(window.location.href);
        url.searchParams.delete("new");
        window.history.replaceState(null, "", url);
      }
    } else {
      inv = Object.assign(IG.blankInvoice(), draft);
    }
    fillFields();

    user = await (IG.headerReady || IG.getUser());
    const note = $("#cloudNote");
    if (!IG.cloudReady) {
      note.innerHTML = "Your draft is kept in this browser. Accounts are switched off until Supabase is connected (see README).";
      $("#saveBtn").hidden = true;
      return;
    }
    if (!user) {
      note.innerHTML = '<a href="/login/">Create a free account</a> to save invoices and clients, and to email invoices straight to your clients.';
      $("#saveBtn").textContent = "Log in to save";
      return;
    }
    note.innerHTML = "Logged in as <strong>" + IG.esc(user.email) + '</strong>. <a href="/dashboard/">Your invoices</a>';
    $("#profileBtn").hidden = false;

    const id = params.get("id");
    if (id) {
      const { data, error } = await IG.cloud.from("invoices").select("id,data,status").eq("id", id).maybeSingle();
      if (error || !data) {
        IG.toast("That invoice could not be opened. It may have been deleted.", "err");
      } else {
        inv = Object.assign(IG.blankInvoice(), data.data, { id: data.id, status: data.status });
        fillFields();
        IG.store.set("ig_draft", inv);
      }
    } else if (params.get("dup")) {
      const { data } = await IG.cloud.from("invoices").select("data").eq("id", params.get("dup")).maybeSingle();
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
