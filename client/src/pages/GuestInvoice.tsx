import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { currencyCatalog, useLocale } from "@/contexts/LocaleContext";
import { buildTemporaryInvoiceData, calculateInvoiceTotals, formatMoney } from "@shared/invoice";
import { ArrowRight, Check, FileText, Plus, ShieldCheck, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Line = { name: string; description: string; quantity: string; unitPrice: string };
const blankLine = (): Line => ({ name: "", description: "", quantity: "1", unitPrice: "0" });
const today = () => new Date().toISOString().slice(0, 10);

export default function GuestInvoice() {
  const { locale, currency, setCurrency } = useLocale();
  const [, navigate] = useLocation();
  const bn = locale === "bn";
  const [business, setBusiness] = useState({ name: "", email: "", phone: "", address: "" });
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "" });
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getTime().toString().slice(-6)}`);
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([blankLine()]);
  const [hasRestored, setHasRestored] = useState(false);
  useEffect(() => {
    const raw = window.sessionStorage.getItem("invoicegen-guest-draft");
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.business) setBusiness(draft.business);
        if (draft.customer) setCustomer(draft.customer);
        if (draft.invoiceNumber) setInvoiceNumber(draft.invoiceNumber);
        if (draft.issueDate) setIssueDate(draft.issueDate);
        if (draft.dueDate !== undefined) setDueDate(draft.dueDate);
        if (draft.taxRate !== undefined) setTaxRate(draft.taxRate);
        if (draft.discount !== undefined) setDiscount(draft.discount);
        if (draft.notes !== undefined) setNotes(draft.notes);
        if (Array.isArray(draft.lines) && draft.lines.length) setLines(draft.lines);
        if (draft.currency) setCurrency(draft.currency);
      } catch { window.sessionStorage.removeItem("invoicegen-guest-draft"); }
    }
    setHasRestored(true);
  }, [setCurrency]);
  useEffect(() => {
    if (!hasRestored) return;
    window.sessionStorage.setItem("invoicegen-guest-draft", JSON.stringify({ business, customer, invoiceNumber, issueDate, dueDate, taxRate, discount, notes, lines, currency }));
  }, [business, customer, invoiceNumber, issueDate, dueDate, taxRate, discount, notes, lines, currency, hasRestored]);
  const items = useMemo(() => lines.map((line) => ({ name: line.name.trim(), nameBn: null, description: line.description.trim() || null, descriptionBn: null, quantity: Math.max(0, Math.round(Number(line.quantity) || 0)), unitPrice: Math.max(0, Math.round((Number(line.unitPrice) || 0) * 100)) })), [lines]);
  const totals = useMemo(() => calculateInvoiceTotals(items, Number(taxRate) || 0, Math.round((Number(discount) || 0) * 100)), [items, taxRate, discount]);
  const money = (amount: number) => formatMoney(amount, currency, bn ? "bn-BD" : undefined);
  const update = (setter: typeof setBusiness, key: string, value: string) => setter((current: any) => ({ ...current, [key]: value }));
  const generate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!business.name.trim() || !customer.name.trim()) return toast.error(bn ? "আপনার ব্যবসা ও customer-এর নাম লিখুন।" : "Add both your business name and customer name.");
    if (items.some((item) => !item.name || item.quantity < 1 || item.unitPrice < 0)) return toast.error(bn ? "প্রতিটি item-এর নাম, quantity ও price ঠিক করুন।" : "Add a valid name, quantity, and price for every item.");
    const result = buildTemporaryInvoiceData({ invoice: { invoiceNumber: invoiceNumber.trim() || `INV-${Date.now()}`, currencyCode: currency, issueDate: new Date(`${issueDate}T00:00:00`), dueDate: dueDate ? new Date(`${dueDate}T00:00:00`) : null, taxRate: Number(taxRate) || 0, discountAmount: Math.round((Number(discount) || 0) * 100), notes: notes.trim() || null, subtotal: totals.subtotal, taxAmount: totals.taxAmount, totalAmount: totals.totalAmount }, customer, items });
    const guestData = { ...result, business };
    window.sessionStorage.setItem("invoicegen-guest-invoice", JSON.stringify(guestData));
    window.sessionStorage.removeItem("invoicegen-guest-draft");
    navigate("/invoice-generator/preview");
  };
  return <div className="min-h-screen bg-[#f7faff] text-slate-950"><PublicHeader /><main><section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-5 pb-10 pt-12 sm:px-8"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><FileText className="h-3.5 w-3.5" />{bn ? "Sign-in ছাড়াই invoice তৈরি করুন" : "Create an invoice without signing in"}</p><h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{bn ? "কয়েক মিনিটে একটি professional invoice তৈরি করুন।" : "Build a professional invoice in a few calm steps."}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{bn ? "কোনো account দরকার নেই। তথ্য লিখুন, preview দেখুন, তারপর print বা PDF download করুন।" : "No account required. Add your details, preview the result, then print or download a polished PDF."}</p><div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-600"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{bn ? "Browser session-এ নিরাপদভাবে রাখা" : "Kept in your browser session"}</span><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{bn ? "বিভিন্ন currency" : "Multiple currencies"}</span><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />{bn ? "কোনো customer record তৈরি হয় না" : "No customer record created"}</span></div></div></div></section><form onSubmit={generate} className="container max-w-7xl py-10"><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle number="01" title={bn ? "আপনার business details" : "Your business details"} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label={bn ? "Business name" : "Business name"} value={business.name} onChange={(v) => update(setBusiness, "name", v)} required /><Field label="Email" type="email" value={business.email} onChange={(v) => update(setBusiness, "email", v)} /><Field label={bn ? "Phone" : "Phone"} value={business.phone} onChange={(v) => update(setBusiness, "phone", v)} /><Field label={bn ? "Address" : "Address"} value={business.address} onChange={(v) => update(setBusiness, "address", v)} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><SectionTitle number="02" title={bn ? "Customer ও invoice details" : "Customer and invoice details"} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label={bn ? "Customer name" : "Customer name"} value={customer.name} onChange={(v) => update(setCustomer, "name", v)} required /><Field label="Invoice number" value={invoiceNumber} onChange={setInvoiceNumber} required /><Field label="Customer email" type="email" value={customer.email} onChange={(v) => update(setCustomer, "email", v)} /><Field label="Customer phone" value={customer.phone} onChange={(v) => update(setCustomer, "phone", v)} /><Field label="Issue date" type="date" value={issueDate} onChange={setIssueDate} required /><Field label="Due date" type="date" value={dueDate} onChange={setDueDate} /><Field label="Customer address" value={customer.address} onChange={(v) => update(setCustomer, "address", v)} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><SectionTitle number="03" title={bn ? "আপনার services বা items" : "Your services or items"} /><Button type="button" variant="outline" onClick={() => setLines((current) => [...current, blankLine()])}><Plus className="mr-2 h-4 w-4" />{bn ? "Item যোগ করুন" : "Add item"}</Button></div><div className="mt-5 space-y-4">{lines.map((line, index) => <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px_150px_40px]"><Field label={bn ? "Item name" : "Item name"} value={line.name} onChange={(value) => setLines((current) => current.map((item, i) => i === index ? { ...item, name: value } : item))} required /><Field label={bn ? "Quantity" : "Quantity"} type="number" value={line.quantity} onChange={(value) => setLines((current) => current.map((item, i) => i === index ? { ...item, quantity: value } : item))} required /><Field label={`${bn ? "Unit price" : "Unit price"} (${currency})`} type="number" value={line.unitPrice} onChange={(value) => setLines((current) => current.map((item, i) => i === index ? { ...item, unitPrice: value } : item))} required /><button type="button" aria-label={bn ? "Item মুছুন" : "Remove item"} disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))} className="mt-7 grid h-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div><Field label={bn ? "Description (optional)" : "Description (optional)"} value={line.description} onChange={(value) => setLines((current) => current.map((item, i) => i === index ? { ...item, description: value } : item))} /></div>)}</div></section></div><aside className="h-fit rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/40 sm:p-6 xl:sticky xl:top-6"><SectionTitle number="04" title={bn ? "Total ও preview" : "Totals and preview"} /><div className="mt-5 space-y-4"><Field label={bn ? "Currency" : "Currency"} value={currency} onChange={(value) => setCurrency(value as typeof currency)} selectOptions={currencyCatalog.map((entry) => ({ value: entry.code, label: `${entry.code} — ${entry.nativeName}` }))} /><Field label="Tax / VAT (%)" type="number" value={taxRate} onChange={setTaxRate} /><Field label={`Discount (${currency})`} type="number" value={discount} onChange={setDiscount} /><Field label={bn ? "Notes" : "Notes"} value={notes} onChange={setNotes} textarea /></div><div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm"><Summary label={bn ? "Subtotal" : "Subtotal"} value={money(totals.subtotal)} /><Summary label={`${bn ? "Tax / VAT" : "Tax / VAT"} (${taxRate || 0}%)`} value={money(totals.taxAmount)} /><Summary label={bn ? "Discount" : "Discount"} value={`− ${money(totals.discountAmount)}`} /><div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-black"><span>{bn ? "সর্বমোট" : "Total"}</span><span className="text-blue-700">{money(totals.totalAmount)}</span></div></div><Button type="submit" className="mt-6 h-12 w-full bg-blue-700 text-base font-bold hover:bg-blue-800">{bn ? "Invoice preview তৈরি করুন" : "Create invoice preview"}<ArrowRight className="ml-2 h-4 w-4" /></Button><p className="mt-3 text-center text-xs leading-5 text-slate-500">{bn ? "পরে saved invoice ও customer catalog চাইলে sign in করুন।" : "Want saved invoices and customer catalogs? Sign in after preview."}</p></aside></div></form></main><PublicFooter /></div>;
}

function SectionTitle({ number, title }: { number: string; title: string }) { return <div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{number}</p><h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-slate-600"><span>{label}</span><span className="font-semibold text-slate-900">{value}</span></div>; }
function Field({ label, value, onChange, type = "text", required = false, textarea = false, selectOptions }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; textarea?: boolean; selectOptions?: Array<{ value: string; label: string }> }) { const common = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"; return <label className="block text-sm font-semibold text-slate-700"><span>{label}{required ? <span className="text-red-500"> *</span> : null}</span>{selectOptions ? <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className={common}>{selectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : textarea ? <textarea required={required} rows={3} value={value} onChange={(event) => onChange(event.target.value)} className={common} /> : <input required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={common} />}</label>; }
