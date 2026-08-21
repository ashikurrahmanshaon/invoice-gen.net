import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("protected invoice procedures", () => {
  it("rejects invoice data access without an authenticated user", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    await expect(appRouter.createCaller(ctx).invoices.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
