// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Blog from "./Blog";
import BlogPost from "./BlogPost";

function renderWithLocale(element: React.ReactNode) {
  return render(<LocaleProvider>{element}</LocaleProvider>);
}

describe("public blog", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/blog");
  });

  it("renders article cards and filters them by topic", () => {
    renderWithLocale(<Blog />);
    expect(screen.getByRole("heading", { name: /Practical ideas for clearer invoicing/i })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Cash flow" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText(/Payment terms that make cash flow easier/i)).toBeInTheDocument();
  });

  it("renders Bengali blog copy when the saved language is Bengali", () => {
    localStorage.setItem("invoicegen-locale", "bn");
    renderWithLocale(<Blog />);
    expect(screen.getByRole("heading", { name: /ইনভয়েসিং, cash flow ও ছোট ব্যবসার গাইড/i })).toBeInTheDocument();
    expect(screen.getByText("সব")).toBeInTheDocument();
  });

  it("renders an article with BlogPosting structured data", () => {
    window.history.pushState({}, "", "/blog/professional-invoice-guide-small-business");
    renderWithLocale(<BlogPost />);
    expect(screen.getByRole("heading", { name: /How to create a professional invoice/i })).toBeInTheDocument();
    expect(document.querySelector('script[type="application/ld+json"]')).toHaveTextContent("BlogPosting");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://invoice-gen.net/blog/professional-invoice-guide-small-business");
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute("content", "https://invoice-gen.net/blog/professional-invoice-guide-small-business");
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute("content", expect.stringContaining("How to create a professional invoice"));
  });
});
