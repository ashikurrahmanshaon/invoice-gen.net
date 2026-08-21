import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public SEO metadata", () => {
  it("exposes the invoice-gen.net title, description, canonical, and social metadata", () => {
    const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<title>invoice-gen.net — Simple invoicing for every business</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('name="theme-color" content="#155eef"');
    expect(html).toContain('rel="canonical" href="https://invoice-gen.net/"');
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('property="og:url" content="https://invoice-gen.net/"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:site_name" content="invoice-gen.net"');
    expect(html).toContain('name="twitter:card" content="summary"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('name="twitter:description"');
  });
});
