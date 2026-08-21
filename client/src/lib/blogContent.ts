export type BlogLocale = "en" | "bn";

export type BlogPost = {
  slug: string;
  category: string;
  published: string;
  readTime: string;
  title: Record<BlogLocale, string>;
  excerpt: Record<BlogLocale, string>;
  intro: Record<BlogLocale, string>;
  sections: Array<{ heading: Record<BlogLocale, string>; paragraphs: Record<BlogLocale, string[]> }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "professional-invoice-guide-small-business",
    category: "Invoicing basics",
    published: "2026-08-21",
    readTime: "6 min read",
    title: { en: "How to create a professional invoice for a small business", bn: "ছোট ব্যবসার জন্য পেশাদার ইনভয়েস কীভাবে তৈরি করবেন" },
    excerpt: { en: "A practical guide to the information, line items, payment terms, and review steps that make an invoice easier to understand and easier to pay.", bn: "একটি পরিষ্কার ইনভয়েসে কোন তথ্য, line item, payment term ও review step থাকা উচিত—তার ব্যবহারিক গাইড।" },
    intro: { en: "A good invoice answers the customer's questions before they need to ask. It makes the work, price, due date, and payment path easy to see.", bn: "একটি ভালো ইনভয়েস customer-এর প্রশ্ন আগে থেকেই পরিষ্কার করে। কাজ, মূল্য, due date এবং payment path সহজে দেখা যায়।" },
    sections: [
      { heading: { en: "Start with a clear business identity", bn: "পরিষ্কার business identity দিয়ে শুরু করুন" }, paragraphs: { en: ["Use your business name, contact details, and a consistent invoice number. This gives the document a reliable identity and helps both sides find it later.", "If you invoice in more than one language, keep the business identity consistent while translating the labels and customer-facing details that matter to the recipient."], bn: ["Business name, contact details ও ধারাবাহিক invoice number ব্যবহার করুন। এতে document-এর পরিচয় পরিষ্কার থাকে এবং পরে খুঁজে পাওয়া সহজ হয়।", "একাধিক ভাষায় invoice দিলে business identity একই রাখুন, শুধু customer-এর জন্য দরকারি label ও details অনুবাদ করুন।"] } },
      { heading: { en: "Make every line item specific", bn: "প্রতিটি line item নির্দিষ্ট করুন" }, paragraphs: { en: ["Describe the product or service in plain language, then show quantity and unit price. A customer should be able to understand what they are paying for without decoding internal shorthand.", "Add tax, discounts, and the final total as separate lines. This makes the arithmetic visible and reduces payment questions."], bn: ["Product বা service সহজ ভাষায় লিখুন, তারপর quantity ও unit price দেখান। Customer যেন internal shorthand না বুঝেও payment-এর বিষয়টি পরিষ্কার বুঝতে পারেন।", "Tax, discount ও final total আলাদা line-এ রাখুন। এতে হিসাব দেখা যায় এবং payment question কমে।"] } },
      { heading: { en: "Finish with an obvious payment path", bn: "স্পষ্ট payment path দিয়ে শেষ করুন" }, paragraphs: { en: ["Show the issue date, due date, payment instructions, and a contact method. Keep notes short and put the most important action near the total.", "Before sending, preview the invoice on a phone-sized screen. If the customer can scan it quickly, your invoice is doing its job."], bn: ["Issue date, due date, payment instruction ও contact method দেখান। Notes সংক্ষিপ্ত রাখুন এবং total-এর কাছে সবচেয়ে গুরুত্বপূর্ণ action রাখুন।", "পাঠানোর আগে phone-sized screen-এ preview করুন। Customer দ্রুত পড়তে পারলে invoice তার কাজ করছে।"] } },
    ],
  },
  {
    slug: "invoice-payment-terms-cash-flow",
    category: "Cash flow",
    published: "2026-08-21",
    readTime: "5 min read",
    title: { en: "Payment terms that make cash flow easier to manage", bn: "Cash flow সহজ রাখতে payment terms কীভাবে লিখবেন" },
    excerpt: { en: "Understand due dates, deposits, partial payments, and simple follow-up language without making the customer experience feel heavy.", bn: "Due date, deposit, partial payment ও follow-up language কীভাবে ব্যবহার করলে customer experience সহজ থাকে।" },
    intro: { en: "Payment terms are not just a legal detail. They are a shared expectation about when work becomes money in the bank.", bn: "Payment terms শুধু legal detail নয়। কখন কাজের মূল্য payment-এ পরিণত হবে, এটি তার shared expectation।" },
    sections: [
      { heading: { en: "Choose a due date you can explain", bn: "ব্যাখ্যা করা যায় এমন due date বেছে নিন" }, paragraphs: { en: ["A due date should be visible and connected to a clear starting point, such as the issue date or delivery date. Avoid hiding the timing inside a long note.", "For recurring work, a consistent monthly due date is easier for both the business and customer to remember."], bn: ["Due date দৃশ্যমান রাখুন এবং issue date বা delivery date-এর সঙ্গে সম্পর্ক পরিষ্কার করুন। দীর্ঘ note-এর মধ্যে timing লুকাবেন না।", "Recurring কাজের জন্য consistent monthly due date business ও customer উভয়ের মনে রাখা সহজ।"] } },
      { heading: { en: "Use deposits and milestones intentionally", bn: "Deposit ও milestone বুঝে ব্যবহার করুন" }, paragraphs: { en: ["For larger work, an upfront deposit or milestone invoice can align cash flow with the effort being delivered. State what the payment covers and what happens next.", "Keep each invoice focused on one payment event. A clear record is easier to reconcile than one document that mixes several milestones."], bn: ["বড় কাজের ক্ষেত্রে upfront deposit বা milestone invoice কাজের effort-এর সঙ্গে cash flow মিলিয়ে দিতে পারে। Payment কী cover করছে এবং এরপর কী হবে তা লিখুন।", "প্রতিটি invoice একটি payment event-এ focused রাখুন। এক document-এ অনেক milestone মেশানোর চেয়ে পরিষ্কার record reconcile করা সহজ।"] } },
      { heading: { en: "Follow up with context, not pressure", bn: "চাপ নয়, context দিয়ে follow-up করুন" }, paragraphs: { en: ["A short reminder should include the invoice number, amount, due date, and a direct question about the payment status. This gives the recipient enough context to respond quickly.", "Keep a simple status history so you know whether an invoice is draft, sent, paid, or overdue."], bn: ["Short reminder-এ invoice number, amount, due date ও payment status নিয়ে সরাসরি প্রশ্ন রাখুন। এতে recipient দ্রুত উত্তর দিতে পারেন।", "Invoice draft, sent, paid না overdue—সহজ status history রাখুন।"] } },
    ],
  },
  {
    slug: "multi-currency-invoice-best-practices",
    category: "Global billing",
    published: "2026-08-21",
    readTime: "7 min read",
    title: { en: "Multi-currency invoicing: a practical guide for global clients", bn: "Global client-এর জন্য multi-currency invoicing-এর ব্যবহারিক গাইড" },
    excerpt: { en: "Keep currency choice, totals, records, and customer communication aligned when your business works across borders.", bn: "দেশের বাইরে কাজের সময় currency choice, total, record ও customer communication কীভাবে একসঙ্গে পরিষ্কার রাখবেন।" },
    intro: { en: "Currency is part of the meaning of an invoice. A total without a clear currency can create confusion even when the arithmetic is correct.", bn: "Currency invoice-এর অর্থের অংশ। হিসাব ঠিক হলেও পরিষ্কার currency না থাকলে total নিয়ে confusion তৈরি হতে পারে।" },
    sections: [
      { heading: { en: "Choose the currency before pricing", bn: "Pricing-এর আগে currency বেছে নিন" }, paragraphs: { en: ["Select the currency before entering unit prices and discounts. This keeps the form, preview, and final total aligned from the start.", "Use the currency code and a familiar symbol where possible so the customer can identify the payment amount quickly."], bn: ["Unit price ও discount দেওয়ার আগে currency select করুন। এতে form, preview ও final total শুরু থেকেই aligned থাকে।", "সম্ভব হলে currency code ও পরিচিত symbol একসঙ্গে ব্যবহার করুন, যাতে customer দ্রুত amount বুঝতে পারেন।"] } },
      { heading: { en: "Do not mix currencies in one summary", bn: "একটি summary-তে currency মেশাবেন না" }, paragraphs: { en: ["A dashboard should never add dollars, pounds, and taka into one unlabeled number. Group totals by currency or make the conversion method explicit.", "Keep the original currency attached to a saved invoice so a later report does not rewrite the meaning of the historical record."], bn: ["Dashboard-এ dollar, pound ও taka এক unlabeled number-এ যোগ করবেন না। Currency অনুযায়ী group করুন বা conversion method পরিষ্কার করুন।", "Saved invoice-এর সঙ্গে original currency রাখুন, যাতে historical record-এর অর্থ পরে বদলে না যায়।"] } },
      { heading: { en: "Align the invoice with your payment method", bn: "Payment method-এর সঙ্গে invoice মিলিয়ে নিন" }, paragraphs: { en: ["Tell the customer which currency the payment account expects and whether fees or conversion costs apply. A short note can prevent a long payment delay.", "Review the final PDF on a phone before sending. Currency labels and grand totals should remain visible at a glance."], bn: ["Payment account কোন currency গ্রহণ করে এবং fee বা conversion cost আছে কি না customer-কে জানান। ছোট একটি note বড় payment delay আটকাতে পারে।", "পাঠানোর আগে phone-এ final PDF review করুন। Currency label ও grand total যেন এক নজরে দেখা যায়।"] } },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
