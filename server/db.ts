import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  businessProfiles,
  customers,
  invoiceItems,
  invoiceStatusHistory,
  invoices,
  products,
  type InsertUser,
  type InvoiceStatus,
  users,
} from "../drizzle/schema";
import { calculateInvoiceTotals, type InvoiceItemInput } from "../shared/invoice";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await requireDb();
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type CustomerPayload = {
  name: string;
  nameBn?: string | null;
  address?: string | null;
  addressBn?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type ProductPayload = {
  name: string;
  nameBn?: string | null;
  description?: string | null;
  descriptionBn?: string | null;
  unitPrice: number;
};

export type BusinessProfilePayload = {
  name: string;
  nameBn?: string | null;
  address?: string | null;
  addressBn?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type InvoicePayload = {
  invoiceNumber: string;
  customerId: number;
  currencyCode: string;
  issueDate: Date;
  dueDate?: Date | null;
  taxRate: number;
  discountAmount: number;
  notes?: string | null;
  items: Array<InvoiceItemInput & { productId?: number | null; nameBn?: string | null; description?: string | null; descriptionBn?: string | null }>;
};

async function requireCustomer(userId: number, customerId: number) {
  const db = await requireDb();
  const rows = await db.select().from(customers).where(and(eq(customers.id, customerId), eq(customers.userId, userId))).limit(1);
  if (!rows[0]) throw new Error("Customer not found.");
  return rows[0];
}

async function requireProduct(userId: number, productId: number) {
  const db = await requireDb();
  const rows = await db.select().from(products).where(and(eq(products.id, productId), eq(products.userId, userId))).limit(1);
  if (!rows[0]) throw new Error("Product not found.");
  return rows[0];
}

async function requireInvoice(userId: number, invoiceId: number) {
  const db = await requireDb();
  const rows = await db.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId))).limit(1);
  if (!rows[0]) throw new Error("Invoice not found.");
  return rows[0];
}

export async function listCustomers(userId: number) {
  const db = await requireDb();
  return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
}

export async function createCustomer(userId: number, data: CustomerPayload) {
  const db = await requireDb();
  const result = await db.insert(customers).values({ userId, ...data });
  return Number(result[0].insertId);
}

export async function updateCustomer(userId: number, customerId: number, data: CustomerPayload) {
  await requireCustomer(userId, customerId);
  const db = await requireDb();
  await db.update(customers).set(data).where(and(eq(customers.id, customerId), eq(customers.userId, userId)));
  return customerId;
}

export async function deleteCustomer(userId: number, customerId: number) {
  await requireCustomer(userId, customerId);
  const db = await requireDb();
  const linkedInvoices = await db.select({ id: invoices.id }).from(invoices).where(and(eq(invoices.customerId, customerId), eq(invoices.userId, userId))).limit(1);
  if (linkedInvoices[0]) throw new Error("A customer with existing invoices cannot be deleted.");
  await db.delete(customers).where(and(eq(customers.id, customerId), eq(customers.userId, userId)));
  return customerId;
}

export async function listProducts(userId: number) {
  const db = await requireDb();
  return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
}

export async function createProduct(userId: number, data: ProductPayload) {
  const db = await requireDb();
  const result = await db.insert(products).values({ userId, ...data });
  return Number(result[0].insertId);
}

export async function updateProduct(userId: number, productId: number, data: ProductPayload) {
  await requireProduct(userId, productId);
  const db = await requireDb();
  await db.update(products).set(data).where(and(eq(products.id, productId), eq(products.userId, userId)));
  return productId;
}

export async function deleteProduct(userId: number, productId: number) {
  await requireProduct(userId, productId);
  const db = await requireDb();
  await db.delete(products).where(and(eq(products.id, productId), eq(products.userId, userId)));
  return productId;
}

export async function getBusinessProfile(userId: number) {
  const db = await requireDb();
  const result = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertBusinessProfile(userId: number, data: BusinessProfilePayload) {
  const db = await requireDb();
  await db.insert(businessProfiles).values({ userId, ...data }).onDuplicateKeyUpdate({ set: data });
  return getBusinessProfile(userId);
}

export async function listInvoices(userId: number) {
  const db = await requireDb();
  return db
    .select({ invoice: invoices, customer: customers })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function getNextInvoiceNumber(userId: number) {
  const db = await requireDb();
  const existing = await db.select({ id: invoices.id }).from(invoices).where(eq(invoices.userId, userId));
  const stamp = new Date().toISOString().slice(0, 7).replace("-", "");
  return `INV-${stamp}-${String(existing.length + 1).padStart(3, "0")}`;
}

export async function getInvoiceDetail(userId: number, invoiceId: number) {
  const db = await requireDb();
  const rows = await db
    .select({ invoice: invoices, customer: customers })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);
  if (!rows[0]) throw new Error("Invoice not found.");

  const [items, history, business] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)).orderBy(invoiceItems.id),
    db.select().from(invoiceStatusHistory).where(eq(invoiceStatusHistory.invoiceId, invoiceId)).orderBy(desc(invoiceStatusHistory.changedAt)),
    getBusinessProfile(userId),
  ]);

  return { ...rows[0], items, history, business };
}

export async function createInvoice(userId: number, data: InvoicePayload) {
  await requireCustomer(userId, data.customerId);
  const db = await requireDb();
  const totals = calculateInvoiceTotals(data.items, data.taxRate, data.discountAmount);
  const result = await db.insert(invoices).values({
    userId,
    customerId: data.customerId,
    currencyCode: data.currencyCode,
    invoiceNumber: data.invoiceNumber,
    issueDate: data.issueDate,
    dueDate: data.dueDate ?? null,
    taxRate: Math.round(data.taxRate),
    discountAmount: totals.discountAmount,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount,
    notes: data.notes ?? null,
  });
  const invoiceId = Number(result[0].insertId);
  await db.insert(invoiceItems).values(data.items.map((item) => ({
    invoiceId,
    productId: item.productId ?? null,
    name: item.name,
    nameBn: item.nameBn ?? null,
    description: item.description ?? null,
    descriptionBn: item.descriptionBn ?? null,
    quantity: Math.round(item.quantity),
    unitPrice: Math.round(item.unitPrice),
    lineTotal: Math.round(item.quantity * item.unitPrice),
  })));
  await db.insert(invoiceStatusHistory).values({ invoiceId, userId, status: "draft" });
  return invoiceId;
}

export async function updateInvoice(userId: number, invoiceId: number, data: InvoicePayload) {
  await Promise.all([requireInvoice(userId, invoiceId), requireCustomer(userId, data.customerId)]);
  const db = await requireDb();
  const totals = calculateInvoiceTotals(data.items, data.taxRate, data.discountAmount);
  await db.update(invoices).set({
    customerId: data.customerId,
    currencyCode: data.currencyCode,
    invoiceNumber: data.invoiceNumber,
    issueDate: data.issueDate,
    dueDate: data.dueDate ?? null,
    taxRate: Math.round(data.taxRate),
    discountAmount: totals.discountAmount,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount,
    notes: data.notes ?? null,
  }).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  await db.insert(invoiceItems).values(data.items.map((item) => ({
    invoiceId,
    productId: item.productId ?? null,
    name: item.name,
    nameBn: item.nameBn ?? null,
    description: item.description ?? null,
    descriptionBn: item.descriptionBn ?? null,
    quantity: Math.round(item.quantity),
    unitPrice: Math.round(item.unitPrice),
    lineTotal: Math.round(item.quantity * item.unitPrice),
  })));
  return invoiceId;
}

export async function updateInvoiceStatus(userId: number, invoiceId: number, status: InvoiceStatus) {
  const existing = await requireInvoice(userId, invoiceId);
  const db = await requireDb();
  const now = new Date();
  const timestampUpdate = status === "sent" ? { sentAt: now } : status === "paid" ? { paidAt: now } : status === "overdue" ? { overdueAt: now } : {};
  await db.update(invoices).set({ status, ...timestampUpdate }).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
  await db.insert(invoiceStatusHistory).values({ invoiceId, userId, previousStatus: existing.status, status, changedAt: now });
  return invoiceId;
}
