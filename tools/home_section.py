# Home page markup for invoice-gen.net (imported by build_pages.py)

def I(path, cls="ico"):
    return ('<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>')

ICONS = {
    "download": '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',
    "send": '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "save": '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    "print": '<path d="M7 8V4h10v4M7 17H5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    "file": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    "percent": '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    "palette": '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.3-.6-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.9-4-8.8-9-8.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.8" r="1"/>',
    "lock": '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    "arrow": '<path d="M5 12h14m-5-5 5 5-5 5"/>',
}

def mini(t, label):
    """Small CSS drawing of an invoice in one of the three designs."""
    return f'''<div class="mini t-{t}" aria-hidden="true">
          <div class="mini-top"><span class="mini-logo"></span><span class="mini-title">Invoice</span></div>
          <div class="mini-parties"><span></span><span></span></div>
          <div class="mini-head"></div>
          <div class="mini-row"><span></span><i></i></div>
          <div class="mini-row"><span></span><i></i></div>
          <div class="mini-row"><span></span><i></i></div>
          <div class="mini-total"><span>Balance due</span><b>$1,250</b></div>
        </div>'''

TEMPLATES = [
    ("classic", "Classic", "Colour bar on top and a filled table header. Works for any business."),
    ("modern", "Modern", "A bold colour band with your logo and invoice details. Stands out in an inbox."),
    ("minimal", "Minimal", "Fine lines and lots of white space. Calm and elegant for studios and consultants."),
]

def build(FAQ, ICON_DL, ICON_SEND):
    tpl_buttons = "".join(
        f'<button type="button" class="tpl-btn" data-template="{k}" aria-pressed="false" title="{n} design">'
        f'<span class="tpl-thumb t-{k}" aria-hidden="true"><i></i><i></i><i></i></span><span>{n}</span></button>'
        for k, n, _ in TEMPLATES)
    tpl_cards = "".join(f'''
      <article class="tpl-card">
        {mini(k, n)}
        <div class="tpl-card-body">
          <h3>{n}</h3>
          <p>{d}</p>
          <button type="button" class="btn btn-ghost btn-sm" data-use-template="{k}">Use {n}</button>
        </div>
      </article>''' for k, n, d in TEMPLATES)
    faq_html = "\n".join(f"        <details><summary>{q}</summary><p>{a}</p></details>" for q, a in FAQ)

    features = [
        ("mail", "Email invoices to clients", "Send the PDF straight from invoice-gen.net. Replies come to your own inbox, and the invoice is marked as sent."),
        ("file", "Clean A4 PDF", "Your logo, colours and totals on a crisp A4 page. Opens in every email app and prints cleanly."),
        ("palette", "Three invoice designs", "Classic, Modern or Minimal, each in six colours. Pick the look that fits your business."),
        ("globe", "28 currencies", "Bill in US Dollars, Taka, Euros, Pounds, Rupees, Dirhams and more, formatted correctly."),
        ("percent", "Tax, discounts and part payments", "Name your tax (VAT, GST, Sales tax), give a discount, add shipping and record what's already paid."),
        ("chart", "Track who has paid", "With a free account, see what you've invoiced, what's paid and what's still owed. Overdue invoices are flagged."),
    ]
    feat_html = "".join(f'''
      <div class="feature">
        <span class="feature-icon">{I(ICONS[i])}</span>
        <h3>{h}</h3>
        <p>{p}</p>
      </div>''' for i, h, p in features)

    return f'''<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-pill">{I(ICONS["check"])} Free to use. No sign-up needed.</p>
      <h1 id="hero-title">Create professional invoices in minutes</h1>
      <p class="hero-lede">Fill in a polished invoice, download it as a PDF, or email it straight to your client. Made for freelancers and small businesses, in 28 currencies.</p>
      <div class="hero-cta">
        <a class="btn btn-primary btn-lg" href="#create">Create your invoice {I(ICONS["arrow"])}</a>
        <a class="btn btn-glass btn-lg" href="#templates">See the designs</a>
      </div>
      <ul class="hero-facts">
        <li>{I(ICONS["file"])} PDF download</li>
        <li>{I(ICONS["mail"])} Email to clients</li>
        <li>{I(ICONS["lock"])} Private by default</li>
      </ul>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="mock mock-back"></div>
      <div class="mock mock-front">
        <span class="mock-tag">Example</span>
        <div class="m-top">
          <span class="m-logo">AS</span>
          <div class="m-title"><b>Invoice</b><span>INV-0042</span></div>
        </div>
        <div class="m-parties">
          <div><small>From</small><b>Arshaon Studio</b><span>Dhaka, Bangladesh</span></div>
          <div><small>Bill to</small><b>Acme Ltd</b><span>London, United Kingdom</span></div>
        </div>
        <div class="m-items">
          <div class="m-row m-head"><span>Description</span><span>Qty</span><span>Amount</span></div>
          <div class="m-row"><span>Brand identity design</span><span>1</span><span>$900.00</span></div>
          <div class="m-row"><span>Landing page design</span><span>1</span><span>$250.00</span></div>
          <div class="m-row"><span>Social media kit</span><span>2</span><span>$100.00</span></div>
        </div>
        <div class="m-total"><span>Balance due</span><b>$1,250.00</b></div>
      </div>
      <div class="chip chip-sent">{I(ICONS["check"])}<span><b>Invoice sent</b>accounts@acme.com</span></div>
      <div class="chip chip-pdf"><span class="pdf-badge">PDF</span><span><b>INV-0042-Acme.pdf</b>Ready to download</span></div>
    </div>
  </div>
</section>

<section class="workspace" id="create" aria-labelledby="create-title">
  <div class="wrap">
    <div class="ws-head">
      <div>
        <h2 id="create-title">Your invoice</h2>
        <p class="ws-note" id="cloudNote">Your draft is kept in this browser.</p>
      </div>
      <button class="btn btn-ghost btn-sm" id="profileBtn" type="button">{I(ICONS["save"])} Save my details for next time</button>
    </div>

    <div class="toolbar" role="toolbar" aria-label="Invoice design and actions">
      <div class="tb-group">
        <span class="tb-label" id="tplLabel">Design</span>
        <div class="tpl-picker" id="tplPicker" role="group" aria-labelledby="tplLabel">{tpl_buttons}</div>
      </div>
      <div class="tb-group">
        <span class="tb-label" id="accentLabel">Colour</span>
        <div class="swatches" id="swatches" role="group" aria-labelledby="accentLabel"></div>
      </div>
      <div class="tb-group tb-selects">
        <label class="tb-field"><span class="tb-label">Currency</span><select class="input input-sm" id="currency"></select></label>
        <label class="tb-field"><span class="tb-label">Status</span>
          <select class="input input-sm" id="status">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid (adds stamp)</option>
          </select>
        </label>
      </div>
      <div class="tb-actions">
        <button class="btn btn-ghost btn-icon" id="newBtn" type="button" title="New invoice">{I(ICONS["plus"])}<span>New</span></button>
        <button class="btn btn-ghost btn-icon" id="saveBtn" type="button" title="Save">{I(ICONS["save"])}<span>Save</span></button>
        <button class="btn btn-ghost btn-icon" id="printBtn" type="button" title="Print">{I(ICONS["print"])}<span>Print</span></button>
        <button class="btn btn-ink" id="sendBtn" type="button">{ICON_SEND} Send</button>
        <button class="btn btn-primary" id="downloadBtn" type="button">{ICON_DL} Download PDF</button>
      </div>
    </div>

    <div class="sheet-wrap">
      <div class="sheet t-classic" id="sheet">
        <div class="stamp" id="stamp" aria-hidden="true">Ready</div>
        <div class="sheet-top">
          <div class="logo-drop" id="logoDrop" role="button" tabindex="0" aria-label="Add your logo">
            <span id="logoHint">+ Add your logo<br><small>PNG or JPG</small></span>
            <img id="logoImg" alt="Your logo" hidden>
            <button type="button" class="logo-remove" id="logoRemove" aria-label="Remove logo">&times;</button>
            <input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden>
          </div>
          <div class="doc-title">
            <input class="title" data-f="title" aria-label="Document title" placeholder="Invoice">
            <div class="meta">
              <label for="f-number">Invoice no.</label><input id="f-number" data-f="number" autocomplete="off">
              <label for="f-issue">Issue date</label><input type="date" id="f-issue" data-f="issueDate">
              <label for="f-due">Due date</label><input type="date" id="f-due" data-f="dueDate">
              <label for="f-po">PO / reference</label><input id="f-po" data-f="poNumber" placeholder="Optional">
            </div>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h3>From</h3>
            <input class="name" data-f="from.name" placeholder="Your business name" aria-label="Your business name" autocomplete="organization">
            <textarea rows="2" data-f="from.address" placeholder="Street, city, country" aria-label="Your address"></textarea>
            <input type="email" data-f="from.email" placeholder="you@business.com" aria-label="Your email" autocomplete="email">
            <input data-f="from.phone" placeholder="Phone" aria-label="Your phone" autocomplete="tel">
            <input data-f="from.taxId" placeholder="Tax, VAT or BIN number (optional)" aria-label="Your tax number">
          </div>
          <div class="party">
            <h3>Bill to</h3>
            <div class="client-pick" id="clientPick" hidden><select id="clientSelect" aria-label="Choose a saved client"></select></div>
            <input class="name" data-f="to.name" placeholder="Client or company name" aria-label="Client name">
            <textarea rows="2" data-f="to.address" placeholder="Client address" aria-label="Client address"></textarea>
            <input type="email" data-f="to.email" placeholder="client@company.com" aria-label="Client email">
            <input data-f="to.phone" placeholder="Phone (optional)" aria-label="Client phone">
          </div>
        </div>

        <div class="items-wrap">
          <table class="items">
            <colgroup><col><col class="c-qty"><col class="c-rate"><col class="c-amt"><col class="c-x"></colgroup>
            <thead><tr><th scope="col">Description</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Rate</th><th scope="col" class="num">Amount</th><th scope="col"><span class="sr-only">Remove</span></th></tr></thead>
            <tbody id="itemRows"></tbody>
          </table>
        </div>
        <button type="button" class="add-line" id="addLine">+ Add line item</button>

        <div class="lower">
          <div class="notes">
            <h3>Notes</h3>
            <textarea rows="2" data-f="notes" placeholder="Bank details, payment instructions or a thank-you note" aria-label="Notes"></textarea>
            <h3>Terms</h3>
            <textarea rows="2" data-f="terms" aria-label="Terms"></textarea>
          </div>
          <div class="totals" aria-live="polite">
            <div class="t-row"><span class="t-label">Subtotal</span><span id="tSub"></span></div>
            <div class="t-row adjust"><span class="t-label">Discount</span><input data-f="discount" inputmode="decimal" placeholder="0" aria-label="Discount"><select data-f="discountType" aria-label="Discount type"><option value="%">%</option><option value="flat">flat</option></select><span id="tDisc"></span></div>
            <div class="t-row adjust"><input class="t-label" data-f="taxLabel" aria-label="Tax name"><input data-f="taxRate" inputmode="decimal" placeholder="0" aria-label="Tax rate in percent"><span class="t-label">%</span><span id="tTax"></span></div>
            <div class="t-row adjust"><span class="t-label">Shipping</span><input data-f="shipping" inputmode="decimal" placeholder="0" aria-label="Shipping"><span></span><span id="tShip"></span></div>
            <div class="t-row grand"><span>Total</span><span id="tTotal"></span></div>
            <div class="t-row adjust"><span class="t-label">Amount paid</span><input data-f="paid" inputmode="decimal" placeholder="0" aria-label="Amount already paid"><span></span><span id="tPaid"></span></div>
            <div class="t-row due"><span>Balance due</span><span id="tBal"></span></div>
          </div>
        </div>
        <div class="sheet-foot"><span>Made with invoice-gen.net</span></div>
      </div>
    </div>
  </div>
</section>

<div class="mobile-bar" role="region" aria-label="Invoice actions">
  <button class="btn btn-ink" id="mSend" type="button">{ICON_SEND} Send</button>
  <button class="btn btn-primary" id="mDownload" type="button">{ICON_DL} Download PDF</button>
</div>

<dialog class="modal" id="sendModal" aria-labelledby="sendTitle">
  <div class="modal-body">
    <h2 id="sendTitle">Email this invoice</h2>
    <p class="form-msg err" id="sendErr" hidden></p>
    <p class="form-msg ok" id="sendLoginNote" hidden><a id="sendLoginLink" href="/login/?signup=1&amp;next=%2F">Create a free account</a> to send from invoice-gen.net. Your invoice stays here while you sign up. Or use your own email app below.</p>
    <div class="field"><label for="sendTo">Client's email</label><input class="input" id="sendTo" type="email" autocomplete="off" placeholder="client@company.com"></div>
    <div class="field"><label for="sendSubject">Subject</label><input class="input" id="sendSubject"></div>
    <div class="field"><label for="sendMsg">Message</label><textarea class="input" id="sendMsg" rows="6"></textarea></div>
    <label class="check-line"><input type="checkbox" id="sendCopy" checked> Send me a copy</label>
    <p class="hint">The invoice is attached as a PDF. When your client replies, it goes to your email.</p>
  </div>
  <div class="modal-foot">
    <button class="btn btn-ghost" id="sendCancel" type="button">Cancel</button>
    <button class="btn btn-ghost" id="sendMailApp" type="button">Use my email app</button>
    <button class="btn btn-primary" id="sendNow" type="button">{ICON_SEND} Send invoice</button>
  </div>
</dialog>

<section class="band" id="templates" aria-labelledby="tpl-title">
  <div class="wrap">
    <div class="band-head">
      <h2 id="tpl-title">Three designs, six colours</h2>
      <p class="lede">Every design gives you the same clean A4 PDF. Pick one, and switch any time while you work.</p>
    </div>
    <div class="tpl-gallery">{tpl_cards}
    </div>
  </div>
</section>

<section class="band band-white" aria-labelledby="how">
  <div class="wrap">
    <div class="band-head">
      <h2 id="how">Make an invoice in three steps</h2>
      <p class="lede">It works like filling in a paper invoice, except the maths is done for you.</p>
    </div>
    <ol class="steps">
      <li><h3>Fill in the invoice</h3><p>Click any line and type: your business, your client, then each item or service with its quantity and rate.</p></li>
      <li><h3>Check the totals</h3><p>Add tax or VAT, a discount, shipping or a part payment. The total and balance due update as you type.</p></li>
      <li><h3>Download or send</h3><p>Download a clean A4 PDF, print it, or email it to your client with the PDF attached.</p></li>
    </ol>
  </div>
</section>

<section class="band" aria-labelledby="client-view">
  <div class="wrap showcase">
    <div class="showcase-copy">
      <h2 id="client-view">What your client receives</h2>
      <p class="lede">A short, clear email with your invoice attached as a PDF. It shows your business name, and when your client presses Reply, the answer goes to your own inbox.</p>
      <ul class="trust">
        <li>Your name in the From line</li>
        <li>Replies go straight to you</li>
        <li>Invoice marked as sent in your dashboard</li>
      </ul>
    </div>
    <figure class="mail" aria-label="Example of the email your client receives">
      <div class="mail-bar"><span></span><span></span><span></span></div>
      <div class="mail-head">
        <div class="mail-row"><span>From</span><strong>Arshaon Studio via invoice-gen.net</strong></div>
        <div class="mail-row"><span>To</span>accounts@acme.com</div>
        <div class="mail-row"><span>Subject</span><strong>Invoice INV-0042 from Arshaon Studio</strong></div>
      </div>
      <div class="mail-body">
        <p>Hi Acme team,</p>
        <p>Please find attached invoice INV-0042 for $1,250.00, due on 22 Oct 2026.</p>
        <p>Thank you,<br>Arshaon Studio</p>
        <div class="attachment">
          <span class="pdf-badge" aria-hidden="true">PDF</span>
          <span><strong>INV-0042-Acme.pdf</strong><small>A4 invoice, 1 page</small></span>
        </div>
      </div>
      <figcaption>Example email</figcaption>
    </figure>
  </div>
</section>

<section class="band band-white" aria-labelledby="features">
  <div class="wrap">
    <div class="band-head">
      <h2 id="features">Everything a professional invoice needs</h2>
      <p class="lede">The tools you'd expect from paid invoicing software, free in your browser.</p>
    </div>
    <div class="feature-grid">{feat_html}
    </div>
  </div>
</section>

<section class="band" aria-labelledby="faq">
  <div class="wrap faq-grid">
    <div>
      <h2 id="faq">Questions</h2>
      <p class="lede">Can't find your answer? Email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
    </div>
    <div class="faq">
{faq_html}
    </div>
  </div>
</section>

<section class="band band-white" aria-labelledby="guides">
  <div class="wrap">
    <div class="band-head"><h2 id="guides">Invoice guides</h2></div>
    <div class="guide-links">
      <a href="/how-to-make-an-invoice/"><strong>How to make an invoice</strong><span>What to include, with a checklist you can follow.</span><em>Read the guide {I(ICONS["arrow"])}</em></a>
      <a href="/invoice-template/"><strong>Invoice templates</strong><span>Free invoice templates you can fill in online.</span><em>See templates {I(ICONS["arrow"])}</em></a>
      <a href="/freelance-invoice/"><strong>Freelance invoices</strong><span>Billing hourly or by project, and getting paid on time.</span><em>Read the guide {I(ICONS["arrow"])}</em></a>
    </div>
  </div>
</section>

<section class="final-cta" aria-labelledby="final-title">
  <div class="wrap final-inner">
    <div>
      <h2 id="final-title">Your next invoice is two minutes away</h2>
      <p>Free, no sign-up needed. Download the PDF or email it to your client.</p>
    </div>
    <a class="btn btn-primary btn-lg" href="#create">Create your invoice {I(ICONS["arrow"])}</a>
  </div>
</section>
'''
