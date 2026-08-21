import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "bn";

const copy = {
  en: {
    dashboard: "Dashboard", invoices: "Invoices", customers: "Customers", products: "Products", settings: "Settings", newInvoice: "New invoice",
    totalReceivable: "Total receivable", paid: "Paid", outstanding: "Outstanding", draft: "Draft", sent: "Sent", overdue: "Overdue",
    recentInvoices: "Recent invoices", noInvoices: "No invoices yet", createFirstInvoice: "Create your first invoice", searchInvoices: "Search invoices", allStatuses: "All statuses",
    invoiceNumber: "Invoice no.", customer: "Customer", issueDate: "Issue date", dueDate: "Due date", amount: "Amount", status: "Status", actions: "Actions",
    addCustomer: "Add customer", editCustomer: "Edit customer", addProduct: "Add product", editProduct: "Edit product", name: "Name", bengaliName: "Name in Bangla", address: "Address", bengaliAddress: "Address in Bangla", phone: "Phone", email: "Email",
    description: "Description", bengaliDescription: "Description in Bangla", unitPrice: "Unit price", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", 
    invoiceDetails: "Invoice details", lineItems: "Line items", item: "Item", quantity: "Qty", price: "Unit price", total: "Total", taxVat: "Tax / VAT", discount: "Discount", subtotal: "Subtotal", grandTotal: "Grand total", notes: "Notes", 
    addLine: "Add line", selectCustomer: "Select a customer", selectProduct: "Select a product", createInvoice: "Create invoice", printPdf: "Print / Save PDF", sendEmail: "Send via email", markAs: "Mark as", 
    businessInfo: "Business information", businessName: "Business name", language: "বাংলা", profileSaved: "Business details saved", saveInvoice: "Invoice created", saveCustomer: "Customer saved", saveProduct: "Product saved",
    customerDirectory: "Customer directory", productCatalog: "Product & service catalog", invoiceList: "Invoice list", invoicePreview: "Invoice preview", billTo: "Bill to", from: "From", paymentTimeline: "Payment timeline", noCustomer: "No customers found", noProduct: "No products found", backToInvoices: "Back to invoices",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", invoices: "ইনভয়েস", customers: "গ্রাহক", products: "পণ্য ও সেবা", settings: "সেটিংস", newInvoice: "নতুন ইনভয়েস",
    totalReceivable: "মোট পাওনা", paid: "পরিশোধিত", outstanding: "বকেয়া", draft: "খসড়া", sent: "প্রেরিত", overdue: "মেয়াদোত্তীর্ণ",
    recentInvoices: "সাম্প্রতিক ইনভয়েস", noInvoices: "এখনও কোনো ইনভয়েস নেই", createFirstInvoice: "প্রথম ইনভয়েস তৈরি করুন", searchInvoices: "ইনভয়েস খুঁজুন", allStatuses: "সব স্ট্যাটাস",
    invoiceNumber: "ইনভয়েস নং", customer: "গ্রাহক", issueDate: "ইস্যুর তারিখ", dueDate: "শেষ তারিখ", amount: "পরিমাণ", status: "স্ট্যাটাস", actions: "অ্যাকশন",
    addCustomer: "গ্রাহক যোগ করুন", editCustomer: "গ্রাহক সম্পাদনা", addProduct: "পণ্য যোগ করুন", editProduct: "পণ্য সম্পাদনা", name: "নাম", bengaliName: "বাংলায় নাম", address: "ঠিকানা", bengaliAddress: "বাংলায় ঠিকানা", phone: "ফোন", email: "ইমেইল",
    description: "বিবরণ", bengaliDescription: "বাংলায় বিবরণ", unitPrice: "একক মূল্য", save: "সংরক্ষণ", cancel: "বাতিল", delete: "মুছুন", edit: "সম্পাদনা",
    invoiceDetails: "ইনভয়েস তথ্য", lineItems: "পণ্যের তালিকা", item: "পণ্য", quantity: "পরিমাণ", price: "একক মূল্য", total: "মোট", taxVat: "ট্যাক্স / ভ্যাট", discount: "ছাড়", subtotal: "সাবটোটাল", grandTotal: "সর্বমোট", notes: "নোট",
    addLine: "লাইন যোগ করুন", selectCustomer: "গ্রাহক নির্বাচন করুন", selectProduct: "পণ্য নির্বাচন করুন", createInvoice: "ইনভয়েস তৈরি করুন", printPdf: "প্রিন্ট / PDF সংরক্ষণ", sendEmail: "ইমেইলে পাঠান", markAs: "স্ট্যাটাস দিন",
    businessInfo: "ব্যবসার তথ্য", businessName: "ব্যবসার নাম", language: "English", profileSaved: "ব্যবসার তথ্য সংরক্ষিত", saveInvoice: "ইনভয়েস তৈরি হয়েছে", saveCustomer: "গ্রাহক সংরক্ষিত", saveProduct: "পণ্য সংরক্ষিত",
    customerDirectory: "গ্রাহক তালিকা", productCatalog: "পণ্য ও সেবা তালিকা", invoiceList: "ইনভয়েস তালিকা", invoicePreview: "ইনভয়েস প্রিভিউ", billTo: "প্রাপক", from: "প্রেরক", paymentTimeline: "পেমেন্ট টাইমলাইন", noCustomer: "কোনো গ্রাহক পাওয়া যায়নি", noProduct: "কোনো পণ্য পাওয়া যায়নি", backToInvoices: "ইনভয়েসে ফিরুন",
  },
} as const;

type CopyKey = keyof typeof copy.en;
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; toggleLocale: () => void; t: (key: CopyKey) => string };

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem("invoiceflow-locale") === "bn" ? "bn" : "en"));
  useEffect(() => localStorage.setItem("invoiceflow-locale", locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, toggleLocale: () => setLocale((current) => current === "en" ? "bn" : "en"), t: (key: CopyKey) => copy[locale][key] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}

export function statusLabel(status: "draft" | "sent" | "paid" | "overdue", locale: Locale) {
  return copy[locale][status];
}
