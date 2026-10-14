# More landing pages for invoice-gen.net (imported by build_pages.py).
# Each one opens the real generator, set up for that country or trade, with a short guide and FAQ.
# Tuple: (path, menu name, card text, doc, title, description, h1, lead, guide, faq, mode, unit, region)

COUNTRY_PAGES = [
    ("/uk-invoice-template/", "UK VAT invoice", "HMRC rules, VAT number, tax point, pounds.", "Invoice",
     "UK Invoice Template: Free VAT Invoice Generator (HMRC Rules)",
     "Make a UK invoice that meets HMRC rules: VAT registration number, tax point, VAT at 20%, 5% or 0%, A4 and pounds. Free VAT invoice generator, download the PDF.",
     "UK Invoice Template with VAT",
     "Set up for the UK: pounds, A4 paper, UK dates, your VAT registration number and the tax point. Set VAT to 0% if you are not VAT registered.",
     ("What HMRC expects on a VAT invoice", "A full VAT invoice has to show these details. The generator has a box for each one.", [
         ("Number and dates", "A unique invoice number, the invoice date and the tax point (time of supply) if it is different."),
         ("Your details", "Your business name and address, and your VAT registration number, like GB123456789."),
         ("Your customer", "The customer's name or trading name and address."),
         ("Each item", "A description, the quantity and the unit price before VAT."),
         ("VAT", "The VAT rate for each item (20%, 5% or 0%), the total before VAT and the total VAT in pounds."),
         ("Not VAT registered?", "Don't charge or show VAT. Leave the VAT rate at 0% and don't add a VAT number.")]),
     [("Do I have to charge VAT?", "Only if you are VAT registered. You must register once your VAT taxable turnover goes over the registration threshold (£90,000 a year since April 2024). Below that, registering is optional."),
      ("What is the tax point?", "The tax point (time of supply) is usually the date you delivered the goods or finished the service. If you invoice within 14 days of that date, the invoice date can be the tax point."),
      ("What VAT rates are there?", "Standard 20%, reduced 5% (for example home energy) and zero rate 0% (for example most food and children's clothes). Some supplies are exempt."),
      ("Can I invoice a business in the EU?", "Yes. For most business-to-business services you don't charge UK VAT; add the customer's VAT number and the reverse charge note in Tax note."),
      ("Is it free?", "Yes. Make, download and print as many UK invoices as you need, with no watermark and no sign-up.")],
     "standard", "", "uk"),
    ("/gst-invoice/", "Australia GST tax invoice", "ABN, GST at 10%, 'Tax Invoice' title.", "Invoice",
     "GST Tax Invoice Template (Australia & NZ): Free ABN Invoice Generator",
     "Create an Australian tax invoice with your ABN, GST at 10% and the words Tax Invoice, as the ATO requires. Works for New Zealand GST too. Free PDF, no sign-up.",
     "GST Tax Invoice Template",
     "Set up for Australia: the title Tax Invoice, your ABN, GST at 10%, Australian dollars and A4. The invoice can also show 'Total price includes GST'.",
     ("What the ATO requires on a tax invoice", "For sales of $82.50 or more including GST, your customer needs a tax invoice to claim GST credits. It must show:", [
         ("The words Tax invoice", "The title is set to Tax Invoice for you. Keep it if you are registered for GST."),
         ("Your identity and ABN", "Your business name and your ABN, like 51 824 753 556."),
         ("Date", "The date the invoice is issued."),
         ("What you sold", "A description, the quantity and the price of each item."),
         ("GST", "The GST amount, or that the total includes GST. Both are shown on the PDF."),
         ("Sales of $1,000 or more", "Also add the buyer's name or ABN.")]),
     [("Do I have to register for GST?", "In Australia you must register once your GST turnover reaches $75,000 a year ($150,000 for non-profits). Taxi and ride-share drivers must register from the start."),
      ("I'm not registered for GST. What do I send?", "Send an invoice, not a tax invoice. Change the title to Invoice and leave GST at 0%."),
      ("Does it work for New Zealand?", "Yes. Change the tax rate to 15% and use your GST number in the tax ID box. New Zealand calls these records taxable supply information."),
      ("Is it free?", "Yes, completely free, with no watermark and no sign-up.")],
     "standard", "", "au"),
    ("/canada-invoice-template/", "Canada GST/HST invoice", "GST/HST number, GST 5% or HST.", "Invoice",
     "Canada Invoice Template: Free GST/HST Invoice Generator",
     "Make a Canadian invoice with your GST/HST registration number, GST at 5% or HST for your province, and Canadian dollars. Free invoice generator, download the PDF.",
     "Canada Invoice Template with GST/HST",
     "Set up for Canada: Canadian dollars, your GST/HST number and GST at 5%. Change the tax name to HST and the rate for HST provinces.",
     ("What the CRA expects on an invoice", "What you must show depends on the amount of the sale.", [
         ("Every invoice", "Your business name, the invoice date and the total amount."),
         ("$30 or more", "Also your GST/HST registration number (like 123456789 RT0001) and the GST/HST charged, or a note that the total includes it."),
         ("$150 or more", "Also the buyer's name, the payment terms and a short description of what you supplied."),
         ("Which tax", "GST is 5%. HST provinces: Ontario 13%, Nova Scotia 14%, and New Brunswick, Newfoundland and Labrador and Prince Edward Island 15%."),
         ("Quebec", "Add QST (9.975%) as a second line in the notes, or ask your accountant how to show it."),
         ("Small supplier", "If your taxable sales are $30,000 or less over four quarters, you don't have to register or charge GST/HST.")]),
     [("How do I charge HST instead of GST?", "Type HST in the tax name box and enter your province's rate, for example 13% for Ontario."),
      ("Where do I put my business number?", "In the GST/HST no. box under your details. It prints under your name on the invoice."),
      ("Can I invoice in US dollars?", "Yes. Choose USD in Currency. The tax is still worked out on the amounts you enter."),
      ("Is it free?", "Yes. No sign-up, no watermark, unlimited invoices.")],
     "standard", "", "ca"),
    ("/eu-vat-invoice/", "EU VAT invoice", "VAT IDs, reverse charge, date of supply.", "Invoice",
     "EU VAT Invoice Template: Free Generator with Reverse Charge",
     "Create a VAT invoice that follows the EU VAT Directive: both VAT IDs, date of supply, VAT per rate, bank details and a reverse charge note. Euro and A4. Free PDF.",
     "EU VAT Invoice Template",
     "Set up for Europe: euro, A4, European number and date format, your VAT ID and bank details, and a ready reverse charge note for business clients in another EU country.",
     ("What an EU VAT invoice must show", "Article 226 of the EU VAT Directive lists what goes on a full VAT invoice. Each one has a place on this template.", [
         ("Number and dates", "A sequential invoice number, the date of issue and the date of supply if it is different."),
         ("Both parties", "Full names and addresses of you and your customer, and your VAT ID."),
         ("Customer VAT ID", "Needed when the customer pays the VAT (reverse charge) and for supplies to another EU country."),
         ("Each item", "Quantity and type of goods, or the extent and type of services, and the unit price before VAT."),
         ("VAT", "The taxable amount for each rate, the VAT rate and the VAT amount."),
         ("Reverse charge", "Choose Reverse charge in Tax note. VAT is set to 0% and the note prints on the invoice.")]),
     [("What VAT rate do I use?", "The rate of the country where the supply is taxed. Standard rates run from 17% (Luxembourg) to 27% (Hungary); Germany is 19%, France 20%."),
      ("When do I use the reverse charge?", "Usually when you sell services to a VAT-registered business in another EU country. You charge no VAT; the customer accounts for it."),
      ("I'm a small business that is VAT exempt. What do I write?", "Choose VAT exempt (small business) in Tax note. VAT is set to 0% and the exemption note prints on the invoice."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", "eu"),
    ("/uae-vat-invoice/", "UAE VAT tax invoice", "TRN, VAT at 5%, dirhams.", "Invoice",
     "UAE VAT Tax Invoice Template: Free TRN Invoice Generator",
     "Make a UAE tax invoice with your TRN, the customer's TRN, VAT at 5% and amounts in AED, as the FTA requires. Works for Saudi VAT at 15% too. Free PDF.",
     "UAE VAT Tax Invoice Template",
     "Set up for the UAE: the title Tax Invoice, your TRN, VAT at 5%, dirhams and A4. For Saudi Arabia, change the rate to 15% and the currency to SAR.",
     ("What a UAE tax invoice must show", "The Federal Tax Authority lists these details for a full tax invoice.", [
         ("The words Tax Invoice", "Set as the title for you."),
         ("Your details", "Your name, address and Tax Registration Number (TRN)."),
         ("Your customer", "The customer's name and address, and their TRN if they are VAT registered."),
         ("Number and dates", "A sequential invoice number, the date of issue and the date of supply if it is different."),
         ("Each item", "A description, quantity, unit price, VAT rate and VAT amount."),
         ("Totals in AED", "The total payable and the VAT in dirhams, even if you invoice in another currency.")]),
     [("Do I have to register for VAT in the UAE?", "Registration is mandatory once your taxable supplies go over AED 375,000 in 12 months, and voluntary from AED 187,500."),
      ("What is a simplified tax invoice?", "You can issue one when the customer is not VAT registered, or for supplies to a registered customer of AED 10,000 or less. It needs fewer details."),
      ("Does it work for Saudi Arabia?", "Yes for the layout. Set VAT to 15% and the currency to SAR. Saudi businesses in scope of e-invoicing (FATOORA) must issue invoices from a compliant system."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", "me"),
    ("/gst-invoice-india/", "India GST invoice", "GSTIN, HSN/SAC, CGST + SGST or IGST.", "Invoice",
     "GST Invoice Format (India): Free GST Bill Generator with HSN",
     "Create a GST tax invoice for India with GSTIN, HSN/SAC codes, place of supply, CGST + SGST or IGST and the amount in words. Free GST bill generator, download the PDF.",
     "GST Invoice Generator for India",
     "Set up for India: the title Tax Invoice, GSTIN for you and your customer, HSN/SAC per item, place of supply, CGST + SGST or IGST worked out for you, and the amount in words.",
     ("What a GST tax invoice must show (Rule 46)", "These details are required on a GST invoice. Each has its own box.", [
         ("Your details", "Name, address and GSTIN of the supplier."),
         ("Number and date", "A consecutive serial number of up to 16 characters, unique for the financial year, and the date of issue."),
         ("Your customer", "Name, address and GSTIN if registered. For unregistered buyers over ₹50,000, add the delivery address and state."),
         ("Each item", "Description, HSN code for goods or SAC for services, quantity and unit, and the taxable value."),
         ("Tax", "Rate and amount of CGST and SGST for a sale in the same state, or IGST for a sale to another state."),
         ("Place of supply", "The state and state code, plus the signature of the supplier.")]),
     [("Which GST rate do I use?", "Since 22 September 2025 most goods and services are taxed at 5% or 18%, with 40% on a short list of luxury and sin goods. Check the rate for your HSN/SAC code."),
      ("CGST + SGST or IGST?", "Same state as your customer: split the GST into CGST and SGST. Different state: charge IGST. Pick Same state or Other state and the invoice does it."),
      ("How many HSN digits do I need?", "Businesses with turnover up to ₹5 crore show 4 digits on B2B invoices; above ₹5 crore, 6 digits."),
      ("Do I need e-invoicing?", "Businesses above the e-invoicing turnover limit must report B2B invoices to the IRP and print the IRN and QR code. Use this generator if you are below the limit, or for quotes and proformas."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", "sa"),
]

TRADE_PAGES = [
    ("/web-design-invoice/", "Web design invoice", "Design, build, hosting and retainers.", "Invoice",
     "Web Design Invoice Template: Bill Projects, Hours and Hosting (Free)",
     "Invoice web design work the professional way: project stages, hours, hosting and maintenance on one clear invoice. Free web designer invoice template, download the PDF.",
     "Web Design Invoice Template",
     "Bill a website project by stage or by the hour, add hosting, domains and monthly care plans, and show any deposit already paid.",
     ("How to invoice a website project", "Clients approve invoices faster when they match the proposal.", [
         ("Stages", "One line per stage, like Design, Development and Launch, with the agreed price."),
         ("Hours", "For extra requests, bill by the hour. Choose Hours in Bill items by."),
         ("Third-party costs", "List domains, themes, plugins or stock images as their own lines."),
         ("Care plans", "Add hosting and maintenance as a monthly line, like Website care plan, October."),
         ("Deposit", "Enter the deposit you took at the start in Amount paid. The balance updates itself."),
         ("Payment link", "Add a PayPal, Wise or Stripe link in Notes so the client can pay in one click.")]),
     [("Should I charge a deposit for web design?", "Most web designers take 30% to 50% up front. Send a quote with a deposit first, then show the deposit as paid on the final invoice."),
      ("Hourly or fixed price?", "Fixed price per stage is easiest for clients to approve. Use hours for changes outside the agreed scope."),
      ("Can I invoice clients abroad?", "Yes. Pick their currency, and add the reverse charge note if they are a business in another VAT country."),
      ("Is it free?", "Yes. No watermark, no sign-up, unlimited invoices.")],
     "standard", "", ""),
    ("/graphic-design-invoice/", "Graphic design invoice", "Concepts, revisions, usage rights.", "Invoice",
     "Graphic Design Invoice Template: Free Designer Invoice PDF",
     "Make a graphic design invoice with concepts, revision rounds, hours and usage rights. Add your logo and download a polished PDF. Free template for freelance designers.",
     "Graphic Design Invoice Template",
     "Show what the client gets: concepts, rounds of revisions, final files and usage rights, on a clean invoice with your own logo and colour.",
     ("What to put on a design invoice", "A clear design invoice avoids questions about what was included.", [
         ("Deliverables", "One line per deliverable, like Logo design, 3 concepts, or Brand guidelines, 12 pages."),
         ("Revisions", "Say how many revision rounds were included, and bill extra rounds as their own line."),
         ("Hours", "Bill smaller jobs by the hour. Choose Hours in Bill items by."),
         ("Usage rights", "Add the licence in Notes, for example: Full rights transfer on payment in full."),
         ("Your brand", "Add your logo and pick a colour so the invoice looks like your work."),
         ("Terms", "Set Payment due to 14 days and add a late fee line in Terms if you use one.")]),
     [("How much deposit should a designer take?", "50% up front is common for new clients. Show it in Amount paid on the final invoice."),
      ("Should rights transfer on payment?", "Many designers transfer rights only once the invoice is paid in full. Write it in Notes so it is on record."),
      ("Can I add my logo?", "Yes. Press Add logo on the invoice. It stays for your next invoices too."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", ""),
    ("/construction-invoice/", "Construction invoice", "Stages, labour, materials, retention.", "Invoice",
     "Construction Invoice Template: Free Builder Invoice with Labour & Materials",
     "Create a construction invoice with job stages, labour, materials, variations and deposits. Free builder invoice template for contractors and trades. Download the PDF.",
     "Construction Invoice Template",
     "Invoice a building job by stage: labour and materials on separate lines, approved variations, deposits taken off and a clear balance due.",
     ("How to invoice a construction job", "Builders get paid faster when the invoice matches the contract and the stage that was finished.", [
         ("Stage", "Name the stage at the top in an extra field, like Stage 2: framing complete."),
         ("Labour", "One line per trade, with days or hours and the rate."),
         ("Materials", "Main materials with quantity and unit price. Group small items as Sundries."),
         ("Variations", "Approved extra work as separate lines, like Variation 3: extra window, rear wall."),
         ("Deposits and progress payments", "Enter what the client has already paid in Amount paid."),
         ("Site address", "Add the site address in Notes or as an extra field.")]),
     [("What is a progress invoice?", "An invoice for one finished stage of a larger job. Number them in order and name the stage on each one."),
      ("How do I show retention?", "Add a line with a negative amount, like Retention 5%, -1,250. The balance updates."),
      ("Should materials have markup?", "That's your choice. Many builders show materials at cost plus a margin in the unit price."),
      ("Is it free?", "Yes. Unlimited invoices, no watermark, no sign-up.")],
     "standard", "", ""),
    ("/landscaping-invoice/", "Landscaping invoice", "Visits, mowing, materials, monthly plans.", "Invoice",
     "Landscaping & Lawn Care Invoice Template (Free PDF)",
     "Invoice lawn care and landscaping jobs in minutes: visits, mowing, planting, materials and disposal fees. Free landscaping invoice template, download or email the PDF.",
     "Landscaping and Lawn Care Invoice Template",
     "List each visit or job, add plants, mulch and green waste, and send a clean invoice from your phone right after the job.",
     ("What a landscaping invoice should show", "Regular customers want to see which visits and materials they are paying for.", [
         ("Visits", "One line per visit or a monthly line, like Lawn mowing, 4 visits in May."),
         ("Jobs", "Bigger jobs as their own lines, like Hedge trimming, front and back."),
         ("Materials", "Plants, soil, mulch and turf with quantity and unit price."),
         ("Disposal", "Green waste removal as its own line."),
         ("Property", "Add the property address as an extra field if it differs from the billing address."),
         ("Pay on the day", "Set Payment due to On receipt and add your bank or payment link in Notes.")]),
     [("Can I bill by the hour?", "Yes. Choose Hours in Bill items by, or use the Timesheet invoice for start and end times."),
      ("How do I bill monthly contracts?", "Make one invoice a month with one line for the plan and extra lines for one-off jobs. Press New next month; your details stay."),
      ("Can I make it on my phone?", "Yes. The generator works on any phone, and the PDF can be shared straight to WhatsApp or email."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", ""),
    ("/tutoring-invoice/", "Tutoring invoice", "Lessons by the hour, packages, students.", "Invoice",
     "Tutoring Invoice Template: Bill Lessons by the Hour (Free)",
     "Make a tutoring invoice for private lessons: dates, hours, rate per hour and lesson packages. Free invoice template for tutors and teachers, download the PDF.",
     "Tutoring Invoice Template",
     "Bill lessons by the hour or as a package, name the student, and send parents a clear invoice they can pay straight away.",
     ("How to invoice tutoring", "Parents pay quickly when they can see each lesson.", [
         ("Student", "Put the student's name in an extra field, and bill the parent or school under Bill to."),
         ("Lessons", "One line per lesson with the date, like Maths, 3 March, 1.5 hours. Hours are set for you."),
         ("Packages", "Sell lessons in blocks, like 10 lessons, paid in advance, as one line."),
         ("Cancellations", "Add a late cancellation fee as a line if your policy has one."),
         ("Materials", "Books or exam papers as their own lines."),
         ("Payment", "Add your bank details or a payment link in Notes.")]),
     [("Should I invoice weekly or monthly?", "Monthly is most common for regular students. Weekly works for short exam courses."),
      ("Can I bill by the hour?", "Yes. This page bills in hours. Enter 1.5 for an hour and a half."),
      ("Do I need a tax number?", "It depends on your country and income. Add one in Tax ID if you have it; otherwise leave it empty."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "hours", ""),
    ("/handyman-invoice/", "Handyman invoice", "Small jobs, call-out fee, parts.", "Invoice",
     "Handyman Invoice Template: Free Invoice for Small Jobs & Repairs",
     "Invoice small jobs and repairs in minutes: call-out fee, labour by the hour, parts and materials. Free handyman invoice template, make it on your phone and send the PDF.",
     "Handyman Invoice Template",
     "Write the invoice on your phone before you leave the job: call-out fee, labour, parts, and the payment method, then send the PDF by email or WhatsApp.",
     ("What to put on a handyman invoice", "Small jobs get paid fastest when the invoice is short and clear.", [
         ("Call-out fee", "Your call-out or minimum charge as the first line."),
         ("Labour", "Hours on site at your hourly rate. Use 0.5 for half an hour."),
         ("Parts", "Each part with quantity and price, like Tap cartridge, 2."),
         ("Several small jobs", "One line per job, like Rehang bathroom door, Fix kitchen tap."),
         ("Paid on the spot", "Enter the amount paid and how, so the invoice shows a zero balance, or use the Receipt generator."),
         ("Job address", "Add it as an extra field if it differs from the customer's address.")]),
     [("Should I charge a call-out fee?", "Many handymen charge a call-out or minimum fee for the first hour. Put it as the first line so it is clear."),
      ("What if the customer pays cash?", "Enter it in Amount paid. Or make a receipt with the Receipt generator to show it was paid."),
      ("Can I send it by WhatsApp?", "Yes. On a phone, download the PDF and choose Share, then WhatsApp."),
      ("Is it free?", "Yes, free with no watermark and no sign-up.")],
     "standard", "", ""),
]

# Guides: (path, menu name, card text, title, description, h1, body html)
GUIDE_PAGES = [
    ("/invoice-number/", "How to number invoices", "Formats that work, and what to avoid.",
     "Invoice Number Format: How to Number Your Invoices (with Examples)",
     "How to number invoices: simple sequential formats, year and client prefixes, what tax offices expect, and how to fix a mistake. With examples you can copy.",
     "How to Number Your Invoices",
     """<p class="lede">Every invoice needs its own number. It lets you and your client talk about the same document, and tax offices in most countries require it. Here is how to pick a format and keep it clean.</p>
<h2>The simple rule</h2>
<p>Use numbers that go up by one and never repeat. Start wherever you like; you don't have to start at 1.</p>
<ul><li><b>INV-0001, INV-0002, INV-0003</b>: the simplest format, and the one this generator uses.</li></ul>
<h2>Formats that work</h2>
<ul>
<li><b>With the year:</b> 2026-001, 2026-002. Easy to read, and many businesses restart the count each year.</li>
<li><b>With a client code:</b> ACME-001, ACME-002. Handy when you bill a few large clients.</li>
<li><b>With the document type:</b> INV-0001 for invoices, QUO-0001 for quotes, REC-0001 for receipts. The generator keeps a separate count for each type.</li>
</ul>
<h2>What tax offices expect</h2>
<p>Most countries ask for a unique, sequential number. The UK and the EU require a sequence that identifies the invoice. India allows up to 16 characters, unique for the financial year. Gaps are not illegal everywhere, but they can raise questions in an audit, so avoid skipping or deleting numbers.</p>
<h2>Made a mistake?</h2>
<p>Don't delete the invoice or reuse its number. Mark it as cancelled and issue a new invoice with the next number, or send a credit note for the wrong amount. Keep both in your records.</p>
<h2>Let the generator do it</h2>
<p>invoice-gen.net numbers each new invoice for you, one higher than the last, with separate counts for quotes, estimates, receipts and proformas. You can type your own number at any time.</p>"""),
    ("/how-to-write-a-quote/", "How to write a quote", "What to include so clients say yes.",
     "How to Write a Quote That Wins the Job (with Free Template)",
     "How to write a quote clients accept: what to include, how to price it, validity dates, deposits and acceptance. Free quote template to fill in and download as PDF.",
     "How to Write a Quote That Wins the Job",
     """<p class="lede">A quote tells the client exactly what they get, what it costs and how long the price holds. A clear one wins the job and saves arguments later.</p>
<h2>1. Start with the basics</h2>
<p>Your business name and contact details, the client's name, a quote number (like QUO-0001), the date and a <b>valid until</b> date. 30 days is common; use less when material prices move fast.</p>
<h2>2. Break the work into lines</h2>
<p>One line per part of the job, with the quantity and the price. Clients trust a quote they can read line by line more than a single lump sum.</p>
<ul><li>Remove old cabinets and worktop: 1 × 650</li><li>Supply and fit kitchen cabinets: 12 × 185</li><li>Quartz worktop, cut and fitted: 1 × 1,450</li></ul>
<h2>3. Say what is not included</h2>
<p>Add a short note for anything outside the price, like plastering or permits. It prevents the most common dispute: "I thought that was included".</p>
<h2>4. Add tax and a deposit</h2>
<p>Show tax as its own line so the client sees the full price. For bigger jobs, ask for a deposit to start; 25% to 50% is normal. The quote generator shows the deposit amount under the total.</p>
<h2>5. Make it easy to say yes</h2>
<p>End with how to accept: sign the quote, or reply to the email. The quote PDF has an Accepted by box for the client's name, signature and date.</p>
<h2>6. Follow up</h2>
<p>If you hear nothing in a week, send a short, friendly follow-up. When the client accepts, turn the quote into an invoice with the same lines.</p>
<p><a class="btn btn-primary" href="/quote-generator/">Open the free quote generator</a></p>"""),
    ("/deposit-invoice/", "Deposit invoices", "Ask for money up front, then show it paid.",
     "Deposit Invoice: How to Ask for a Deposit and Show It on the Final Invoice",
     "How to invoice a deposit: how much to ask for, what to write, and how to show the deposit as paid on the final invoice. With a free invoice and quote generator.",
     "How to Invoice a Deposit",
     """<p class="lede">A deposit protects you before you buy materials or block time for a client. Here is how to ask for one and how to show it on the final invoice.</p>
<h2>How much to ask for</h2>
<p>25% to 50% is normal. Ask for more when you buy materials up front or the client is new. For long jobs, use stage payments instead of one big deposit.</p>
<h2>Step 1: put the deposit on the quote</h2>
<p>On the <a href="/quote-generator/">quote</a> or <a href="/estimate-maker/">estimate</a>, enter the deposit percentage under the total. The PDF shows "Deposit due on acceptance (30%)" with the amount, so the client knows what to pay to start.</p>
<h2>Step 2: send a deposit invoice</h2>
<p>When the client accepts, send an invoice with one line: <b>Deposit, 30% of quote QUO-0012</b>, with the deposit amount. For orders paid in advance, a <a href="/proforma-invoice/">proforma invoice</a> does the same job.</p>
<h2>Step 3: show it on the final invoice</h2>
<p>When the work is done, invoice the full amount and enter the deposit in <b>Amount paid</b>. The invoice shows the total, the deposit already paid and the balance still due.</p>
<h2>Refunds</h2>
<p>Say in your terms whether the deposit is refundable if the client cancels. A common rule: non-refundable once materials are ordered.</p>
<p><a class="btn btn-primary" href="/">Make an invoice</a></p>"""),
]
