# Home page markup for invoice-gen.net (imported by build_pages.py)
# Concept: an accountant's desk. Ledger paper, a self-typing invoice, a rubber
# stamp, a till receipt for "how it works", and an itemised list of features.

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
    "arrow": '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    "down": '<path d="M12 5v14m-6-6 6 6 6-6"/>',
    "user": '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
}

def mini(t):
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
    ("classic", "Classic", "Colour bar on top, filled table header. Fits any business."),
    ("modern", "Modern", "A bold colour band carrying your logo and details."),
    ("minimal", "Minimal", "Fine rules and generous white space. Quiet and exact."),
]

INCLUDED = [
    ("PDF download", "Clean A4 PDF with your logo, ready to print or attach.", "Included"),
    ("Three invoice designs", "Classic, Modern and Minimal, each in six colours.", "Included"),
    ("28 currencies", "Taka, US Dollar, Euro, Pound, Rupee, Dirham and more.", "Included"),
    ("Tax, discount, shipping", "Name your own tax (VAT, GST), percent or fixed discounts.", "Included"),
    ("Part payments and Paid stamp", "Record what's been paid; the balance updates itself.", "Included"),
    ("Email invoices to clients", "PDF attached, replies come to your inbox.", "Free account"),
    ("Saved invoices and clients", "Every invoice kept, clients ready to pick.", "Free account"),
    ("Paid and overdue tracking", "See what's invoiced, paid and still owed.", "Free account"),
]

def build(FAQ, ICON_DL, ICON_SEND):
    tpl_buttons = "".join(
        f'<button type="button" class="tpl-btn" data-template="{k}" aria-pressed="false">'
        f'<span class="tpl-thumb t-{k}" aria-hidden="true"><i></i><i></i><i></i></span><span>{n}</span></button>'
        for k, n, _ in TEMPLATES)
    fan = "".join(f'''
        <figure class="fan-item fan-{i}">
          <button type="button" class="fan-sheet" data-use-template="{k}" aria-label="Use the {n} design">
            {mini(k)}
          </button>
          <figcaption><b>{n}</b><span>{d}</span></figcaption>
        </figure>''' for i, (k, n, d) in enumerate(TEMPLATES))
    included = "".join(f'''
            <tr><td><b>{a}</b><span>{b}</span></td><td><span class="tag{' tag-acc' if c != 'Included' else ''}">{c}</span></td></tr>'''
                       for a, b, c in INCLUDED)
    faq_html = "\n".join(f'        <details class="qa"><summary>{q}</summary><div class="qa-body"><p>{a}</p></div></details>' for q, a in FAQ)

    return f'''<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <h1 id="hero-title"><span class="eyebrow-stamp">Free invoice generator</span> Invoices that look as good as your work.</h1>
      <p class="hero-lede">Type on a real-looking invoice, pick one of three designs, then download the PDF or email it to your client. No sign-up, no watermark, 28 currencies.</p>
      <div class="hero-cta">
        <a class="btn btn-ink btn-lg" href="#create">Start your invoice {I(ICONS["down"])}</a>
        <a class="link-under" href="#designs">See the three designs</a>
      </div>
    </div>

    <div class="demo-wrap reveal">
      <div class="demo" id="demo" aria-hidden="true">
        <div class="demo-sheet">
          <div class="demo-top">
            <span class="demo-logo">AS</span>
            <div class="demo-title"><b>Invoice</b><span data-type>INV-0042</span></div>
          </div>
          <div class="demo-parties">
            <div><small>From</small><b data-type>Arshaon Studio</b><span data-type>Dhanmondi, Dhaka</span></div>
            <div><small>Bill to</small><b data-type>Acme Ltd</b><span data-type>Baker Street, London</span></div>
          </div>
          <div class="demo-items">
            <div class="d-row d-head"><span>Description</span><span>Qty</span><span>Amount</span></div>
            <div class="d-row" data-row><span data-type>Brand identity design</span><span>1</span><span data-amt="900">$900.00</span></div>
            <div class="d-row" data-row><span data-type>Landing page design</span><span>1</span><span data-amt="250">$250.00</span></div>
            <div class="d-row" data-row><span data-type>Social media kit</span><span>2</span><span data-amt="100">$100.00</span></div>
          </div>
          <div class="demo-total"><span>Balance due</span><b data-count="1250">$1,250.00</b></div>
          <div class="demo-stamp">Sent</div>
        </div>
        <p class="demo-note">Example invoice</p>
      </div>
    </div>
  </div>
  <ul class="hero-strip wrap" aria-label="What you get">
    <li><b>$0</b><span>free, for good</span></li>
    <li><b>3</b><span>invoice designs</span></li>
    <li><b>28</b><span>currencies</span></li>
    <li><b>A4</b><span>PDF, print ready</span></li>
  </ul>
</section>

<section class="desk" id="create" aria-labelledby="create-title">
  <div class="wrap">
    <div class="desk-head">
      <div>
        <h2 id="create-title">Your invoice</h2>
        <p class="ws-note" id="cloudNote">Your draft is kept in this browser.</p>
      </div>
      <button class="btn btn-paper btn-sm" id="profileBtn" type="button">{I(ICONS["user"])} Save my details for next time</button>
    </div>

    <div class="tray" role="toolbar" aria-label="Invoice design and actions">
      <div class="tray-group">
        <span class="tray-label" id="tplLabel">Design</span>
        <div class="tpl-picker" id="tplPicker" role="group" aria-labelledby="tplLabel">{tpl_buttons}</div>
      </div>
      <div class="tray-group">
        <span class="tray-label" id="accentLabel">Colour</span>
        <div class="swatches" id="swatches" role="group" aria-labelledby="accentLabel"></div>
      </div>
      <div class="tray-group tray-selects">
        <label class="tray-field"><span class="tray-label">Currency</span><select class="tray-select" id="currency"></select></label>
        <label class="tray-field"><span class="tray-label">Status</span>
          <select class="tray-select" id="status">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid (adds stamp)</option>
          </select>
        </label>
      </div>
      <div class="tray-actions">
        <button class="tray-btn" id="newBtn" type="button" title="Start a new invoice">{I(ICONS["plus"])}<span>New</span></button>
        <button class="tray-btn" id="saveBtn" type="button" title="Save to your account">{I(ICONS["save"])}<span>Save</span></button>
        <button class="tray-btn" id="printBtn" type="button" title="Print">{I(ICONS["print"])}<span>Print</span></button>
        <button class="btn btn-paper" id="sendBtn" type="button">{ICON_SEND} Send</button>
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
  <button class="btn btn-paper" id="mSend" type="button">{ICON_SEND} Send</button>
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

<section class="band" id="designs" aria-labelledby="designs-title">
  <div class="wrap">
    <div class="band-head reveal">
      <h2 id="designs-title">Three designs. Pick one, switch any time.</h2>
      <p class="lede">Tap a sheet to use it. Each one comes in six colours and gives you the same crisp A4 PDF.</p>
    </div>
    <div class="fan reveal">{fan}
    </div>
  </div>
</section>

<section class="band band-ruled" aria-labelledby="how">
  <div class="wrap how-grid">
    <div class="how-copy reveal">
      <h2 id="how">How it works, itemised.</h2>
      <p class="lede">Three steps from blank page to a PDF in your client's inbox. The maths is done for you as you type.</p>
      <a class="link-under" href="#create">Try it on the invoice above</a>
    </div>
    <div class="receipt reveal" role="group" aria-label="How it works">
      <div class="r-head">
        <b>invoice-gen.net</b>
        <span>How it works</span>
      </div>
      <ol class="r-lines">
        <li><div class="r-line"><span>Fill in the invoice</span><i></i><span>1 min</span></div><p>Click any line and type your business, your client, then each item with its quantity and rate.</p></li>
        <li><div class="r-line"><span>Check the totals</span><i></i><span>30 sec</span></div><p>Add tax or VAT, a discount, shipping or a part payment. Totals update as you type.</p></li>
        <li><div class="r-line"><span>Download or send</span><i></i><span>10 sec</span></div><p>Save a clean A4 PDF, print it, or email it with the PDF attached.</p></li>
      </ol>
      <div class="r-sum"><span>Total time</span><span>under 2 min</span></div>
      <div class="r-sum r-grand"><span>Amount to pay</span><span>$0.00</span></div>
      <div class="r-barcode" aria-hidden="true"></div>
      <p class="r-thanks">Thank you, come again</p>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="included-title">
  <div class="wrap inc-grid">
    <div class="reveal">
      <h2 id="included-title">What's included</h2>
      <p class="lede">Everything paid invoicing apps charge for. Some extras need a free account so we can save your work and send email for you.</p>
    </div>
    <div class="inc-sheet reveal">
      <table class="included">
        <thead><tr><th scope="col">Item</th><th scope="col">Price</th></tr></thead>
        <tbody>{included}
        </tbody>
        <tfoot><tr><td>Total</td><td><span class="free-stamp">Free</span></td></tr></tfoot>
      </table>
    </div>
  </div>
</section>

<section class="band band-ruled" aria-labelledby="client-view">
  <div class="wrap showcase">
    <div class="showcase-copy reveal">
      <h2 id="client-view">What lands in your client's inbox</h2>
      <p class="lede">A short, clear email with the invoice attached as a PDF. Your business name is on it, and when your client presses Reply, it comes straight back to you.</p>
    </div>
    <figure class="mail reveal" aria-label="Example of the email your client receives">
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

<section class="band" aria-labelledby="faq">
  <div class="wrap faq-grid">
    <div class="reveal">
      <h2 id="faq">Questions people ask</h2>
      <p class="lede">Anything else? Write to <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
    </div>
    <div class="faq reveal">
{faq_html}
    </div>
  </div>
</section>

<section class="band band-ruled" aria-labelledby="guides">
  <div class="wrap">
    <div class="band-head reveal"><h2 id="guides">Guides for getting paid</h2></div>
    <div class="guide-links reveal">
      <a href="/how-to-make-an-invoice/"><span class="g-no">Guide</span><strong>How to make an invoice</strong><span>What to include, with a checklist you can follow.</span><em>Read {I(ICONS["arrow"])}</em></a>
      <a href="/invoice-template/"><span class="g-no">Templates</span><strong>Invoice templates</strong><span>Free templates you can fill in online.</span><em>Read {I(ICONS["arrow"])}</em></a>
      <a href="/freelance-invoice/"><span class="g-no">Freelancers</span><strong>Freelance invoices</strong><span>Billing hourly or by project, and getting paid on time.</span><em>Read {I(ICONS["arrow"])}</em></a>
    </div>
  </div>
</section>

<section class="ticket-band" aria-labelledby="final-title">
  <div class="wrap">
    <div class="ticket reveal">
      <div class="ticket-main">
        <p class="ticket-kicker">Ready when you are</p>
        <h2 id="final-title">Your next invoice is two minutes away.</h2>
      </div>
      <div class="ticket-stub">
        <a class="btn btn-primary btn-lg" href="#create">Start your invoice</a>
        <span>Free. No sign-up.</span>
      </div>
    </div>
  </div>
</section>
'''
