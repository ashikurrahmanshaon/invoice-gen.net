import { describe, expect, it } from "vitest";
import { injectBlogMetadata } from "./_core/vite";

describe("blog HTML metadata delivery", () => {
  it("injects generator metadata into the initial HTML response template", () => {
    const template = `<!doctype html><html lang="en"><head><title>invoice-gen.net</title><meta name="description" content="Home" /><link rel="canonical" href="https://invoice-gen.net/" /><meta property="og:url" content="https://invoice-gen.net/" /><meta property="og:title" content="Home" /><meta property="og:description" content="Home" /><meta name="twitter:title" content="Home" /><meta name="twitter:description" content="Home" /></head><body><div id="root"></div></body></html>`;
    const html = injectBlogMetadata(template, "/invoice-generator");
    expect(html).toContain("Free Invoice Generator — Create Professional Invoices | invoice-gen.net");
    expect(html).toContain("https://invoice-gen.net/invoice-generator");
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"WebApplication"');
  });

  it("injects article metadata into the initial HTML response template", () => {
    const template = `<!doctype html><html lang="en"><head><title>invoice-gen.net</title><meta name="description" content="Home" /><link rel="canonical" href="https://invoice-gen.net/" /><meta property="og:url" content="https://invoice-gen.net/" /><meta property="og:title" content="Home" /><meta property="og:description" content="Home" /><meta name="twitter:title" content="Home" /><meta name="twitter:description" content="Home" /></head><body><div id="root"></div></body></html>`;
    const html = injectBlogMetadata(template, "/blog/professional-invoice-guide-small-business");
    expect(html).toContain("How to create a professional invoice for a small business | invoice-gen.net Blog");
    expect(html).toContain("https://invoice-gen.net/blog/professional-invoice-guide-small-business");
    expect(html).toContain('property="og:title" content="How to create a professional invoice for a small business | invoice-gen.net Blog"');
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"BlogPosting"');
  });
});
