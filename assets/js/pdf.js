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

  IG.buildPdf = function (inv) {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("The PDF tool did not load. Check your internet connection and reload the page.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const t = IG.calc(inv);
    const cur = inv.currency;
    const M = (v) => IG.moneyPdf(v, cur);
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const L = 18, R = W - 18;
    const accent = hexToRgb(inv.accent);
    const ink = [22, 33, 58], soft = [86, 97, 118], faint = [138, 147, 165];

    doc.setProperties({ title: clean((inv.title || "Invoice") + " " + inv.number), creator: "invoice-gen.net" });

    const T = ["modern", "minimal"].indexOf(inv.template) >= 0 ? inv.template : "classic";
    const mix = (c, w) => c.map((v) => Math.round(v + (255 - v) * w));
    const onBand = T === "modern";
    const metaCount = 3 + (inv.poNumber ? 1 : 0);
    const bandH = Math.max(46, 18 + 17 + metaCount * 5.5 + 4);

    // top of the page, per design
    if (T === "classic") {
      doc.setFillColor(...accent);
      doc.rect(0, 0, W, 4, "F");
    } else if (T === "modern") {
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
      ["Invoice no.", inv.number],
      ["Issue date", IG.prettyDate(inv.issueDate)],
      ["Due date", IG.prettyDate(inv.dueDate)]
    ];
    if (inv.poNumber) meta.push(["PO / reference", inv.poNumber]);
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
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: body.length ? body : [["-", "", "", M(0)]],
      theme: "plain",
      styles: { font: "helvetica", fontSize: 9.5, textColor: ink, cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 }, lineColor: [237, 240, 244], lineWidth: { bottom: 0.3 } },
      headStyles: T === "minimal"
        ? { fillColor: false, textColor: ink, fontStyle: "bold", fontSize: 8.5, lineColor: accent, lineWidth: { bottom: 0.7 } }
        : { fillColor: accent, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5, lineWidth: 0 },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right", cellWidth: 18 }, 2: { halign: "right", cellWidth: 32 }, 3: { halign: "right", cellWidth: 34 } },
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
      doc.setFillColor(230, 235, 241);
      doc.roundedRect(TX - 3, y - 4.5, R - TX + 6, 9, 1.5, 1.5, "F");
      doc.setTextColor(...ink);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
    doc.text("Balance due", TX, y + 1.5); doc.text(M(t.balance), R, y + 1.5, { align: "right" });
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
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...faint);
      doc.text("Made with invoice-gen.net", L, H - 10);
      if (pages > 1) doc.text("Page " + i + " of " + pages, R, H - 10, { align: "right" });
    }
    return doc;
  };

  IG.pdfFileName = function (inv) {
    const base = (inv.number || "invoice") + (inv.to && inv.to.name ? "-" + inv.to.name : "");
    return base.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) + ".pdf";
  };

  IG.pdfBase64 = function (inv) {
    const uri = IG.buildPdf(inv).output("datauristring");
    return uri.slice(uri.indexOf(",") + 1);
  };
})();
