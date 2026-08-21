/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "./LocaleContext";

function LanguageProbe() {
  const { locale, t, toggleLocale } = useLocale();
  return <button onClick={toggleLocale}>{locale}: {t("invoices")}</button>;
}

describe("LocaleProvider", () => {
  it("switches the visible UI labels between English and Bangla", () => {
    localStorage.clear();
    render(<LocaleProvider><LanguageProbe /></LocaleProvider>);
    expect(screen.getByRole("button")).toHaveTextContent("en: Invoices");
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("bn: ইনভয়েস");
  });
});
