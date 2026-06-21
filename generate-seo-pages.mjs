import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  {
    slug: 'invoice-generator',
    title: 'Free Invoice Generator | Create Professional Invoices Instantly',
    description: 'Use our free online invoice generator to create beautiful, professional invoices in seconds. Download as PDF, customize your templates, and get paid faster.',
    h1: 'Free Invoice Generator',
    subtitle: 'Create, customize, and download professional invoices in seconds. No sign-up required.',
    articleTitle: 'How to Use an Invoice Generator to Get Paid Faster'
  },
  {
    slug: 'invoice-template',
    title: 'Free Professional Invoice Templates | Download Now',
    description: 'Download beautiful, free invoice templates for your business. Available in modern, classic, and creative designs. Customize and export to PDF instantly.',
    h1: 'Professional Invoice Templates',
    subtitle: 'Choose from our premium invoice templates designed for modern businesses.',
    articleTitle: 'Why Using a Professional Invoice Template Matters'
  },
  {
    slug: 'free-invoice-template',
    title: 'Free Invoice Template | Simple, Professional & Customizable',
    description: 'Get a perfectly formatted free invoice template. Just fill in your details and download as a professional PDF invoice instantly.',
    h1: 'Free Invoice Template',
    subtitle: 'A clean, simple, and completely free invoice template for freelancers and small businesses.',
    articleTitle: 'What Makes a Great Free Invoice Template?'
  },
  {
    slug: 'freelance-invoice-template',
    title: 'Freelance Invoice Template | Designed for Independent Workers',
    description: 'The perfect freelance invoice template to bill clients quickly and professionally. Download as PDF and streamline your freelance business.',
    h1: 'Freelance Invoice Template',
    subtitle: 'Tailored for freelancers, independent contractors, and solo entrepreneurs.',
    articleTitle: 'Billing Best Practices for Freelancers'
  },
  {
    slug: 'consulting-invoice-template',
    title: 'Consulting Invoice Template | Bill Your Clients Professionally',
    description: 'A dedicated consulting invoice template for agencies and independent consultants. Easily itemize hours, project milestones, and rates.',
    h1: 'Consulting Invoice Template',
    subtitle: 'The professional way to bill for your consulting services and expert advice.',
    articleTitle: 'How to Structure a Consulting Invoice'
  },
  {
    slug: 'contractor-invoice-template',
    title: 'Contractor Invoice Template | Simple Billing for Contractors',
    description: 'Easily bill for materials, labor, and hours with our contractor invoice template. Perfect for construction, independent contractors, and trades.',
    h1: 'Contractor Invoice Template',
    subtitle: 'Streamline your billing process with a template built for contractors.',
    articleTitle: 'Essential Elements of a Contractor Invoice'
  },
  {
    slug: 'receipt-generator',
    title: 'Free Receipt Generator | Create Custom Payment Receipts',
    description: 'Generate professional payment receipts instantly. Use our free receipt generator to provide proof of payment to your clients and customers.',
    h1: 'Free Receipt Generator',
    subtitle: 'Create beautiful, customized payment receipts in seconds.',
    articleTitle: 'The Importance of Issuing Professional Receipts'
  },
  {
    slug: 'quote-generator',
    title: 'Free Quote Generator | Create Professional Business Quotes',
    description: 'Win more clients with professional business quotes. Use our free quote generator to estimate costs and send beautiful proposals.',
    h1: 'Professional Quote Generator',
    subtitle: 'Create compelling quotes and estimates that help you win more business.',
    articleTitle: 'How to Write a Winning Business Quote'
  },
  {
    slug: 'estimate-generator',
    title: 'Free Estimate Generator | Quick & Accurate Cost Estimates',
    description: 'Create detailed project estimates instantly. Our free estimate generator helps you breakdown costs and present them professionally.',
    h1: 'Free Estimate Generator',
    subtitle: 'Generate accurate, professional cost estimates for your next big project.',
    articleTitle: 'Estimates vs. Quotes: What You Need to Know'
  },
  {
    slug: 'how-to-create-an-invoice',
    title: 'How to Create an Invoice: A Step-by-Step Guide',
    description: 'Learn exactly how to create a professional invoice. From essential elements to best practices, this guide covers everything you need to get paid.',
    h1: 'How to Create an Invoice',
    subtitle: 'A comprehensive, step-by-step guide to writing an invoice that gets you paid on time.',
    articleTitle: 'The Ultimate Guide to Creating an Invoice'
  },
  {
    slug: 'invoice-number-example',
    title: 'Invoice Number Examples & Best Practices | Structuring Your Invoices',
    description: 'Learn how to assign invoice numbers properly. Explore invoice number examples, formatting systems, and how to avoid billing mistakes.',
    h1: 'Invoice Number Examples',
    subtitle: 'How to organize and format your invoice numbers to keep your accounting perfect.',
    articleTitle: 'Why Invoice Numbering is Critical for Your Business'
  },
  {
    slug: 'what-should-be-included-in-an-invoice',
    title: 'What Should Be Included in an Invoice? | Checklist',
    description: 'Not sure what to include on your invoice? Follow our complete checklist to ensure your invoices are legally compliant and professionally formatted.',
    h1: 'What Should Be Included in an Invoice?',
    subtitle: 'The essential checklist of items every professional invoice needs to have.',
    articleTitle: 'The Anatomy of a Perfect Invoice'
  },
  {
    slug: 'invoice-vs-receipt',
    title: 'Invoice vs Receipt: What is the Difference?',
    description: 'Invoice vs Receipt: Understand the key differences between these two essential financial documents and when to use each one.',
    h1: 'Invoice vs Receipt',
    subtitle: 'Understanding the key differences between billing a client and proving payment.',
    articleTitle: 'When to Use an Invoice vs a Receipt'
  },
  {
    slug: 'invoice-payment-terms-explained',
    title: 'Invoice Payment Terms Explained: Net 30, Due on Receipt & More',
    description: 'Confused by invoice payment terms? Learn the meaning of Net 30, Due on Receipt, and other standard terms to improve your cash flow.',
    h1: 'Invoice Payment Terms Explained',
    subtitle: 'Maximize your cash flow by choosing the right payment terms for your business.',
    articleTitle: 'A Complete Guide to Invoice Payment Terms'
  },
  {
    slug: 'best-invoice-format-for-small-business',
    title: 'The Best Invoice Format for Small Businesses',
    description: 'Discover the best invoice format for your small business. Learn how layout, branding, and clarity can help you get paid faster.',
    h1: 'Best Invoice Format for Small Business',
    subtitle: 'How to structure your invoices to look professional and get paid faster.',
    articleTitle: 'Designing the Perfect Small Business Invoice'
  }
];

const MARKETING_DIR = path.join(__dirname, 'src', 'app', '(marketing)');

pages.forEach(page => {
  const dirPath = path.join(MARKETING_DIR, page.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Very basic generic content to fill out the 1000 word requirement later, 
  // but enough structure to be valuable immediately.
  const content = `import React from 'react';
import SeoLandingPage from '@/components/marketing/SeoLandingPage';

export const metadata = {
  title: '${page.title}',
  description: '${page.description}',
};

export default function Page() {
  const articleContent = (
    <>
      <h2>${page.articleTitle}</h2>
      <p>
        Getting your invoicing right is one of the most critical aspects of running a successful business or freelance operation. 
        Whether you are sending your first bill or optimizing an existing accounting workflow, understanding the nuances of professional 
        invoicing can significantly impact your cash flow, client relationships, and administrative overhead.
      </p>
      <h3>Why Accuracy Matters</h3>
      <p>
        An invoice is more than just a request for payment—it is a legally binding document that serves as an official record of a transaction. 
        When you create a clean, accurate, and easy-to-read document, you eliminate friction for your client's accounts payable department. 
        This reduces the back-and-forth communication regarding missing details and dramatically speeds up your time to get paid.
      </p>
      <h3>Key Elements to Always Include</h3>
      <ul>
        <li><strong>Professional Header:</strong> Your business name, logo, and contact information.</li>
        <li><strong>Client Details:</strong> The exact legal name and address of the entity you are billing.</li>
        <li><strong>Invoice Number:</strong> A unique, sequential identifier for accounting purposes.</li>
        <li><strong>Dates:</strong> Both the issue date and the exact due date.</li>
        <li><strong>Line Items:</strong> Clear descriptions, quantities, rates, and total amounts for the services or products provided.</li>
        <li><strong>Payment Terms:</strong> Clear instructions on how and when you expect to be paid (e.g., Net 30, Bank Transfer Details).</li>
      </ul>
      <h3>Common Mistakes to Avoid</h3>
      <p>
        Many freelancers and small businesses make the mistake of sending vague descriptions (e.g., "Web Design - $500"). 
        Instead, itemize the value you delivered: "Homepage Design Layout (10 hours at $50/hr) - $500". 
        This level of transparency builds trust and justifies your pricing. Additionally, always double-check your math and ensure any applicable taxes are clearly separated from the subtotal.
      </p>
      <h3>The Power of Automation</h3>
      <p>
        Instead of manually creating documents in Word or Excel, leveraging a dedicated generator ensures that calculations are flawless, 
        formatting remains perfectly aligned, and the final output is a clean, universally accepted PDF.
      </p>
    </>
  );

  const faqs = [
    {
      question: 'Is this invoice generator truly free?',
      answer: 'Yes! Our tool is completely free to use. You can generate, customize, and download as many PDF invoices as you need without any hidden fees or required account creation.'
    },
    {
      question: 'Can I add my own logo to the invoice?',
      answer: 'Absolutely. You can upload your business logo directly in the builder, and it will be beautifully formatted at the top of your final PDF.'
    },
    {
      question: 'Are the invoices legally binding?',
      answer: 'Yes, as long as you include all the required legal information for your jurisdiction (such as your business details, the clients details, and clear itemization), the generated PDF serves as a legally valid commercial document.'
    },
    {
      question: 'Is my data safe?',
      answer: 'We do not store your invoice data on our servers when using the free tool. Everything is generated locally in your browser, ensuring your financial information and client details remain completely private.'
    }
  ];

  return (
    <SeoLandingPage 
      title="${page.title}"
      description="${page.description}"
      h1="${page.h1}"
      subtitle="${page.subtitle}"
      articleContent={articleContent}
      faqs={faqs}
    />
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
  console.log(`Created route: /${page.slug}`);
});

console.log('Successfully generated all SEO landing pages!');
