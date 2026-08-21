import React, { useEffect } from "react";
import { ArrowLeft, CalendarDays, Clock3, Globe2, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { useLocale } from "@/contexts/LocaleContext";
import { getBlogPost } from "@/lib/blogContent";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const { locale } = useLocale();
  const isBn = locale === "bn";
  const post = getBlogPost(params?.slug || "");

  useEffect(() => {
    if (!post) return;
    const title = `${post.title[isBn ? "bn" : "en"]} | invoice-gen.net Blog`;
    const description = post.excerpt[isBn ? "bn" : "en"];
    const url = `https://invoice-gen.net/blog/${post.slug}`;
    document.title = title;
    const setMeta = (selector: string, attribute: "name" | "property", key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };
    const setCanonical = () => {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    };
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setCanonical();
  }, [post, isBn]);

  if (!post) return <div className="min-h-screen bg-[#f7faff] text-slate-950"><PublicHeader /><main className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Post not found</h1><Link href="/blog" className="mt-4 inline-block text-blue-700 font-bold">Back to blog</Link></div></main><PublicFooter /></div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title[isBn ? "bn" : "en"],
    "description": post.excerpt[isBn ? "bn" : "en"],
    "datePublished": post.published,
    "author": { "@type": "Organization", "name": "invoice-gen.net", "url": "https://invoice-gen.net" },
    "publisher": { "@type": "Organization", "name": "invoice-gen.net", "logo": { "@type": "ImageObject", "url": "https://invoice-gen.net/favicon.ico" } },
  };

  return <div className="min-h-screen bg-[#f7faff] text-slate-950"><PublicHeader />
    <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"><ArrowLeft className="h-4 w-4" />{isBn ? "ব্লগে ফিরে যান" : "Back to blog"}</Link>
      <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-blue-100/50">
        <div className="bg-slate-950 p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">{post.category}</p>
          <h1 className="mt-6 text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">{post.title[isBn ? "bn" : "en"]}</h1>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-400">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{post.published}</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{post.readTime}</span>
            <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4" />{isBn ? "বাংলা ও English" : "Bilingual"}</span>
          </div>
        </div>
        <div className="px-8 py-10 sm:px-12 sm:py-16">
          <p className="text-lg font-bold leading-relaxed text-slate-900 sm:text-xl">{post.intro[isBn ? "bn" : "en"]}</p>
          <div className="mt-12 space-y-12">
            {post.sections.map((section, i) => <section key={i}>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{section.heading[isBn ? "bn" : "en"]}</h2>
              <div className="mt-6 space-y-6 text-base leading-8 text-slate-600 sm:text-lg">{section.paragraphs[isBn ? "bn" : "en"].map((p, j) => <p key={j}>{p}</p>)}</div>
            </section>)}
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-10 sm:flex-row">
            <div className="flex items-center gap-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-xs font-black text-white">IF</div><div><p className="text-sm font-bold text-slate-950">invoice-gen.net</p><p className="text-xs text-slate-500">{isBn ? "প্রতিটি ব্যবসার জন্য সহজ ইনভয়েসিং।" : "Simple invoicing for every business."}</p></div></div>
            <button onClick={() => { navigator.share?.({ title: post.title[isBn ? "bn" : "en"], url: window.location.href }).catch(() => {}); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"><Share2 className="h-4 w-4" />{isBn ? "শেয়ার করুন" : "Share guide"}</button>
          </div>
        </div>
      </article>
      <div className="mt-12 rounded-[2rem] bg-blue-700 p-8 text-white shadow-xl shadow-blue-200 sm:p-12">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{isBn ? "ইনভয়েসিংকে আরও সহজ করুন" : "Make invoicing feel lighter"}</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">{isBn ? "ছোট ব্যবসার বাস্তব billing workflow-এর জন্য তৈরি একটি পরিষ্কার workspace দিয়ে শুরু করুন।" : "Start with a clean workspace built for the way small businesses actually bill."}</p>
        <Link href="/app" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-800 transition hover:-translate-y-0.5 hover:bg-blue-50">{isBn ? "ফ্রি শুরু করুন" : "Get started free"}</Link>
      </div>
    </main><PublicFooter /></div>;
}
