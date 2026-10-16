# Invoice-related calculators (imported by build_pages.py). The maths runs in assets/js/calc.js.
# Each: path, name, card, title, description, h1, lead, form, results, body (html), faq, invoice link text

def num(id_, label, value="", hint="", suffix="", attrs=""):
    suf = f'<em class="cf-suf">{suffix}</em>' if suffix else ""
    h = f'<small class="cf-hint">{hint}</small>' if hint else ""
    hid = " hidden" if "hidden" in attrs else ""
    attrs = attrs.replace(" hidden", "")
    return f'<label class="cf"{hid}><span class="cf-l">{label}</span><span class="cf-in"><input class="in" id="{id_}" inputmode="decimal" value="{value}" autocomplete="off"{attrs}>{suf}</span>{h}</label>'

def sel(id_, label, options, hint=""):
    o = "".join(f'<option value="{v}">{t}</option>' for v, t in options)
    h = f'<small class="cf-hint">{hint}</small>' if hint else ""
    return f'<label class="cf"><span class="cf-l">{label}</span><select class="in" id="{id_}">{o}</select>{h}</label>'

def seg(id_, label, options):
    b = "".join(f'<button type="button" data-v="{v}" aria-pressed="{"true" if i == 0 else "false"}">{t}</button>' for i, (v, t) in enumerate(options))
    return f'<div class="cf"><span class="cf-l">{label}</span><div class="seg seg-full" id="{id_}" role="group" aria-label="{label}">{b}</div></div>'

def out(rows, big):
    r = "".join(f'<div class="co-row"><span>{t}</span><b id="{i}">–</b></div>' for i, t in rows)
    return f'<div class="co-big"><span id="{big[0]}L">{big[1]}</span><b id="{big[0]}">–</b></div>{r}'

VAT_RATES = [("20", "UK 20%"), ("19", "Germany 19%"), ("20", "France 20%"), ("21", "Spain / Netherlands 21%"), ("22", "Italy 22%"),
             ("23", "Ireland 23%"), ("5", "UAE 5%"), ("15", "Saudi Arabia / South Africa 15%"), ("5", "UK reduced 5%"), ("custom", "Other rate")]
GST_RATES = [("10", "Australia 10%"), ("15", "New Zealand 15%"), ("18", "India 18%"), ("5", "India 5% / Canada GST 5%"), ("40", "India 40%"),
             ("9", "Singapore 9%"), ("13", "Canada HST Ontario 13%"), ("custom", "Other rate")]

CALCS = [
    dict(key="vat", path="/vat-calculator/", name="VAT calculator", card="Add or remove VAT from any price.",
         title="VAT Calculator: Add or Remove VAT (UK 20% and EU Rates) | invoice-gen.net",
         desc="Free VAT calculator. Add VAT to a net price or remove VAT from a gross price at 20%, 5% or any EU rate. See the net, VAT and gross amounts instantly.",
         h1="VAT calculator", lead="Add VAT to a price, or take VAT out of a price that already includes it. Works for UK 20%, EU rates and any custom rate.",
         form=seg("vMode", "What do you want to do?", [("add", "Add VAT"), ("remove", "Remove VAT")]) +
              num("vAmount", "Amount", "1000") + sel("vRate", "VAT rate", VAT_RATES) + num("vCustom", "Your rate", "20", suffix="%", attrs=" hidden"),
         results=out([("vNet", "Net (before VAT)"), ("vVat", "VAT"), ("vGross", "Gross (with VAT)")], ("vMain", "Total with VAT")),
         body="""<h2>How VAT is worked out</h2>
<p><b>Adding VAT:</b> multiply the net price by the rate. At 20%, VAT on 1,000 is 1,000 × 0.20 = 200, so the gross price is 1,200.</p>
<p><b>Removing VAT:</b> divide the gross price by 1 plus the rate. At 20%, 1,200 ÷ 1.20 = 1,000 net, and the VAT is 200. A common mistake is taking 20% off 1,200, which gives 960 and is wrong.</p>
<h2>VAT on your invoices</h2>
<p>If you are VAT registered, a VAT invoice shows the net amount, the VAT rate, the VAT amount and the total. The <a href="/uk-invoice-template/">UK invoice template</a> and <a href="/eu-vat-invoice/">EU VAT invoice</a> do this for you, including the reverse charge note for business clients abroad.</p>""",
         faq=[("How do I add 20% VAT?", "Multiply the price by 1.2. For example 250 × 1.2 = 300, which is 250 plus 50 VAT."),
              ("How do I remove 20% VAT from a price?", "Divide the price by 1.2. For example 300 ÷ 1.2 = 250 net, and the VAT is 50."),
              ("What are the UK VAT rates?", "Standard 20%, reduced 5% and zero rate 0%. Some goods and services are exempt."),
              ("Is the result rounded?", "Yes, to 2 decimal places, the way amounts appear on an invoice.")],
         cta="Make a VAT invoice", cta_href="/uk-invoice-template/"),
    dict(key="gst", path="/gst-calculator/", name="GST calculator", card="GST inclusive or exclusive, with CGST and SGST.",
         title="GST Calculator: Add or Remove GST (Australia, NZ, India) | invoice-gen.net",
         desc="Free GST calculator for Australia (10%), New Zealand (15%), India (5%, 18%, 40%) and more. Add or remove GST and see the CGST and SGST split.",
         h1="GST calculator", lead="Add GST to a price or work out the GST inside a GST-inclusive price. For India, it also splits the tax into CGST and SGST.",
         form=seg("gMode", "What do you want to do?", [("add", "Add GST"), ("remove", "Remove GST")]) +
              num("gAmount", "Amount", "1000") + sel("gRate", "GST rate", GST_RATES) + num("gCustom", "Your rate", "10", suffix="%", attrs=" hidden"),
         results=out([("gNet", "Price before GST"), ("gTax", "GST"), ("gHalf", "CGST + SGST (half each)"), ("gGross", "Price with GST")], ("gMain", "Total with GST")),
         body="""<h2>How GST is worked out</h2>
<p><b>Adding GST:</b> price × rate. With Australian GST at 10%, GST on 500 is 50 and the total is 550.</p>
<p><b>Removing GST:</b> total ÷ (1 + rate). In Australia that means dividing by 1.1, or simply taking one eleventh of the total: 550 ÷ 11 = 50 GST.</p>
<p><b>India:</b> for a sale within the same state, the GST is split equally into CGST and SGST, for example 18% becomes 9% + 9%. For a sale to another state, the full rate is charged as IGST.</p>
<h2>GST on your invoices</h2>
<p>Use the <a href="/gst-invoice/">Australian GST tax invoice</a> or the <a href="/gst-invoice-india/">India GST invoice</a> to make a compliant invoice with these amounts.</p>""",
         faq=[("How do I calculate GST in Australia?", "Multiply the price by 0.1 to get the GST, or divide a GST-inclusive price by 11 to find the GST inside it."),
              ("What is the GST rate in India?", "Since 22 September 2025 most goods and services are taxed at 5% or 18%, with 40% for a short list of luxury and sin goods."),
              ("What is CGST and SGST?", "For sales within one state in India, GST is shared between the central government (CGST) and the state (SGST), half each."),
              ("What is the GST rate in New Zealand?", "15%.")],
         cta="Make a GST invoice", cta_href="/gst-invoice/"),
    dict(key="stax", path="/sales-tax-calculator/", name="Sales tax calculator", card="US sales tax on a price, or the price before tax.",
         title="Sales Tax Calculator: Add Sales Tax or Find the Pre-Tax Price | invoice-gen.net",
         desc="Free sales tax calculator for US states. Add sales tax to a price or find the price before tax from a total. Enter your combined state and local rate.",
         h1="Sales tax calculator", lead="Add sales tax to a price, or find the price before tax from a total that includes it. Enter your combined state and local rate.",
         form=seg("sMode", "What do you want to do?", [("add", "Add sales tax"), ("remove", "Find price before tax")]) +
              num("sAmount", "Amount", "100") + num("sRate", "Sales tax rate", "7.25", "State plus local rate, for example 7.25 for California's state base rate.", "%"),
         results=out([("sNet", "Price before tax"), ("sTax", "Sales tax"), ("sGross", "Total with tax")], ("sMain", "Total with tax")),
         body="""<h2>How sales tax is worked out</h2>
<p>Sales tax = price × rate. A 100 item at 8.25% has 8.25 tax and costs 108.25. To find the price before tax from a total, divide the total by 1 plus the rate: 108.25 ÷ 1.0825 = 100.</p>
<h2>Which rate do I use?</h2>
<p>US sales tax is set by each state, and many cities and counties add their own. State base rates include California 7.25%, Texas 6.25%, Florida 6% and New York 4%; the rate a buyer actually pays is often higher once local taxes are added. Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire and Oregon. Check your state's tax website for the exact combined rate at your address.</p>
<p>Many services are not subject to sales tax, depending on the state. When in doubt, ask your accountant.</p>""",
         faq=[("Is sales tax the same everywhere in the US?", "No. Each state sets its own rate, and local taxes are often added on top."),
              ("Do I charge sales tax on services?", "It depends on the state and the service. Many states don't tax most services, but some do."),
              ("How do I show sales tax on an invoice?", "Enter the rate in the tax box of the invoice generator. It shows the subtotal, the sales tax and the total."),
              ("Which states have no sales tax?", "Alaska, Delaware, Montana, New Hampshire and Oregon have no statewide sales tax, though some Alaska towns charge local tax.")],
         cta="Make an invoice with sales tax", cta_href="/"),
    dict(key="late", path="/late-fee-calculator/", name="Late fee calculator", card="Interest and fees on an overdue invoice.",
         title="Late Payment Fee & Interest Calculator for Overdue Invoices | invoice-gen.net",
         desc="Work out the late fee or interest on an overdue invoice: yearly interest rate, monthly percentage or flat fee, by the number of days late. Free calculator.",
         h1="Late payment fee calculator", lead="Work out how much interest or late fee you can add to an overdue invoice, based on the amount, the rate in your terms and the number of days late.",
         form=num("lAmount", "Invoice amount", "2000") +
              '<label class="cf"><span class="cf-l">Due date</span><input class="in" id="lDue" type="date"></label><label class="cf"><span class="cf-l">Paid on (or today)</span><input class="in" id="lPaid" type="date"></label>' +
              seg("lType", "Your late payment terms", [("year", "Yearly %"), ("month", "Monthly %"), ("flat", "Flat fee")]) +
              num("lRate", "Rate or fee", "8", "Use the rate in your contract or terms.", "%") + num("lFixed", "Plus fixed fee (optional)", "0"),
         results=out([("lDays", "Days late"), ("lInt", "Interest or fee"), ("lFee", "Fixed fee"), ("lTotal", "New amount due")], ("lMain", "Late charges")),
         body="""<h2>How late interest is worked out</h2>
<p><b>Yearly rate:</b> amount × rate × days late ÷ 365. 2,000 at 8% a year for 30 days late = 2,000 × 0.08 × 30 ÷ 365 = 13.15.</p>
<p><b>Monthly rate:</b> amount × rate × days late ÷ 30. 1.5% a month on 2,000 for 30 days = 30.</p>
<p><b>Flat fee:</b> a fixed amount once the invoice is late, as long as your terms say so.</p>
<h2>Can I charge late fees?</h2>
<p>Usually only if your terms said so before the work started; put them on every invoice. In the UK, the Late Payment of Commercial Debts Act lets businesses charge business clients interest of 8% plus the Bank of England base rate, plus a fixed sum of £40 (debts under £1,000), £70 (£1,000 to £9,999.99) or £100 (£10,000 or more). Other countries have their own rules; check them before adding fees.</p>
<p>A friendly reminder often works better than a fee. See our <a href="/payment-reminder/">payment reminder emails</a>.</p>""",
         faq=[("How much late fee can I charge?", "What your contract or terms allow, within the law where you work. Many businesses use 1% to 2% a month or a small flat fee."),
              ("What is UK statutory interest?", "For business-to-business debts, 8% a year above the Bank of England base rate, plus fixed compensation of £40, £70 or £100 depending on the debt."),
              ("How do I add a late fee to an invoice?", "Add it as a new line on the invoice, such as Late payment interest, 30 days, and send the updated invoice."),
              ("Should I always charge it?", "Not always. For a good client who is a few days late, a polite reminder is often better for the relationship.")],
         cta="Send a payment reminder", cta_href="/payment-reminder/"),
    dict(key="due", path="/due-date-calculator/", name="Invoice due date calculator", card="Net 30, Net 60, end of month and more.",
         title="Invoice Due Date Calculator: Net 15, Net 30, Net 60, EOM | invoice-gen.net",
         desc="Find the due date of an invoice from its date and payment terms: Net 7, 15, 30, 45, 60, 90, end of month, or business days. Free due date calculator.",
         h1="Invoice due date calculator", lead="Pick the invoice date and the payment terms to get the exact due date, and how many days are left.",
         form='<label class="cf"><span class="cf-l">Invoice date</span><input class="in" id="dDate" type="date"></label>' +
              sel("dTerms", "Payment terms", [("0", "Due on receipt"), ("7", "Net 7"), ("10", "Net 10"), ("14", "Net 14"), ("15", "Net 15"), ("30", "Net 30"), ("45", "Net 45"), ("60", "Net 60"), ("90", "Net 90"), ("eom", "End of month (EOM)"), ("eom30", "30 days after end of month"), ("custom", "Other number of days")]) +
              num("dCustom", "Number of days", "21", attrs=" hidden") +
              '<label class="cf cf-check"><input type="checkbox" id="dBiz"> Count business days only (skip weekends)</label>',
         results=out([("dLeft", "Days from today"), ("dWeek", "Day of the week")], ("dMain", "Due date")),
         body="""<h2>What the payment terms mean</h2>
<ul><li><b>Due on receipt:</b> pay as soon as the invoice arrives.</li>
<li><b>Net 30:</b> pay within 30 calendar days of the invoice date. Net 15, Net 60 and Net 90 work the same way.</li>
<li><b>EOM:</b> pay by the end of the month the invoice is dated.</li>
<li><b>30 days after EOM:</b> pay 30 days after the end of that month, common with large companies.</li></ul>
<p>Read more in <a href="/payment-terms/">payment terms explained</a>. The invoice generator works out the due date for you when you pick the terms.</p>""",
         faq=[("What does Net 30 mean?", "The invoice must be paid within 30 calendar days of the invoice date."),
              ("Does Net 30 include weekends?", "Yes, Net terms count calendar days unless your contract says business days."),
              ("What if the due date falls on a weekend?", "Many businesses pay on the next working day. Say in your terms if you expect it before."),
              ("Which terms should I use?", "Shorter terms get you paid faster. Net 14 or Net 15 is common for freelancers; larger companies often ask for Net 30 to Net 60.")],
         cta="Make an invoice with a due date", cta_href="/"),
    dict(key="rate", path="/hourly-rate-calculator/", name="Freelance hourly rate calculator", card="What to charge per hour to hit your income.",
         title="Freelance Hourly Rate Calculator: What Should I Charge? | invoice-gen.net",
         desc="Work out your freelance hourly and day rate from the income you want, your business costs, time off and how many hours you can really bill. Free calculator.",
         h1="Freelance hourly rate calculator", lead="Find the hourly rate you need, based on the income you want, your costs, your time off and the hours you can actually bill.",
         form=num("rIncome", "Income you want per year (before tax)", "60000") + num("rCosts", "Business costs per year", "6000", "Software, equipment, insurance, accountant, phone.") +
              num("rHours", "Billable hours per week", "25", "Not all working hours are billable; 20 to 30 is typical.") + num("rWeeks", "Weeks off per year", "6", "Holidays, sick days and public holidays.") +
              num("rBuffer", "Safety margin", "10", "Extra for slow months and unpaid work.", "%"),
         results=out([("rDay", "Day rate (8 hours)"), ("rMonth", "Monthly income at this rate"), ("rBill", "Billable hours per year")], ("rMain", "Your hourly rate")),
         body="""<h2>How the rate is worked out</h2>
<p>Hourly rate = (income + costs) × (1 + safety margin) ÷ (billable hours per week × working weeks).</p>
<p>With 60,000 income, 6,000 costs, a 10% margin, 25 billable hours a week and 6 weeks off: (66,000 × 1.10) ÷ (25 × 46) = 63.13 an hour.</p>
<h2>Tips</h2>
<ul><li>Be honest about billable hours. Admin, sales and invoicing take time you can't bill.</li>
<li>Compare with what others charge in your field and country, then round to a clean number.</li>
<li>For fixed-price projects, estimate the hours and multiply by your rate, plus a buffer for changes.</li></ul>
<p>Ready to bill? The <a href="/freelance-invoice/">freelance invoice</a> bills by the hour or by the project.</p>""",
         faq=[("How many hours can a freelancer bill?", "Most freelancers bill 20 to 30 hours a week; the rest goes to admin, finding clients and learning."),
              ("Should I include tax?", "This calculator works with income before income tax. Remember to set aside money for tax from what you earn."),
              ("Hourly or day rate?", "Day rates suit longer projects and clients who think in days. The calculator shows both."),
              ("When should I raise my rate?", "When you are busy most of the time, or once a year. Tell existing clients a month ahead.")],
         cta="Make a freelance invoice", cta_href="/freelance-invoice/"),
    dict(key="margin", path="/profit-margin-calculator/", name="Profit margin calculator", card="Margin, markup and the price to charge.",
         title="Profit Margin & Markup Calculator: Find Your Selling Price | invoice-gen.net",
         desc="Free profit margin calculator. Enter cost and price to get margin and markup, or enter cost and target margin to get the selling price. Margin vs markup explained.",
         h1="Profit margin and markup calculator", lead="Enter your cost and either your price or the margin you want. See the profit, the margin and the markup.",
         form=seg("mMode", "What do you know?", [("price", "Cost and price"), ("margin", "Cost and margin %"), ("markup", "Cost and markup %")]) +
              num("mCost", "Cost", "60") + num("mPrice", "Selling price", "100") + num("mPct", "Target margin", "40", suffix="%", attrs=" hidden"),
         results=out([("mProfit", "Profit"), ("mMargin", "Margin"), ("mMarkup", "Markup")], ("mMain", "Selling price")),
         body="""<h2>Margin vs markup</h2>
<p><b>Margin</b> is profit as a share of the selling price: (price − cost) ÷ price. <b>Markup</b> is profit as a share of the cost: (price − cost) ÷ cost.</p>
<p>Buy for 60, sell for 100: profit 40, margin 40%, markup 66.7%. They describe the same sale, so be clear which one you mean when you price.</p>
<h2>Price from a target margin</h2>
<p>Price = cost ÷ (1 − margin). For a 40% margin on a cost of 60: 60 ÷ 0.6 = 100.</p>
<p>Use these prices on a <a href="/quote-generator/">quote</a> or <a href="/">invoice</a>.</p>""",
         faq=[("What is a good profit margin?", "It depends on the industry. Services often run 20% to 50% or more; retail is usually lower."),
              ("Is margin the same as markup?", "No. A 50% markup is a 33.3% margin. Margin is based on the price, markup on the cost."),
              ("How do I price for a 30% margin?", "Divide the cost by 0.7. A cost of 70 becomes a price of 100."),
              ("Does this include tax?", "No. Work with prices before VAT, GST or sales tax, then add tax on the invoice.")],
         cta="Make a quote", cta_href="/quote-generator/"),
]
