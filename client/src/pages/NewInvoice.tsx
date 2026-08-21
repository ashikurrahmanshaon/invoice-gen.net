import { Button } from "@/components/ui/button";
import { currencyCatalog, useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { buildTemporaryInvoiceData, calculateInvoiceTotals, formatMoney } from "@shared/invoice";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

type Line = { productId?: number | null; name: string; nameBn: string; description: string; descriptionBn: string; quantity: string; unitPrice: string };
const blankLine: Line = { name: "", nameBn: "", description: "", descriptionBn: "", quantity: "1", unitPrice: "0" };
const optional = (value: string) => value.trim() || null;

export default function NewInvoice() {
  const { t, locale, currency, setCurrency } = useLocale();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/invoices/:id/edit");
  const invoiceId = params?.id ? Number(params.id) : null;
  const utils = trpc.useUtils();
  const { data: customers = [] } = trpc.customers.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: nextNumber } = trpc.invoices.nextNumber.useQuery(undefined, { enabled: !invoiceId });
  const { data: existingInvoice } = trpc.invoices.detail.useQuery({ id: invoiceId ?? 0 }, { enabled: Boolean(invoiceId) });
  const [mode, setMode] = useState<"saved" | "temporary">("saved");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [temporaryCustomer, setTemporaryCustomer] = useState({ name: "", nameBn: "", email: "", phone: "", address: "", addressBn: "" });
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...blankLine }]);

  useEffect(() => { if (nextNumber && !invoiceNumber && !invoiceId) setInvoiceNumber(nextNumber); }, [nextNumber, invoiceNumber, invoiceId]);
  useEffect(() => {
    if (!existingInvoice) return;
    const invoice = existingInvoice.invoice;
    setInvoiceNumber(invoice.invoiceNumber);
    setCustomerId(String(invoice.customerId));
    setCurrency((invoice.currencyCode || currency) as typeof currency);
    setIssueDate(new Date(invoice.issueDate).toISOString().slice(0, 10));
    setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : "");
    setTaxRate(String(invoice.taxRate));
    setDiscount((invoice.discountAmount / 100).toFixed(2));
    setNotes(invoice.notes ?? "");
    setLines(existingInvoice.items.map((item) => ({ productId: item.productId, name: item.name, nameBn: item.nameBn ?? "", description: item.description ?? "", descriptionBn: item.descriptionBn ?? "", quantity: String(item.quantity), unitPrice: (item.unitPrice / 100).toFixed(2) })));
  }, [existingInvoice, setCurrency]);

  const calculatedItems = useMemo(() => lines.map((line) => ({ name: line.name, quantity: Math.max(0, Math.round(Number(line.quantity) || 0)), unitPrice: Math.max(0, Math.round((Number(line.unitPrice) || 0) * 100)) })), [lines]);
  const totals = useMemo(() => calculateInvoiceTotals(calculatedItems, Number(taxRate) || 0, Math.round((Number(discount) || 0) * 100)), [calculatedItems, taxRate, discount]);
  const create = trpc.invoices.create.useMutation({ onSuccess: (id) => { utils.invoices.list.invalidate(); toast.success(t("saveInvoice")); navigate(`/invoices/${id}`); }, onError: (error) => toast.error(error.message) });
  const update = trpc.invoices.update.useMutation({ onSuccess: (id) => { utils.invoices.list.invalidate(); utils.invoices.detail.invalidate({ id }); toast.success(locale === "bn" ? "ইনভয়েস সংরক্ষণ হয়েছে" : "Invoice updated"); navigate(`/invoices/${id}`); }, onError: (error) => toast.error(error.message) });
  const updateLine = (index: number, values: Partial<Line>) => setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, ...values } : line));
  const useProduct = (index: number, productId: string) => { const product = products.find((item) => item.id === Number(productId)); if (!product) return updateLine(index, { productId: null }); updateLine(index, { productId: product.id, name: product.name, nameBn: product.nameBn ?? "", description: product.description ?? "", descriptionBn: product.descriptionBn ?? "", unitPrice: (product.unitPrice / 100).toFixed(2) }); };
  const setTemp = (key: keyof typeof temporaryCustomer, value: string) => setTemporaryCustomer((current) => ({ ...current, [key]: value }));

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const parsedCustomerId = Number(customerId);
    if (mode === "saved" && !parsedCustomerId) return toast.error(t("selectCustomer"));
    if (mode === "temporary" && !temporaryCustomer.name.trim()) return toast.error(t("customerNameRequired"));
    const dataItems = lines.map((line) => ({ productId: line.productId ?? null, name: line.name.trim(), nameBn: optional(line.nameBn), description: optional(line.description), descriptionBn: optional(line.descriptionBn), quantity: Math.round(Number(line.quantity)), unitPrice: Math.round(Number(line.unitPrice) * 100) }));
    if (dataItems.some((line) => !line.name || !Number.isFinite(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitPrice) || line.unitPrice < 0)) return toast.error("Add a valid name, quantity, and price for every line item.");
    const data = { invoiceNumber: invoiceNumber.trim(), currencyCode: currency, customerId: parsedCustomerId, issueDate: new Date(`${issueDate}T00:00:00`), dueDate: dueDate ? new Date(`${dueDate}T00:00:00`) : null, taxRate: Number(taxRate) || 0, discountAmount: Math.round((Number(discount) || 0) * 100), notes: optional(notes), items: dataItems };
    if (mode === "temporary") {
      const temporaryInvoice = buildTemporaryInvoiceData({ invoice: { ...data, subtotal: totals.subtotal, taxAmount: totals.taxAmount, totalAmount: totals.totalAmount }, customer: { name: temporaryCustomer.name, nameBn: optional(temporaryCustomer.nameBn), email: optional(temporaryCustomer.email), phone: optional(temporaryCustomer.phone), address: optional(temporaryCustomer.address), addressBn: optional(temporaryCustomer.addressBn) }, items: dataItems });
      window.sessionStorage.setItem("invoicegen-temporary-invoice", JSON.stringify(temporaryInvoice));
      toast.success(t("temporaryReady"));
      navigate("/invoices/temporary");
      return;
    }
    if (invoiceId) update.mutate({ id: invoiceId, data }); else create.mutate(data);
  };

  const money = (amount: number) => formatMoney(amount, currency, locale === "bn" ? "bn-BD" : undefined);
  const isSaving = create.isPending || update.isPending;
  return <div className="container max-w-7xl"><section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><button onClick={() => navigate("/invoices")} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"><ArrowLeft className="h-4 w-4"/>{t("backToInvoices")}</button><h1 className="text-3xl font-bold tracking-tight text-slate-950">{mode === "temporary" ? t("temporaryInvoice") : t("createInvoice")}</h1><p className="mt-2 text-sm text-slate-500">{locale === "bn" ? "সংরক্ষিত গ্রাহক বেছে নিন অথবা একবারের জন্য অস্থায়ী ইনভয়েস তৈরি করুন।" : "Choose a saved customer or generate a one-time invoice without creating a customer record."}</p></div></section><div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1"><button data-testid="saved-customer-mode" type="button" onClick={() => setMode("saved")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "saved" ? "bg-blue-700 text-white" : "text-slate-600"}`}>{t("savedCustomer")}</button><button data-testid="temporary-customer-mode" type="button" onClick={() => setMode("temporary")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "temporary" ? "bg-blue-700 text-white" : "text-slate-600"}`}>{t("temporaryCustomer")}</button></div><form noValidate onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><FormField label={t("invoiceNumber")} value={invoiceNumber} onChange={setInvoiceNumber} required/><label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{mode === "saved" ? t("customer") : t("temporaryCustomer")} <span className="text-red-500">*</span></span>{mode === "saved" ? <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="">{t("selectCustomer")}</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{locale === "bn" ? customer.nameBn || customer.name : customer.name}</option>)}</select> : <input value={temporaryCustomer.name} onChange={(event) => setTemp("name", event.target.value)} required className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"/>}</label><FormField label={t("issueDate")} type="date" value={issueDate} onChange={setIssueDate} required/><FormField label={t("dueDate")} type="date" value={dueDate} onChange={setDueDate}/></div>{mode === "temporary" ? <div className="mt-4 grid gap-4 md:grid-cols-2"><FormField label={t("bengaliName")} value={temporaryCustomer.nameBn} onChange={(value) => setTemp("nameBn", value)}/><FormField label={t("customerEmailOptional")} type="email" value={temporaryCustomer.email} onChange={(value) => setTemp("email", value)}/><FormField label={t("phone")} value={temporaryCustomer.phone} onChange={(value) => setTemp("phone", value)}/><TextField label={t("address")} value={temporaryCustomer.address} onChange={(value) => setTemp("address", value)}/></div> : null}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-900">{t("lineItems")}</h2><p className="mt-1 text-sm text-slate-500">{locale === "bn" ? "ক্যাটালগ থেকে বেছে নিন অথবা নিজে লাইন যোগ করুন।" : "Choose from your catalog or enter a custom line."}</p></div><Button type="button" variant="outline" onClick={() => setLines([...lines, { ...blankLine }])}><Plus className="mr-2 h-4 w-4"/>{t("addLine")}</Button></div><div className="mt-5 space-y-4">{lines.map((line, index) => <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_100px_140px_36px]"><label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{t("item")}</span><select value={line.productId ?? ""} onChange={(event) => useProduct(index, event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="">{t("selectProduct")}</option>{products.map((product) => <option key={product.id} value={product.id}>{locale === "bn" ? product.nameBn || product.name : product.name}</option>)}</select></label><FormField label={t("quantity")} type="number" value={line.quantity} onChange={(quantity) => updateLine(index, { quantity })}/><FormField label={`${t("price")} (${currency})`} type="number" value={line.unitPrice} onChange={(unitPrice) => updateLine(index, { unitPrice })}/><button aria-label={t("remove")} type="button" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))} className="mt-7 grid h-10 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4"/></button></div><div className="mt-3 grid gap-3 md:grid-cols-2"><FormField label={t("name")} value={line.name} onChange={(name) => updateLine(index, { name })} required/><FormField label={t("bengaliName")} value={line.nameBn} onChange={(nameBn) => updateLine(index, { nameBn })}/></div><div className="mt-3 grid gap-3 md:grid-cols-2"><TextField label={t("description")} value={line.description} onChange={(description) => updateLine(index, { description })}/><TextField label={t("bengaliDescription")} value={line.descriptionBn} onChange={(descriptionBn) => updateLine(index, { descriptionBn })}/></div><p className="mt-3 text-right text-sm font-bold text-slate-800">{t("total")}: {money(Math.round((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) * 100))}</p></div>)}</div></section></div><aside className="h-fit rounded-2xl border border-blue-100 bg-white p-5 shadow-sm xl:sticky xl:top-6"><h2 className="font-bold text-slate-900">{t("invoiceDetails")}</h2><div className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{t("currency")}</span><select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500">{currencyCatalog.map((entry) => <option key={entry.code} value={entry.code}>{entry.code} — {entry.nativeName}</option>)}</select></label><FormField label={`${t("taxVat")} (%)`} type="number" value={taxRate} onChange={setTaxRate}/><FormField label={`${t("discount")} (${currency})`} type="number" value={discount} onChange={setDiscount}/><TextField label={t("notes")} value={notes} onChange={setNotes}/></div><p className="mt-4 text-xs leading-5 text-slate-500">{t("currencyHint")}</p><div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm"><SummaryRow label={t("subtotal")} value={money(totals.subtotal)}/><SummaryRow label={`${t("taxVat")} (${taxRate || 0}%)`} value={money(totals.taxAmount)}/><SummaryRow label={t("discount")} value={`− ${money(totals.discountAmount)}`}/><div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-950"><span>{t("grandTotal")}</span><span>{money(totals.totalAmount)}</span></div></div><Button data-testid="generate-invoice" type="submit" disabled={isSaving} className="mt-6 h-11 w-full bg-blue-700 hover:bg-blue-800">{isSaving ? "Saving…" : mode === "temporary" ? t("generateTemporary") : t("createInvoice")}</Button></aside></form></div>;
}

function FormField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{label}{required ? <span className="text-red-500"> *</span> : null}</span><input required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"/></label>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{label}</span><textarea rows={2} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"/></label>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between text-slate-600"><span>{label}</span><span>{value}</span></div>; }
