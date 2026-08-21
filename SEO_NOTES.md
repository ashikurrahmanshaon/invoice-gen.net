# Public SEO implementation notes

The public blog and landing pages should follow Google Search Central guidance: use descriptive, human-readable URLs, make content useful and original, use clear headings and internal links, and provide canonical URLs for pages with stable primary addresses. Google notes that SEO changes can take weeks or months to affect search results and do not guarantee rankings.

For blog articles, Google supports Article/BlogPosting structured data with fields such as headline, author, datePublished, dateModified, image, and publisher. Structured data should describe visible page content, be validated before release, and be paired with crawlable canonical pages.

A sitemap can help a new site with few external links and helps crawlers discover important URLs. A robots.txt file controls crawler access but is not a security mechanism; private workspace routes should remain protected by authentication rather than relying on robots.txt.

Sources:

1. Google Search Central, SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
2. Google Search Central, Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
3. Google Search Central, Sitemaps overview: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
4. Google Search Central, Introduction to robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro

Implementation decisions: use /blog and /blog/:slug URLs; render article text in the page HTML; add BlogPosting JSON-LD to each article; add canonical and social metadata; include /blog and article URLs in sitemap.xml; allow public marketing/blog routes and keep /app and management routes behind authentication.
