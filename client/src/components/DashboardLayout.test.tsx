/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const navigate = vi.hoisted(() => vi.fn());
class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ loading: false, user: { name: "Ayesha", email: "ayesha@example.com" }, logout: vi.fn() }) }));
vi.mock("@/hooks/useMobile", () => ({ useIsMobile: () => false }));
vi.mock("wouter", () => ({ useLocation: () => ["/", navigate] }));

import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout", () => {
  afterEach(() => { cleanup(); navigate.mockClear(); });

  it("reaches sidebar controls in order through Tab and routes an Invoices control activated with Enter", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><DashboardLayout><div>Workspace</div></DashboardLayout></LocaleProvider>);
    const brand = screen.getByRole("button", { name: /invoice-gen\.net/ });
    const dashboard = screen.getByRole("button", { name: "Dashboard" });
    const invoices = screen.getByRole("button", { name: "Invoices" });
    await user.tab();
    expect(brand).toHaveFocus();
    await user.tab();
    expect(dashboard).toHaveFocus();
    await user.tab();
    expect(invoices).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(navigate).toHaveBeenCalledWith("/invoices");
  });

  it("routes an Invoices control activated with Space", async () => {
    const user = userEvent.setup();
    render(<LocaleProvider><DashboardLayout><div>Workspace</div></DashboardLayout></LocaleProvider>);
    const invoices = screen.getByRole("button", { name: "Invoices" });
    invoices.focus();
    await user.keyboard(" ");
    expect(navigate).toHaveBeenCalledWith("/invoices");
  });
});
