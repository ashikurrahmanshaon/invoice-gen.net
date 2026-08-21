import fs from "fs";
import express, { type NextFunction, type Request, type Response } from "express";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getBlogPost } from "../../client/src/lib/blogContent";

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[character] || character));
}

function getBlogSlug(url: string) {
  const pathname = url.split("?")[0];
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function injectBlogMetadata(template: string, url: string) {
  const slug = getBlogSlug(url);
  const post = slug ? getBlogPost(slug) : undefined;
  if (!post) return template;

  const title = `${post.title.en} | invoice-gen.net Blog`;
  const description = post.excerpt.en;
  const canonical = `https://invoice-gen.net/blog/${post.slug}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.en,
    description,
    datePublished: post.published,
    author: { "@type": "Organization", name: "invoice-gen.net", url: "https://invoice-gen.net" },
    publisher: { "@type": "Organization", name: "invoice-gen.net", logo: { "@type": "ImageObject", url: "https://invoice-gen.net/favicon.ico" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  });

  let page = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  return page.replace("</head>", `<script type="application/ld+json">${jsonLd}</script></head>`);
}

export async function setupVite(app: express.Express, server: Server) {
  const serverOptions = { middlewareMode: true, hmr: { server }, allowedHosts: true as const };
  const vite = await createViteServer({ ...viteConfig, configFile: false, server: serverOptions, appType: "custom" });

  app.use(vite.middlewares);
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = injectBlogMetadata(template, url).replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: express.Express) {
  const distPath = process.env.NODE_ENV === "development" ? path.resolve(import.meta.dirname, "../..", "dist", "public") : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) console.error(`Could not find the build directory: ${distPath}, make sure the client is built first`);
  app.use(express.static(distPath));
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const template = await fs.promises.readFile(indexPath, "utf-8");
      res.status(200).type("html").send(injectBlogMetadata(template, req.originalUrl));
    } catch (error) {
      next(error);
    }
  });
}
