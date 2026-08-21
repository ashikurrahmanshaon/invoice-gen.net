import { InvoiceDocument } from "@/components/InvoiceDocument";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { createInvoicePdf } from "@/lib/invoicePdf";
import { ArrowLeft, Download, Printer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function TemporaryInvoice() {
  const { t, locale } = useLocale();
  const [, navigate] = useLocation();
  const [data, setData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => { const raw = window.sessionStorage.getItem("invoicegen-temporary-invoice"); if (raw) { try { setData(JSON.parse(raw)); } catch { window.sessionStorage.removeItem("invoicegen-temporary-invoice"); } } }, []);
  const exportPdf = async () => { const element = document.getElementById("invoice-print-area"); if (!element) return; setIsExporting(true); try { const pdf = await createInvoicePdf(element); pdf.save(`${data.invoice.invoiceNumber}.pdf`); toast.success(locale === "bn" ? "PDF ডাউনলোড হচ্ছে" : "Invoice PDF is downloading"); } catch { toast.error(locale === "bn" ? "PDF তৈরি করা যায়নি" : "Unable to create the PDF"); } finally { setIsExporting(false); } };
  if (!data) return <div className="container max-w-4xl py-12"><Button variant="outline" onClick={() => navigate("/invoices/new")}><ArrowLeft className="mr-2 h-4 w-4" />{t("generateTemporary")}</Button><p className="mt-6 text-sm text-slate-500">{locale === "bn" ? "অস্থায়ী ইনভয়েসের ডেটা পাওয়া যায়নি।" : "No temporary invoice is available in this browser session."}</p></div>;
  return <div className="container max-w-7xl"><section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden"><div><button onClick={() => navigate("/invoices/new")} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"><ArrowLeft className="h-4 w-4" />{t("createInvoice")}</button><h1 className="text-3xl font-bold tracking-tight text-slate-950">{t("temporaryInvoice")}</h1><p className="mt-2 text-sm text-slate-500">{locale === "bn" ? "এই ইনভয়েসটি সংরক্ষিত গ্রাহক ছাড়াই তৈরি হয়েছে।" : "This invoice is temporary and has not created a customer record."}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />{t("printPdf")}</Button><Button className="bg-blue-700 hover:bg-blue-800" disabled={isExporting} onClick={exportPdf}><Download className="mr-2 h-4 w-4" />{isExporting ? "PDF…" : "PDF"}</Button></div></section><InvoiceDocument data={data} /></div>;
}
