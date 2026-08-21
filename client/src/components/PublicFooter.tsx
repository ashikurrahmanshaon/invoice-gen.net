import React from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Link } from "wouter";

export default function PublicFooter() {
  const { locale } = useLocale();
  const isBn = locale === "bn";
  const copy = isBn ? { tagline: "প্রতিটি ব্যবসার জন্য সহজ ইনভয়েসিং।", product: "প্রোডাক্ট", features: "ফিচার", workflow: "কীভাবে কাজ করে", app: "ড্যাশবোর্ড", resources: "রিসোর্স", blog: "ব্লগ", help: "সাহায্য", legal: "লিগ্যাল", privacy: "প্রাইভেসি", terms: "টার্মস", copyright: `© ${new Date().getFullYear()} invoice-gen.net। সর্বস্বত্ব সংরক্ষিত।` } : { tagline: "Simple invoicing for every business.", product: "Product", features: "Features", workflow: "How it works", app: "Dashboard", resources: "Resources", blog: "Blog", help: "Help center", legal: "Legal", privacy: "Privacy", terms: "Terms", copyright: `© ${new Date().getFullYear()} invoice-gen.net. All rights reserved.` };

  return <footer className="border-t border-slate-200 bg-white px-5 py-16 sm:px-8 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-xs font-black text-white shadow-lg shadow-blue-200">IF</span><span className="text-lg font-bold tracking-tight text-slate-950">invoice-gen.net</span></Link>
          <p className="mt-6 max-w-xs text-sm leading-6 text-slate-500">{copy.tagline}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{copy.product}</h3>
          <ul className="mt-6 space-y-4 text-sm font-medium text-slate-500">{[copy.features, copy.workflow, copy.app].map((label, i) => <li key={label}><a href={i === 2 ? "/app" : `/#${i === 0 ? "features" : "workflow"}`} className="transition hover:text-blue-700">{label}</a></li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{copy.resources}</h3>
          <ul className="mt-6 space-y-4 text-sm font-medium text-slate-500">{[copy.blog, copy.help].map((label, i) => <li key={label}><Link href={i === 0 ? "/blog" : "/"} className="transition hover:text-blue-700">{label}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{copy.legal}</h3>
          <ul className="mt-6 space-y-4 text-sm font-medium text-slate-500">{[copy.privacy, copy.terms].map((label) => <li key={label}><Link href="/" className="transition hover:text-blue-700">{label}</Link></li>)}</ul>
        </div>
      </div>
      <div className="mt-16 border-t border-slate-100 pt-8 text-xs font-medium text-slate-400 sm:flex sm:items-center sm:justify-between">
        <p>{copy.copyright}</p>
        <div className="mt-4 flex gap-6 sm:mt-0"><a href="#" className="hover:text-slate-600">Twitter</a><a href="#" className="hover:text-slate-600">LinkedIn</a><a href="#" className="hover:text-slate-600">GitHub</a></div>
      </div>
    </div>
  </footer>;
}
