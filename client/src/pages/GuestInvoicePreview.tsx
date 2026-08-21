import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { createInvoicePdf } from "@/lib/invoicePdf";
import { startLogin } from "@/const";
import { ArrowLeft, Download, LogIn, Printer, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function GuestInvoicePreview() {
  const { locale } = useLocale();
  const [, navigate] = useLocation();
  const [data, setData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const bn = locale === "bn";
  useEffect(() => { const raw = window.sessionStorage.getItem("invoicegen-guest-invoice"); if (raw) { try { setData(JSON.parse(raw)); } catch { window.sessionStorage.removeItem("invoicegen-guest-invoice"); } } }, []);
  const exportPdf = async () => { const element = document.getElementById("invoice-print-area"); if (!element || !data) return; setIsExporting(true); try { const pdf = await createInvoicePdf(element); pdf.save(`${data.invoice.invoiceNumber}.pdf`); toast.success(bn ? "PDF download হচ্ছে" : "Invoice PDF is downloading"); } catch { toast.error(bn ? "PDF তৈরি করা যায়নি" : "Unable to create the PDF"); } finally { setIsExporting(false); } };
  if (!data) return <div className="min-h-screen bg-[#f7faff]"><PublicHeader /><main className="container max-w-3xl py-20"><h1 className="text-3xl font-black">{bn ? "Preview পাওয়া যায়নি" : "Preview not found"}</h1><p className="mt-3 text-slate-600">{bn ? "নতুন invoice তৈরি করে আবার চেষ্টা করুন।" : "Create a new guest invoice to continue."}</p><Button className="mt-6 bg-blue-700" onClick={() => navigate("/invoice-generator")}><ArrowLeft className="mr-2 h-4 w-4" />{bn ? "Invoice generator-এ ফিরুন" : "Back to invoice generator"}</Button></main><PublicFooter /></div>;
  return <div className="min-h-screen bg-[#f7faff] text-slate-950"><PublicHeader /><main className="container max-w-7xl py-10"><section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between print:hidden"><div><button onClick={() => navigate("/invoice-generator")} className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"><ArrowLeft className="h-4 w-4" />{bn ? "Edit invoice" : "Edit invoice"}</button><h1 className="mt-4 text-3xl font-black tracking-tight">{bn ? "আপনার invoice প্রস্তুত" : "Your invoice is ready"}</h1><p className="mt-2 text-slate-600">{bn ? "এটি sign-in ছাড়া তৈরি হয়েছে। Print বা PDF download করুন।" : "Created without sign-in. Print it or download a polished PDF."}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />{bn ? "Print" : "Print"}</Button><Button className="bg-blue-700 hover:bg-blue-800" onClick={exportPdf} disabled={isExporting}><Download className="mr-2 h-4 w-4" />{isExporting ? "PDF…" : "PDF"}</Button></div></section><div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]"><InvoiceDocument data={data} /><aside className="h-fit rounded-2xl border border-blue-100 bg-white p-6 shadow-sm print:hidden"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div><h2 className="mt-5 text-lg font-black">{bn ? "আরও powerful workflow চান?" : "Want a more powerful workflow?"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{bn ? "Sign in করলে invoice history, customer catalog, products এবং dashboard পাবেন।" : "Sign in to keep invoice history, customer catalogs, products, and a private dashboard."}</p><Button variant="outline" className="mt-5 w-full" onClick={startLogin}><LogIn className="mr-2 h-4 w-4" />{bn ? "Sign in করুন" : "Sign in"}</Button></aside></div></main><PublicFooter /></div>;
}
