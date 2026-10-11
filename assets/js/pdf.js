/* invoice-gen.net — builds the invoice PDF with jsPDF + AutoTable */
(function () {
  "use strict";
  const IG = (window.IG = window.IG || {});

  function hexToRgb(hex) {
    const h = (hex || "#16213a").replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // Latin-1 only for the built-in PDF font
  function clean(s) {
    return String(s == null ? "" : s)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-").replace(/…/g, "...")
      // eslint-disable-next-line no-control-regex
      .replace(/[^\u0000-ÿ€\n]/g, "?");
  }

  function imageFormat(dataUrl) {
    const m = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl || "");
    if (!m) return null;
    const f = m[1].toLowerCase();
    return f === "jpg" || f === "jpeg" ? "JPEG" : f.toUpperCase();
  }

  /* The PDF library (about 400 KB) loads only when it is about to be needed */
  IG.loadPdf = function () {
    if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable) return Promise.resolve();
    if (IG._pdfP) return IG._pdfP;
    const add = (src) => new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = src; s.async = false;
      s.onload = res; s.onerror = () => rej(new Error("load failed")); document.head.appendChild(s);
    });
    IG._pdfP = add("/assets/vendor/jspdf.umd.min.js?v=2.5.1").then(() => add("/assets/vendor/jspdf.plugin.autotable.min.js?v=3.8.2"))
      .catch((e) => { IG._pdfP = null; throw e; });
    return IG._pdfP;
  };

  IG.buildPdf = function (inv) {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("The PDF tool did not load. Check your internet connection and reload the page.");
    const { jsPDF } = window.jspdf;
    IG.setRegion(inv.region);
    const doc = new jsPDF({ unit: "mm", format: (IG.REGIONS[inv.region] || {}).paper || "a4", compress: true });
    const t = IG.calc(inv);
    const cur = inv.currency;
    const M = (v) => IG.moneyPdf(v, cur);
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const L = 18, R = W - 18;
    const accent = hexToRgb(inv.accent);
    const ink = [22, 33, 58], soft = [86, 97, 118], faint = [138, 147, 165];

    doc.setProperties({ title: clean((inv.title || "Invoice") + " " + inv.number), creator: "invoice-gen.net" });
    if (IG.isTimesheet && IG.isTimesheet(inv)) return buildTimesheet(doc, inv, t, M, accent);

    const T = ["modern", "minimal"].indexOf(inv.template) >= 0 ? inv.template : "classic";
    const mix = (c, w) => c.map((v) => Math.round(v + (255 - v) * w));
    const onBand = T === "modern";
    const extraFields = (inv.fields || []).filter((f) => String(f.label || "").trim() && String(f.value || "").trim());
    const metaCount = 3 + (inv.poNumber ? 1 : 0) + extraFields.length;
    const bandH = Math.max(46, 18 + 17 + metaCount * 5.5 + 4);

    // top of the page, per design
    if (T === "modern") {
      doc.setFillColor(...accent);
      doc.rect(0, 0, W, bandH, "F");
    }

    // logo
    let y = 18;
    const fmt = imageFormat(inv.logo);
    if (fmt) {
      try {
        const boxW = 50, boxH = 24;
        let w = boxW, h = boxH;
        if (inv.logoW && inv.logoH) {
          const r = Math.min(boxW / inv.logoW, boxH / inv.logoH);
          w = inv.logoW * r; h = inv.logoH * r;
        }
        if (onBand) {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(L - 3, y - 3, w + 6, h + 6, 2, 2, "F");
        }
        doc.addImage(inv.logo, fmt, L, y, w, h, undefined, "FAST");
      } catch (e) { /* skip a logo jsPDF can't read */ }
    }

    // title + meta (right)
    doc.setFont("helvetica", T === "minimal" ? "normal" : "bold");
    doc.setFontSize(T === "minimal" ? 28 : 26);
    doc.setTextColor(...(onBand ? [255, 255, 255] : T === "minimal" ? ink : accent));
    doc.text(clean(inv.title || "Invoice"), R, y + 8, { align: "right" });
    doc.setFontSize(9.5);
    let my = y + 17;
    const meta = [
      [IG.docLabels(inv.title).no, inv.number],
      ["Issue date", IG.prettyDate(inv.issueDate)],
      [IG.docLabels(inv.title).due, IG.prettyDate(inv.dueDate)]
    ];
    if (inv.poNumber) meta.push(["PO / reference", inv.poNumber]);
    extraFields.forEach((f) => meta.push([String(f.label).trim(), String(f.value).trim()]));
    meta.forEach(([k, v]) => {
      if (!v) return;
      doc.setFont("helvetica", "normal"); doc.setTextColor(...(onBand ? mix(accent, 0.7) : soft));
      doc.text(k, R - 42, my, { align: "right" });
      doc.setFont("helvetica", "bold"); doc.setTextColor(...(onBand ? [255, 255, 255] : ink));
      doc.text(clean(v), R, my, { align: "right" });
      my += 5.5;
    });
    if (T === "minimal") {
      doc.setDrawColor(219, 226, 234); doc.setLineWidth(0.3);
      doc.line(L, Math.max(my, y + 30) + 2, R, Math.max(my, y + 30) + 2);
    }

    // parties
    y = onBand ? Math.max(bandH, my + 4) + 12 : Math.max(my, y + 30) + (T === "minimal" ? 12 : 8);
    const colW = (R - L - 10) / 2;
    function party(label, p, x) {
      let py = y;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...faint);
      doc.text(label, x, py); py += 5.5;
      doc.setFontSize(11); doc.setTextColor(...ink);
      if (p.name) { doc.text(doc.splitTextToSize(clean(p.name), colW), x, py); py += 5.5; }
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...soft);
      [p.address, p.email, p.phone, p.taxId ? "Tax ID: " + p.taxId : ""].forEach((line) => {
        if (!line) return;
        const parts = doc.splitTextToSize(clean(line), colW);
        doc.text(parts, x, py); py += parts.length * 4.6;
      });
      return py;
    }
    const endA = party("From", inv.from, L);
    const endB = party("Bill to", inv.to, L + colW + 10);
    y = Math.max(endA, endB) + 8;

    // items table
    const body = inv.items
      .filter((it) => String(it.desc).trim() || Number(it.rate) || Number(it.qty) !== 1)
      .map((it, i) => [clean(it.desc || "-"), String(it.qty || 0), M(Number(it.rate) || 0), M(t.lines[inv.items.indexOf(it)] || 0)]);
    doc.autoTable({
      startY: y,
      margin: { left: L, right: W - R },
      head: [["Description", (IG.UNITS[inv.unit] || IG.UNITS.qty).q, (IG.UNITS[inv.unit] || IG.UNITS.qty).r, "Amount"]],
      body: body.length ? body : [["-", "", "", M(0)]],
      theme: "plain",
      styles: { font: "helvetica", fontSize: 9.5, textColor: ink, cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 }, lineColor: [237, 240, 244], lineWidth: { bottom: 0.3 } },
      headStyles: T === "minimal"
        ? { fillColor: false, textColor: ink, fontStyle: "bold", fontSize: 8.5, lineColor: accent, lineWidth: { bottom: 0.7 } }
        : { fillColor: accent, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5, lineWidth: 0 },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right", cellWidth: 20 }, 2: { halign: "right", cellWidth: 32 }, 3: { halign: "right", cellWidth: 34 } },
      didParseCell: (d) => { if (d.section === "head" && d.column.index > 0) d.cell.styles.halign = "right"; }
    });
    y = doc.lastAutoTable.finalY + 8;

    // totals
    const rows = [["Subtotal", M(t.subtotal)]];
    if (t.discount) rows.push(["Discount" + (inv.discountType === "%" ? " (" + inv.discount + "%)" : ""), "-" + M(t.discount)]);
    if (t.tax) rows.push([clean(inv.taxLabel || "Tax") + " (" + inv.taxRate + "%)", M(t.tax)]);
    if (t.shipping) rows.push(["Shipping", M(t.shipping)]);
    const needed = rows.length * 6 + 30;
    if (y + needed > H - 20) { doc.addPage(); y = 20; }
    const TX = R - 78;
    doc.setFontSize(9.5);
    rows.forEach(([k, v]) => {
      doc.setFont("helvetica", "normal"); doc.setTextColor(...soft); doc.text(k, TX, y);
      doc.setTextColor(...ink); doc.text(v, R, y, { align: "right" });
      y += 6;
    });
    doc.setDrawColor(...(T === "minimal" ? [219, 226, 234] : ink)); doc.setLineWidth(T === "minimal" ? 0.3 : 0.6); doc.line(TX, y - 2, R, y - 2);
    y += 5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("Total", TX, y); doc.text(M(t.total), R, y, { align: "right" });
    y += 7;
    if (t.paid) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...soft);
      doc.text("Amount paid", TX, y); doc.setTextColor(...ink); doc.text("-" + M(t.paid), R, y, { align: "right" });
      y += 6;
    }
    if (T === "modern") {
      doc.setFillColor(...accent);
      doc.roundedRect(TX - 3, y - 4.5, R - TX + 6, 9, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
    } else if (T === "minimal") {
      doc.setDrawColor(...accent); doc.setLineWidth(0.7);
      doc.line(TX, y - 4.5, R, y - 4.5);
      doc.setTextColor(...accent);
    } else {
      doc.setFillColor(...mix(accent, 0.9));
      doc.roundedRect(TX - 3, y - 4.5, R - TX + 6, 9, 1.5, 1.5, "F");
      doc.setTextColor(...accent);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
    doc.text(IG.docLabels(inv.title).bal, TX, y + 1.5); doc.text(M(t.balance), R, y + 1.5, { align: "right" });
    const balanceY = y;
    const balancePage = doc.getCurrentPageInfo().pageNumber;
    y += 16;

    // notes & terms
    function block(label, text) {
      if (!String(text || "").trim()) return;
      const lines = doc.splitTextToSize(clean(text), R - L);
      if (y + lines.length * 4.6 + 10 > H - 18) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...faint);
      doc.text(label, L, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...soft);
      doc.text(lines, L, y); y += lines.length * 4.6 + 6;
    }
    block("Notes", inv.notes);
    block("Terms", inv.terms);

    // paid stamp, beside the totals
    if (inv.status === "paid") {
      doc.setPage(balancePage);
      doc.setTextColor(14, 124, 90);
      doc.setFont("helvetica", "bold"); doc.setFontSize(34);
      doc.text("PAID", TX - 52, balanceY - 2, { angle: 12 });
      doc.setPage(doc.getNumberOfPages());
    }

    // footer on every page
    const pages = doc.getNumberOfPages();
    for (let i = 1; pages > 1 && i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...faint);
      if (pages > 1) doc.text("Page " + i + " of " + pages, R, H - 10, { align: "right" });
    }
    return doc;
  };

  /* Timesheet invoice: header, Bill to | Ship to, a one-line summary, then the
     shift table on the left with the totals and notes beside it */
  function buildTimesheet(doc, inv, t, M, accent) {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const L = 15, R = W - 15;
    const ink = [24, 32, 48], soft = [84, 94, 112], faint = [134, 143, 160], rule = [222, 227, 234];
    const mix = (c, w) => c.map((v) => Math.round(v + (255 - v) * w));
    const head = accent;
    const totalH = IG.totalHours(inv);
    const rate = Number(inv.hourRate) || 0;
    const H2 = (h) => IG.fmtHours(h);

    // left: logo, then the worker or business name and contact lines
    let y = 16;
    let ly = y + 5;
    const fmt = imageFormat(inv.logo);
    if (fmt) {
      try {
        const boxW = 46, boxH = 20;
        let w = boxW, h = boxH;
        if (inv.logoW && inv.logoH) { const r = Math.min(boxW / inv.logoW, boxH / inv.logoH); w = inv.logoW * r; h = inv.logoH * r; }
        doc.addImage(inv.logo, fmt, L, y, w, h, undefined, "FAST");
        ly = y + h + 8;
      } catch (e) { /* skip a logo jsPDF can't read */ }
    }
    const leftW = 92;
    doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...ink);
    const nm = doc.splitTextToSize(clean(inv.from.name || ""), leftW);
    doc.text(nm, L, ly); ly += nm.length * 6.6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...soft);
    [inv.from.address, inv.from.email, inv.from.phone, inv.from.taxId ? "Tax / VAT ID: " + inv.from.taxId : ""].forEach((line) => {
      if (!String(line || "").trim()) return;
      const parts = doc.splitTextToSize(clean(line), leftW);
      doc.text(parts, L, ly); ly += parts.length * 4.5;
    });

    // right: big title, number, dates and the balance box
    doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(...ink);
    doc.text(clean((inv.title || "Invoice").toUpperCase()), R, y + 9, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11.5); doc.setTextColor(...faint);
    doc.text(clean("# " + (inv.number || "")), R, y + 16.5, { align: "right" });
    let my = y + 26;
    const meta = [["Date:", IG.prettyDate(inv.issueDate)], [IG.docLabels(inv.title).due + ":", IG.prettyDate(inv.dueDate)]];
    if (inv.poNumber) meta.push(["PO / ref.:", inv.poNumber]);
    (inv.fields || []).forEach((f) => { if (String(f.label || "").trim() && String(f.value || "").trim()) meta.push([String(f.label).trim() + ":", String(f.value).trim()]); });
    doc.setFontSize(9.5);
    meta.forEach(([k, v]) => {
      if (!v) return;
      doc.setFont("helvetica", "normal"); doc.setTextColor(...soft); doc.text(clean(k), R - 40, my, { align: "right" });
      doc.setTextColor(...ink); doc.text(clean(v), R - 2, my, { align: "right" });
      my += 5.6;
    });
    my += 0.6;
    doc.setFillColor(243, 245, 248);
    doc.roundedRect(R - 86, my - 5, 86, 9, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...ink);
    doc.text(clean(IG.docLabels(inv.title).bal + ":"), R - 40, my + 0.8, { align: "right" });
    doc.text(M(t.balance), R - 2, my + 0.8, { align: "right" });
    my += 8;

    // Bill to | Ship to, under the name, beside the dates and balance
    y = ly + 7;
    const hasShip = !!String(inv.shipTo || "").trim();
    const leftEnd = R - 92;
    const colW = hasShip ? (leftEnd - L - 10) / 2 : leftEnd - L;
    function party(label, lines, boldFirst, x) {
      let py = y;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...faint);
      doc.text(label, x, py); py += 5.2;
      lines.forEach((line, i) => {
        if (!String(line || "").trim()) return;
        const strong = boldFirst ? i === 0 : true;
        doc.setFont("helvetica", strong ? "bold" : "normal"); doc.setFontSize(strong ? 10 : 9); doc.setTextColor(...(strong ? ink : soft));
        const parts = doc.splitTextToSize(clean(line), colW);
        doc.text(parts, x, py); py += parts.length * (strong ? 4.8 : 4.3);
      });
      return py;
    }
    const endA = party("Bill To:", [inv.to.name, inv.to.address, inv.to.email, inv.to.phone], true, L);
    let endB = endA;
    if (hasShip) {
      const DX = L + colW + 5;
      endB = party("Ship To:", [inv.shipTo], false, DX + 5);
      doc.setDrawColor(...rule); doc.setLineWidth(0.4);
      doc.line(DX, y - 3.5, DX, Math.max(endA, endB) - 2);
    }
    y = Math.max(endA, endB, my) + 5;

    // summary line
    doc.autoTable({
      startY: y,
      margin: { left: L, right: W - R },
      head: [["Item", "Quantity", "Rate", "Amount"]],
      body: [[clean((inv.service || "").trim() || "Hours worked"), H2(totalH), M(rate), M(t.lines[0] || 0)]],
      theme: "plain",
      styles: { font: "helvetica", fontSize: 9.5, textColor: ink, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }, lineColor: rule, lineWidth: { bottom: 0.3 } },
      headStyles: { fillColor: head, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, lineWidth: 0 },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right", cellWidth: 26 }, 2: { halign: "right", cellWidth: 32 }, 3: { halign: "right", cellWidth: 34 } },
      didParseCell: (d) => { if (d.section === "head" && d.column.index > 0) d.cell.styles.halign = "right"; }
    });
    const y0 = doc.lastAutoTable.finalY + 7;
    const page0 = doc.getCurrentPageInfo().pageNumber;

    // shift table (left)
    const TW = 118;
    const tw = inv.region === "us" ? 17 : 13.5;
    const shifts = (inv.shifts || []).filter((s) => IG.shiftHours(s) > 0 || String(s.type || "").trim() || s.start || s.end);
    const body = shifts.map((s) => [IG.formatDate(s.date, inv.region) || "", clean(s.type || ""), IG.fmtTime(s.start), IG.fmtTime(s.end), IG.fmtBreak(s.brk), H2(IG.shiftHours(s))]);
    doc.autoTable({
      startY: y0,
      margin: { left: L, right: W - (L + TW), top: 16, bottom: 18 },
      head: [["Date", "Work type", "Start", "End", "Break", "Hours"]],
      body: body.length ? body : [["", "", "", "", "", "0"]],
      foot: [["", "Total", "", "", "", H2(totalH)]],
      showFoot: "lastPage",
      showHead: "everyPage",
      theme: "plain",
      styles: { font: "helvetica", fontSize: 8, textColor: ink, cellPadding: { top: 1.9, bottom: 1.9, left: 2, right: 2 }, overflow: "linebreak" },
      headStyles: { fillColor: head, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      footStyles: { fillColor: mix(head, 0.88), textColor: ink, fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [246, 247, 249] },
      columnStyles: { 0: { cellWidth: inv.region === "us" ? 22 : 20 }, 1: { cellWidth: "auto" }, 2: { cellWidth: tw, halign: "center" }, 3: { cellWidth: tw, halign: "center" }, 4: { cellWidth: 15, halign: "center" }, 5: { cellWidth: 13, halign: "right" } },
      rowPageBreak: "avoid",
      didParseCell: (d) => {
        if (d.section !== "body" && d.column.index >= 2) d.cell.styles.halign = d.column.index === 5 ? "right" : "center";
      }
    });
    const lastPage = doc.getNumberOfPages();

    // totals and notes (right column, beside the table)
    const RX = L + TW + 8;
    const RW = R - RX;
    doc.setPage(page0);
    let pg = page0;
    let ry = y0 + 4;
    const room = (h) => {
      if (ry + h <= H - 16) return;
      pg += 1;
      if (pg > doc.getNumberOfPages()) doc.addPage();
      doc.setPage(pg); ry = 20;
    };
    const line = (k, v, bold, size) => {
      room(6);
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size || 9.5);
      doc.setTextColor(...(bold ? ink : soft)); doc.text(clean(k), RX, ry);
      doc.setTextColor(...ink); doc.text(clean(v), R, ry, { align: "right" });
      ry += bold ? 6.6 : 6;
    };
    const divider = () => { doc.setDrawColor(...rule); doc.setLineWidth(0.35); doc.line(RX, ry - 3, R, ry - 3); ry += 2.6; };
    line("Total Hours:", H2(totalH) + " h");
    line("Rate:", M(rate) + " / h");
    line("Subtotal:", M(t.subtotal));
    if (t.discount) line("Discount" + (inv.discountType === "%" ? " (" + inv.discount + "%)" : "") + ":", "-" + M(t.discount));
    if (Number(inv.taxRate) > 0) line((inv.taxLabel || "Tax") + " (" + inv.taxRate + "%):", M(t.tax));
    if (t.shipping) line("Shipping:", M(t.shipping));
    divider();
    line("Total:", M(t.total), true, 11);
    if (t.paid) {
      line("Amount paid:", "-" + M(t.paid));
      room(10);
      doc.setFillColor(...mix(accent, 0.9));
      doc.roundedRect(RX - 2, ry - 5, RW + 2, 8.6, 1.2, 1.2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...accent);
      doc.text(clean(IG.docLabels(inv.title).bal + ":"), RX, ry); doc.text(M(t.balance), R - 1.5, ry, { align: "right" });
      ry += 8;
    }
    divider();
    const block = (label, text) => {
      if (!String(text || "").trim()) return;
      room(10);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...ink);
      doc.text(label, RX, ry); ry += 4.8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...soft);
      doc.splitTextToSize(clean(text), RW).forEach((ln) => { room(4.2); doc.text(ln, RX, ry); ry += 4.1; });
      ry += 3;
    };
    block("Notes:", inv.notes);
    block("Terms:", inv.terms);

    if (inv.status === "paid") {
      doc.setPage(1);
      doc.setTextColor(14, 124, 90); doc.setFont("helvetica", "bold"); doc.setFontSize(34);
      doc.text("PAID", W / 2 - 4, 36, { angle: 12 });
    }

    const pages = doc.getNumberOfPages();
    for (let i = 1; pages > 1 && i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...faint);
      doc.text(clean((inv.title || "Invoice") + " " + (inv.number || "")), L, H - 9);
      doc.text("Page " + i + " of " + pages, R, H - 9, { align: "right" });
    }
    doc.setPage(Math.max(lastPage, pg));
    return doc;
  }

  IG.pdfFileName = function (inv) {
    const base = (inv.number || "invoice") + (inv.to && inv.to.name ? "-" + inv.to.name : "");
    return base.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) + ".pdf";
  };

  IG.pdfBase64 = function (inv) {
    const uri = IG.buildPdf(inv).output("datauristring");
    return uri.slice(uri.indexOf(",") + 1);
  };
})();

/* Saving the PDF in every browser.
   Desktop and Android: a normal download.
   iPhone/iPad and in-app browsers (Facebook, Instagram, Messenger…): they often ignore
   downloads, so we hand back a link the person taps themselves: Save, Open or Share. */
(function () {
  "use strict";
  const IG = (window.IG = window.IG || {});
  const ua = navigator.userAgent || "";
  IG.isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  IG.isInApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|MicroMessenger|Snapchat|TikTok|; wv\)/i.test(ua);
  let lastUrl = null;

  IG.pdfBlob = function (inv) {
    const blob = IG.buildPdf(inv).output("blob");
    if (lastUrl) setTimeout(((u) => () => URL.revokeObjectURL(u))(lastUrl), 60000);
    lastUrl = URL.createObjectURL(blob);
    return { blob, url: lastUrl, name: IG.pdfFileName(inv) };
  };

  IG.canShareFile = function (blob, name) {
    try {
      if (!navigator.canShare || typeof File === "undefined") return false;
      return navigator.canShare({ files: [new File([blob], name, { type: "application/pdf" })] });
    } catch (e) { return false; }
  };

  /* returns {direct:true} when the browser downloaded it, otherwise the file for the "ready" sheet */
  IG.savePdf = function (inv) {
    const f = IG.pdfBlob(inv);
    if (IG.isIOS || IG.isInApp) return Object.assign({ direct: false }, f);
    if (window.navigator.msSaveOrOpenBlob) { window.navigator.msSaveOrOpenBlob(f.blob, f.name); return Object.assign({ direct: true }, f); }
    const a = document.createElement("a");
    a.href = f.url;
    a.download = f.name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 0);
    return Object.assign({ direct: true }, f);
  };

  /* open the PDF in a new tab (must be called straight from a click) */
  IG.openPdf = function (inv) {
    const f = IG.pdfBlob(inv);
    const w = IG.isInApp ? null : window.open(f.url, "_blank");
    return Object.assign({ opened: !!w }, f);
  };

  IG.sharePdf = function (blob, name, title) {
    const file = new File([blob], name, { type: "application/pdf" });
    return navigator.share({ files: [file], title: title || name });
  };
})();
