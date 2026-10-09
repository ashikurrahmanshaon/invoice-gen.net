# Home page markup for invoice-gen.net (imported by build_pages.py)
# Layout: the generator comes first. A short H1 header, then the invoice
# itself as the form (type straight onto the page) with a sticky side panel
# for download, email, design, colour and currency. Marketing sections below.

def I(path, cls="ico"):
    return ('<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>')

ICONS = {
    "download": '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',
    "send": '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "save": '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    "print": '<path d="M7 8V4h10v4M7 17H5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "arrow": '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    "chev": '<path d="m6 9 6 6 6-6"/>',
    "image": '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "pen": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    "palette": '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.3-.6-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.9-4-8.8-9-8.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.8" r="1"/>',
    "percent": '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    "lock": '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    "file": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
}

ICONS["eye"] = '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
ICONS["sliders"] = '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'
ICONS["share"] = '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'
ICONS["ext"] = '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'
ICONS["clock"] = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
ICONS["user"] = '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>'

def fi(path, ph, aria, typ="text", cls="", extra=""):
    t = '' if typ == "text" else f' type="{typ}"'
    return f'<input class="fi {cls}"{t} data-f="{path}" placeholder="{ph}" aria-label="{aria}"{extra}>'

def ta(path, ph, aria, rows=2, cls=""):
    return f'<textarea class="fi {cls}" rows="{rows}" data-f="{path}" placeholder="{ph}" aria-label="{aria}"></textarea>'

TPLS = [("classic", "Classic"), ("modern", "Modern"), ("minimal", "Minimal")]

def build(FAQ, ICON_DL, ICON_SEND):
    tpl_buttons = "".join(
        f'<button type="button" class="tpl-btn" data-template="{k}" aria-pressed="false"><span class="tpl-thumb t-{k}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>{n}</span></button>'
        for k, n in TPLS)
    faq_html = "\n".join(f'          <details class="qa"><summary>{q}</summary><div class="qa-body"><p>{a}</p></div></details>' for q, a in FAQ)

    return f"""<section class="gen" id="create" aria-labelledby="gen-title">
  <div class="wrap gen-head">
    <div>
      <h1 id="gen-title">Free Invoice Generator</h1>
      <p>Fill in the invoice below, then download it as a PDF or email it to your client. No sign-up needed.</p>
    </div>
    <ul class="gen-ticks" aria-label="What you get">
      <li>{I(ICONS["check"])} Free, no watermark</li>
      <li>{I(ICONS["check"])} PDF and email</li>
      <li>{I(ICONS["check"])} 28 currencies</li>
    </ul>
  </div>

  <div class="wrap gen-grid">
    <div class="sheet-col">
      <div class="sheet t-classic" id="sheet">
        <div class="stamp" id="stamp" aria-hidden="true">Paid</div>
        <div class="sh-top">
          <div class="logo-drop" id="logoDrop" role="button" tabindex="0" aria-label="Add your logo">
            <img id="logoImg" alt="Your logo" hidden>
            <span class="logo-empty" id="logoHint">{I(ICONS["image"])}<b>+ Add your logo</b></span>
            <input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden>
          </div>
          <div class="sh-title">
            {fi("title", "Invoice", "Document title", cls="fi-doc")}
            <div class="sh-meta">
              <label for="f-number">Invoice no.</label>{fi("number", "INV-0001", "Invoice number", extra=' id="f-number" autocomplete="off"')}
              <label for="f-issue">Date</label>{fi("issueDate", "", "Issue date", "date", extra=' id="f-issue"')}
              <label for="f-due">Due date</label>{fi("dueDate", "", "Due date", "date", extra=' id="f-due"')}
              <label for="f-po">PO / ref.</label>{fi("poNumber", "Optional", "PO or reference", extra=' id="f-po"')}
            </div>
          </div>
        </div>
        <button type="button" class="link-btn logo-remove" id="logoRemove" hidden>Remove logo</button>

        <div class="sh-parties">
          <div class="party">
            <span class="sh-label">From</span>
            {fi("from.name", "Your business name *", "Your business name", cls="fi-strong", extra=' autocomplete="organization" data-req')}
            {fi("from.email", "Email", "Your email", "email", extra=' autocomplete="email"')}
            {ta("from.address", "Address", "Your address")}
            {fi("from.phone", "Phone", "Your phone", extra=' autocomplete="tel"')}
            {fi("from.taxId", "Tax / VAT ID (optional)", "Your tax number")}
          </div>
          <div class="party">
            <span class="sh-label">Bill to</span>
            <div class="client-pick" id="clientPick" hidden><select class="fi" id="clientSelect" aria-label="Choose a saved client"></select></div>
            {fi("to.name", "Client name *", "Client name", cls="fi-strong", extra=' data-req')}
            {fi("to.email", "Client email", "Client email", "email")}
            {ta("to.address", "Client address", "Client address")}
            {fi("to.phone", "Phone (optional)", "Client phone")}
          </div>
        </div>

        <div class="sh-items">
          <div class="items-head" aria-hidden="true"><span>Item</span><span>Qty</span><span>Rate</span><span>Amount</span><span></span></div>
          <div class="item-rows" id="itemRows"></div>
          <button type="button" class="add-line" id="addLine">{I(ICONS["plus"])} Add line item</button>
        </div>

        <div class="sh-bottom">
          <div class="sh-notes">
            <span class="sh-label">Notes</span>
            {ta("notes", "Payment details, bank account or a thank-you note", "Notes", 3)}
            <div class="note-chips" role="group" aria-label="Insert payment details">
              <button type="button" class="chip" data-insert="bank">+ Bank transfer</button>
              <button type="button" class="chip" data-insert="online">+ PayPal / Wise</button>
              <button type="button" class="chip" data-insert="link">+ Payment link</button>
            </div>
            <span class="sh-label">Terms</span>
            {ta("terms", "Payment terms", "Terms", 2)}
          </div>
          <div class="sh-totals" aria-live="polite">
            <div class="t-row"><span>Subtotal</span><b id="tSub"></b></div>
            <div class="t-row t-adj"><span>Discount</span><span class="t-in">{fi("discount", "0", "Discount", extra=' inputmode="decimal"')}<span class="seg seg-xs" role="group" aria-label="Discount type"><button type="button" data-disc="%">%</button><button type="button" data-disc="flat">Fixed</button></span></span><b id="tDisc"></b></div>
            <div class="t-row t-adj"><span class="t-tax">{fi("taxLabel", "Tax", "Tax name", cls="fi-label")}</span><span class="t-in">{fi("taxRate", "0", "Tax rate in percent", extra=' inputmode="decimal"')}<em>%</em></span><b id="tTax"></b></div>
            <div class="t-row t-adj"><span>Shipping</span><span class="t-in">{fi("shipping", "0", "Shipping", extra=' inputmode="decimal"')}</span><b id="tShip"></b></div>
            <div class="t-row t-total"><span>Total</span><b id="tTotal"></b></div>
            <div class="t-row t-adj"><span>Amount paid</span><span class="t-in">{fi("paid", "0", "Amount already paid", extra=' inputmode="decimal"')}</span><b id="tPaid"></b></div>
            <div class="t-row t-due"><span>Balance due</span><b id="tBal"></b></div>
          </div>
        </div>
      </div>
    </div>

    <aside class="side-panel" id="sidePanel" aria-label="Invoice options">
      <div class="sp-sheet-head"><span class="sp-grab" aria-hidden="true"></span><b>Invoice options</b><button type="button" class="btn btn-ink btn-sm" id="spClose">Done</button></div>
      <div class="sp-card sp-actions">
        <button class="btn btn-primary btn-lg btn-block" id="downloadBtn" type="button">{ICON_DL} Download PDF</button>
        <button class="btn btn-white btn-block" id="sendBtn" type="button">{ICON_SEND} Send by email</button>
        <div class="sp-row">
          <button class="sp-mini" id="saveBtn" type="button">{I(ICONS["save"])}<span>Save</span></button>
          <button class="sp-mini" id="previewBtn" type="button">{I(ICONS["eye"])}<span>Preview</span></button>
          <button class="sp-mini" id="printBtn" type="button">{I(ICONS["print"])}<span>Print</span></button>
          <button class="sp-mini" id="newBtn" type="button">{I(ICONS["plus"])}<span>New</span></button>
        </div>
        <p class="sp-note" id="cloudNote">Your draft is saved in this browser as you type.</p>
      </div>

      <div class="sp-card">
        <h2 class="sp-h" id="tplLabel">Design</h2>
        <div class="tpl-picker" id="tplPicker" role="group" aria-labelledby="tplLabel">{tpl_buttons}</div>
        <h2 class="sp-h" id="accentLabel">Colour</h2>
        <div class="swatches" id="swatches" role="group" aria-labelledby="accentLabel"></div>
      </div>

      <div class="sp-card">
        <label class="sp-field"><span class="sp-h">Currency</span><select class="in" id="currency"></select></label>
        <label class="sp-field"><span class="sp-h">Payment due</span>
          <select class="in" id="dueIn">
            <option value="">Custom date</option>
            <option value="0">On receipt</option>
            <option value="7">In 7 days</option>
            <option value="14">In 14 days</option>
            <option value="15">In 15 days</option>
            <option value="30">In 30 days</option>
          </select>
        </label>
        <label class="sp-field"><span class="sp-h">Status</span>
          <select class="in" id="status">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid (adds a PAID stamp)</option>
          </select>
        </label>
        <button type="button" class="link-btn sp-profile" id="profileBtn">{I(ICONS["user"])} Use my details on every new invoice</button>
      </div>
    </aside>
  </div>
</section>

<div class="sp-scrim" id="spScrim" hidden></div>
<nav class="mobile-bar" aria-label="Invoice actions">
  <button class="mb-btn" id="mOptions" type="button" aria-controls="sidePanel" aria-expanded="false">{I(ICONS["sliders"])}<span>Options</span></button>
  <button class="mb-btn" id="mSend" type="button">{ICON_SEND}<span>Send</span></button>
  <button class="btn btn-primary mb-main" id="mDownload" type="button">{ICON_DL} Download PDF</button>
</nav>

<dialog class="modal ready" id="pdfReady" aria-labelledby="readyTitle">
  <div class="modal-body">
    <span class="ready-ico" aria-hidden="true">{I(ICONS["check"])}</span>
    <h2 id="readyTitle">Your PDF is ready</h2>
    <p class="ready-name" id="readyName">invoice.pdf</p>
    <div class="ready-actions">
      <a class="btn btn-primary btn-lg btn-block" id="readySave" href="#" download>{ICON_DL} Save PDF</a>
      <a class="btn btn-white btn-block" id="readyOpen" href="#" target="_blank" rel="noopener">{I(ICONS["ext"])} Open PDF</a>
      <button class="btn btn-white btn-block" id="readyShare" type="button" hidden>{I(ICONS["share"])} Share or save to Files</button>
    </div>
    <p class="hint ready-hint" id="readyHint">On iPhone, tap Share, then Save to Files.</p>
  </div>
  <div class="modal-foot"><button class="btn btn-white" id="readyClose" type="button">Close</button></div>
</dialog>

<dialog class="modal" id="sendModal" aria-labelledby="sendTitle">
  <div class="modal-body">
    <h2 id="sendTitle">Email this invoice</h2>
    <p class="form-msg err" id="sendErr" hidden></p>
    <p class="form-msg ok" id="sendLoginNote" hidden><a id="sendLoginLink" href="/login/?signup=1&amp;next=%2F">Create a free account</a> to send from invoice-gen.net. Your invoice stays here while you sign up. Or use your own email app below.</p>
    <label class="f"><span class="f-label">Client's email</span><input class="in" id="sendTo" type="email" autocomplete="off" placeholder="client@company.com"></label>
    <label class="f"><span class="f-label">Subject</span><input class="in" id="sendSubject"></label>
    <label class="f"><span class="f-label">Message</span><textarea class="in" id="sendMsg" rows="6"></textarea></label>
    <label class="check-line"><input type="checkbox" id="sendCopy" checked> Send me a copy</label>
    <p class="hint">The invoice is attached as a PDF. When your client replies, it goes to your email.</p>
  </div>
  <div class="modal-foot">
    <button class="btn btn-white" id="sendCancel" type="button">Cancel</button>
    <button class="btn btn-white" id="sendMailApp" type="button">Use my email app</button>
    <button class="btn btn-primary" id="sendNow" type="button">{ICON_SEND} Send invoice</button>
  </div>
</dialog>

""" + f'''
<section class="band" id="how" aria-labelledby="how-title">
  <div class="wrap">
    <h2 id="how-title">How to make an invoice here</h2>
    <ol class="how">
      <li><b>Fill in the invoice</b><span>Type your business, your client and each item straight onto the page. Totals work themselves out.</span></li>
      <li><b>Choose a look</b><span>Pick Classic, Modern or Minimal and a colour. Add your logo if you have one.</span></li>
      <li><b>Download or send</b><span>Save the PDF, print it, or email it to your client with the PDF attached.</span></li>
    </ol>
  </div>
</section>

<section class="band band-line" id="features" aria-labelledby="features-title">
  <div class="wrap split-2">
    <div>
      <h2 id="features-title">What's included</h2>
      <p class="lede">Everything below is free. A few extras need a free account, because we save your work and send email for you.</p>
    </div>
    <dl class="feat">
      <div><dt>PDF download</dt><dd>A clean A4 PDF with your logo. No watermark.</dd></div>
      <div><dt>Three designs</dt><dd>Classic, Modern and Minimal, each in six colours.</dd></div>
      <div><dt>28 currencies</dt><dd>US Dollar, Euro, Pound, Canadian and Australian Dollar, Yen and more, formatted correctly.</dd></div>
      <div><dt>Tax, discount, shipping</dt><dd>Name your own tax, give a percent or fixed discount, record part payments.</dd></div>
      <div><dt>Quotation, receipt, proforma</dt><dd>Change the title at the top of the page and the PDF follows.</dd></div>
      <div><dt>Email to clients <em>free account</em></dt><dd>The PDF goes as an attachment, replies come to your inbox.</dd></div>
      <div><dt>Saved invoices and clients <em>free account</em></dt><dd>Every invoice kept, clients ready to pick next time.</dd></div>
      <div><dt>Paid and overdue tracking <em>free account</em></dt><dd>See what's been invoiced, paid and still owed.</dd></div>
    </dl>
  </div>
</section>

<section class="band band-line" aria-labelledby="acct-title">
  <div class="wrap split-2 acct">
    <div>
      <h2 id="acct-title">Keep every invoice in one place</h2>
      <p class="lede">With a free account, invoices are saved as you work. Your dashboard shows what's paid, what's outstanding and what's overdue, and keeps a list of your clients.</p>
      <div class="row-btns">
        <a class="btn btn-dark" href="/login/?signup=1">Create free account</a>
        <a class="btn btn-line" href="/login/">Log in</a>
      </div>
    </div>
    <div class="ledger" aria-hidden="true">
      <div class="lg-head"><span>Invoice</span><span>Client</span><span>Amount</span><span>Status</span></div>
      <div><span>INV-0044</span><span>Orbit Labs</span><span>$980.00</span><span class="st st-draft">Draft</span></div>
      <div><span>INV-0043</span><span>Northwind</span><span>$1,900.00</span><span class="st st-sent">Sent</span></div>
      <div><span>INV-0041</span><span>Green Leaf Cafe</span><span>$360.00</span><span class="st st-over">Overdue</span></div>
      <div><span>INV-0040</span><span>Acme Ltd</span><span>$1,250.00</span><span class="st st-paid">Paid</span></div>
    </div>
  </div>
</section>

<section class="band band-line" aria-labelledby="faq">
  <div class="wrap split-2">
    <div>
      <h2 id="faq">Questions</h2>
      <p class="lede">Something else? Email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
    </div>
    <div class="faq">
{faq_html}
    </div>
  </div>
</section>

<section class="band band-line" aria-labelledby="guides">
  <div class="wrap">
    <h2 id="guides">Guides</h2>
    <ul class="guides">
      <li><a href="/how-to-make-an-invoice/"><b>How to make an invoice</b><span>What to include, with a checklist.</span></a></li>
      <li><a href="/invoice-template/"><b>Invoice templates</b><span>Free templates you can fill in online.</span></a></li>
      <li><a href="/freelance-invoice/"><b>Freelance invoices</b><span>Hourly or project billing, and getting paid on time.</span></a></li>
    </ul>
  </div>
</section>
'''
