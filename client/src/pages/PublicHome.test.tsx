// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";
import PublicHome from "./PublicHome";

describe("PublicHome", () => {
  beforeEach(() => localStorage.clear());

  it("renders the public English landing page without protected data queries", () => {
    render(<LocaleProvider><PublicHome /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: /Create polished invoices/i })).toBeInTheDocument();
    expect(screen.getByText("Everything you need to invoice clearly")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Get started free/i }).length).toBeGreaterThan(0);
  });

  it("renders Bengali copy and opens the mobile navigation menu", () => {
    localStorage.setItem("invoicegen-locale", "bn");
    render(<LocaleProvider><PublicHome /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: /সুন্দর ইনভয়েস তৈরি করুন/i })).toBeInTheDocument();
    const menu = screen.getByRole("button", { name: "মেনু খুলুন" });
    fireEvent.click(menu);
    expect(screen.getAllByRole("link", { name: "ফ্রি শুরু করুন" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Invoice তৈরি করুন" }).some((link) => link.getAttribute("href") === "/invoice-generator")).toBe(true);
    expect(menu).toHaveAttribute("aria-expanded", "true");
  });
});
