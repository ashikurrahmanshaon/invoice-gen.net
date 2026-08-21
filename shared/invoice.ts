export type InvoiceItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
};

export const currencyCatalog = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", nativeName: "বাংলাদেশি টাকা", locale: "bn-BD" },
  { code: "USD", symbol: "$", name: "US Dollar", nativeName: "ডলার", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", nativeName: "ইউরো", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", nativeName: "পাউন্ড", locale: "en-GB" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", nativeName: "ভারতীয় রুপি", locale: "hi-IN" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", nativeName: "পাকিস্তানি রুপি", locale: "ur-PK" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", nativeName: "দিরহাম", locale: "ar-AE" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", nativeName: "সৌদি রিয়াল", locale: "ar-SA" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", nativeName: "কানাডিয়ান ডলার", locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", nativeName: "অস্ট্রেলিয়ান ডলার", locale: "en-AU" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", nativeName: "সিঙ্গাপুর ডলার", locale: "en-SG" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", nativeName: "মালয়েশিয়ান রিঙ্গিত", locale: "ms-MY" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", nativeName: "জাপানি ইয়েন", locale: "ja-JP" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", nativeName: "চীনা ইউয়ান", locale: "zh-CN" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", nativeName: "কোরিয়ান ওন", locale: "ko-KR" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", nativeName: "সুইস ফ্রাঁ", locale: "de-CH" },
  { code: "ZAR", symbol: "R", name: "South African Rand", nativeName: "দক্ষিণ আফ্রিকান র‍্যান্ড", locale: "en-ZA" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", nativeName: "তুর্কি লিরা", locale: "tr-TR" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", nativeName: "ব্রাজিলিয়ান রিয়াল", locale: "pt-BR" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", nativeName: "ইন্দোনেশিয়ান রুপিয়া", locale: "id-ID" },
] as const;

export type CurrencyCode = (typeof currencyCatalog)[number]["code"];

export function getCurrencyMeta(currency: string | null | undefined) {
  return currencyCatalog.find((entry) => entry.code === currency) ?? currencyCatalog[0];
}

/** All monetary values are stored as integer minor units to prevent decimal rounding errors. */
export function calculateInvoiceTotals(items: InvoiceItemInput[], taxRate: number, discountAmount: number): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice), 0);
  const normalizedTaxRate = Math.max(0, Math.min(100, taxRate));
  const taxAmount = Math.round((subtotal * normalizedTaxRate) / 100);
  const normalizedDiscount = Math.max(0, Math.min(subtotal + taxAmount, Math.round(discountAmount)));
  return { subtotal, taxAmount, discountAmount: normalizedDiscount, totalAmount: Math.max(0, subtotal + taxAmount - normalizedDiscount) };
}

export function formatMoney(amountInMinorUnits: number, currency: string = "BDT", locale = "en-BD") {
  const meta = getCurrencyMeta(currency);
  const fractionDigits = meta.code === "JPY" || meta.code === "KRW" ? 0 : 2;
  return new Intl.NumberFormat(locale || meta.locale, { style: "currency", currency: meta.code, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(amountInMinorUnits / 100);
}

export function formatBdt(amountInPoisha: number, locale = "en-BD") {
  return formatMoney(amountInPoisha, "BDT", locale);
}

export type TemporaryCustomerData = {
  name: string;
  nameBn?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  addressBn?: string | null;
};

export function buildTemporaryInvoiceData(input: {
  invoice: Record<string, unknown> & { currencyCode: string; subtotal: number; taxAmount: number; totalAmount: number; invoiceNumber: string };
  customer: TemporaryCustomerData;
  items: Array<Record<string, unknown> & { quantity: number; unitPrice: number }>;
}) {
  const name = input.customer.name.trim();
  if (!name) throw new Error("A temporary customer name is required.");
  return {
    invoice: { ...input.invoice, id: "temporary", status: "draft" },
    customer: { id: "temporary", ...input.customer, name },
    business: null,
    history: [],
    items: input.items.map((item, index) => ({ ...item, id: index + 1, lineTotal: Math.round(item.quantity * item.unitPrice) })),
  };
}
