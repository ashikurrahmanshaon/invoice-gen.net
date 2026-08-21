import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  createCustomer,
  createInvoice,
  createProduct,
  deleteCustomer,
  deleteProduct,
  getBusinessProfile,
  getInvoiceDetail,
  getNextInvoiceNumber,
  listCustomers,
  listInvoices,
  listProducts,
  updateCustomer,
  updateInvoice,
  updateInvoiceStatus,
  updateProduct,
  upsertBusinessProfile,
} from "./db";
import { sendInvoiceEmail } from "./invoice-email";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const nullableText = z.string().trim().max(1000).nullable().optional();
const customerInput = z.object({
  name: z.string().trim().min(1).max(180),
  nameBn: z.string().trim().max(180).nullable().optional(),
  address: nullableText,
  addressBn: nullableText,
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().max(320).nullable().optional(),
});
const productInput = z.object({
  name: z.string().trim().min(1).max(180),
  nameBn: z.string().trim().max(180).nullable().optional(),
  description: nullableText,
  descriptionBn: nullableText,
  unitPrice: z.number().int().min(0),
});
const invoiceItemInput = z.object({
  productId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).max(180),
  nameBn: z.string().trim().max(180).nullable().optional(),
  description: nullableText,
  descriptionBn: nullableText,
  quantity: z.number().int().min(1).max(100000),
  unitPrice: z.number().int().min(0),
});
const invoiceInput = z.object({
  invoiceNumber: z.string().trim().min(1).max(80),
  customerId: z.number().int().positive(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  taxRate: z.number().min(0).max(100),
  discountAmount: z.number().int().min(0),
  notes: nullableText,
  items: z.array(invoiceItemInput).min(1).max(100),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  business: router({
    get: protectedProcedure.query(({ ctx }) => getBusinessProfile(ctx.user.id)),
    save: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(180),
      nameBn: z.string().trim().max(180).nullable().optional(),
      address: nullableText,
      addressBn: nullableText,
      phone: z.string().trim().max(40).nullable().optional(),
      email: z.string().trim().email().max(320).nullable().optional(),
    })).mutation(({ ctx, input }) => upsertBusinessProfile(ctx.user.id, input)),
  }),
  customers: router({
    list: protectedProcedure.query(({ ctx }) => listCustomers(ctx.user.id)),
    create: protectedProcedure.input(customerInput).mutation(({ ctx, input }) => createCustomer(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: customerInput })).mutation(({ ctx, input }) => updateCustomer(ctx.user.id, input.id, input.data)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteCustomer(ctx.user.id, input.id)),
  }),
  products: router({
    list: protectedProcedure.query(({ ctx }) => listProducts(ctx.user.id)),
    create: protectedProcedure.input(productInput).mutation(({ ctx, input }) => createProduct(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: productInput })).mutation(({ ctx, input }) => updateProduct(ctx.user.id, input.id, input.data)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteProduct(ctx.user.id, input.id)),
  }),
  invoices: router({
    list: protectedProcedure.query(({ ctx }) => listInvoices(ctx.user.id)),
    nextNumber: protectedProcedure.query(({ ctx }) => getNextInvoiceNumber(ctx.user.id)),
    detail: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getInvoiceDetail(ctx.user.id, input.id)),
    create: protectedProcedure.input(invoiceInput).mutation(({ ctx, input }) => createInvoice(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: invoiceInput })).mutation(({ ctx, input }) => updateInvoice(ctx.user.id, input.id, input.data)),
    updateStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "sent", "paid", "overdue"]) })).mutation(({ ctx, input }) => updateInvoiceStatus(ctx.user.id, input.id, input.status)),
    sendEmail: protectedProcedure.input(z.object({ id: z.number().int().positive(), locale: z.enum(["en", "bn"]), pdfBase64: z.string().min(100).max(12_000_000) })).mutation(({ ctx, input }) => sendInvoiceEmail(ctx.user.id, input.id, input.pdfBase64, input.locale)),
  }),
});

export type AppRouter = typeof appRouter;
