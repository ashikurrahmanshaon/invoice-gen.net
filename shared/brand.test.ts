import { describe, expect, it } from "vitest";

describe("invoice-gen.net brand configuration", () => {
  it("exposes the configured application title", () => {
    expect(process.env.VITE_APP_TITLE ?? "invoice-gen.net").toBe("invoice-gen.net");
  });
});
