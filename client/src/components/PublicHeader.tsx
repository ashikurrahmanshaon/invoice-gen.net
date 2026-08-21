import React, { useState } from "react";
import { startLogin } from "@/const";
import { useLocale } from "@/contexts/LocaleContext";
import { ArrowRight, Globe2, Menu, X } from "lucide-react";
import { Link } from "wouter";

export default function PublicHeader() {
  const { locale, toggleLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const isBn = locale === "bn";
  const copy = isBn ? { features: "ফিচার", workflow: "কীভাবে কাজ করে", blog: "ব্লগ", signIn: "সাইন ইন", start: "ফ্রি শুরু করুন", menu: "মেনু খুলুন", home: "invoice-gen.net home" } : { features: "Features", workflow: "How it works", blog: "Blog", signIn: "Sign in", start: "Get started free", menu: "Open menu", home: "invoice-gen.net home" };

  const close = () => setOpen(false);
  return <header className="relative z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3" aria-label={copy.home} onClick={close}><span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-blue-700 text-sm font-black text-white shadow-lg shadow-blue-200"><span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-300/80" />IF</span><span className="text-lg font-bold tracking-tight text-slate-950">invoice-gen.net</span></Link>
      <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Primary navigation"><a href="/#features" className="transition hover:text-blue-700">{copy.features}</a><a href="/#workflow" className="transition hover:text-blue-700">{copy.workflow}</a><Link href="/blog" className="transition hover:text-blue-700">{copy.blog}</Link></nav>
      <div className="hidden items-center gap-2 md:flex"><button onClick={toggleLocale} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700" aria-label={isBn ? "Switch to English" : "বাংলায় দেখুন"}><Globe2 className="h-4 w-4" />{isBn ? "EN" : "বাংলা"}</button><button onClick={startLogin} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">{copy.signIn}</button><button onClick={startLogin} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800">{copy.start}<ArrowRight className="h-4 w-4" /></button></div>
      <button className="rounded-lg p-2 text-slate-700 md:hidden" aria-label={copy.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    {open ? <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden" aria-label="Mobile navigation"><div className="grid gap-1.5"><a href="/#features" onClick={close} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{copy.features}</a><a href="/#workflow" onClick={close} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{copy.workflow}</a><Link href="/blog" onClick={close} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{copy.blog}</Link><div className="mt-2 flex gap-2"><button onClick={toggleLocale} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"><Globe2 className="h-4 w-4" />{isBn ? "English" : "বাংলা"}</button><button onClick={startLogin} className="flex-1 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-bold text-white">{copy.start}</button></div></div></nav> : null}
  </header>;
}
