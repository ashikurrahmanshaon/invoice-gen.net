import { type Locale, useLocale } from "@/contexts/LocaleContext";
import { formatMoney } from "@shared/invoice";
import React from "react";

type InvoiceDocumentProps = { data: any; locale?: Locale };

function readText(primary: string | null | undefined, bangla: string | null | undefined, locale: Locale) {
  return locale === "bn" ? bangla || primary || "—" : primary || bangla || "—";
}

function invoiceDate(value: Date | string | null | undefined, locale: Locale) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export function InvoiceDocument({ data, locale: localeOverride }: InvoiceDocumentProps) {
  const localeContext = useLocale();
  const locale = localeOverride ?? localeContext.locale;
  const t = localeContext.t;
  const { invoice, customer, business, items } = data;
  const currencyCode = invoice.currencyCode || localeContext.currency;
  const currencyLocale = locale === "bn" ? "bn-BD" : undefined;
  const money = (amount: number) => formatMoney(amount, currencyCode, currencyLocale);

  return (
    <article className="invoice-paper bg-white text-slate-900 shadow-sm print:shadow-none" id="invoice-print-area">
      <div className="flex flex-col gap-8 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-sm font-black text-white">IF</div>
            <span className="text-lg font-bold tracking-tight text-blue-950">invoice-gen.net</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{readText(business?.name, business?.nameBn, locale)}</h1>
          <p className="mt-2 max-w-xs whitespace-pre-line text-sm leading-6 text-slate-600">{readText(business?.address, business?.addressBn, locale)}</p>
          <p className="mt-1 text-sm text-slate-600">{business?.email || business?.phone || ""}</p>
        </section>
        <section className="min-w-[210px] rounded-2xl bg-blue-50 p-5 sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{locale === "bn" ? "ইনভয়েস" : "Invoice"}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{invoice.invoiceNumber}</p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 sm:text-left">
            <span className="text-slate-500">{t("issueDate")}</span><span className="font-medium text-slate-800">{invoiceDate(invoice.issueDate, locale)}</span>
            <span className="text-slate-500">{t("dueDate")}</span><span className="font-medium text-slate-800">{invoiceDate(invoice.dueDate, locale)}</span>
          </div>
        </section>
      </div>

      <section className="mt-8 grid gap-7 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t("billTo")}</p>
          <h2 className="mt-3 text-base font-bold">{readText(customer.name, customer.nameBn, locale)}</h2>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{readText(customer.address, customer.addressBn, locale)}</p>
          <p className="mt-1 text-sm text-slate-600">{customer.email || customer.phone || ""}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t("status")}</p>
          <p className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold capitalize text-blue-800">{statusLabelText(invoice.status, locale)}</p>
        </div>
      </section>

      <div className="mt-9 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">{t("item")}</th><th className="px-4 py-3 text-right">{t("quantity")}</th><th className="px-4 py-3 text-right">{t("price")}</th><th className="px-4 py-3 text-right">{t("total")}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item: any) => <tr key={item.id}><td className="px-4 py-4"><p className="font-medium text-slate-900">{readText(item.name, item.nameBn, locale)}</p>{(item.description || item.descriptionBn) ? <p className="mt-1 text-xs text-slate-500">{readText(item.description, item.descriptionBn, locale)}</p> : null}</td><td className="px-4 py-4 text-right text-slate-600">{item.quantity}</td><td className="px-4 py-4 text-right text-slate-600">{money(item.unitPrice)}</td><td className="px-4 py-4 text-right font-semibold">{money(item.lineTotal)}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="mt-7 ml-auto w-full max-w-sm space-y-3 text-sm">
        <div className="flex justify-between text-slate-600"><span>{t("subtotal")}</span><span>{money(invoice.subtotal)}</span></div>
        <div className="flex justify-between text-slate-600"><span>{t("taxVat")} ({invoice.taxRate}%)</span><span>{money(invoice.taxAmount)}</span></div>
        <div className="flex justify-between text-slate-600"><span>{t("discount")}</span><span>− {money(invoice.discountAmount)}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-950"><span>{t("grandTotal")}</span><span>{money(invoice.totalAmount)}</span></div>
      </div>
      {invoice.notes ? <section className="mt-10 border-t border-slate-200 pt-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t("notes")}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{invoice.notes}</p></section> : null}
    </article>
  );
}

function statusLabelText(status: string, locale: Locale) {
  const labels = { en: { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" }, bn: { draft: "খসড়া", sent: "প্রেরিত", paid: "পরিশোধিত", overdue: "মেয়াদোত্তীর্ণ" } };
  return labels[locale === "bn" ? "bn" : "en"][status as keyof typeof labels.en] ?? status;
}
