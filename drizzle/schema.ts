import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the authenticated workspace. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const businessProfiles = mysqlTable(
  "businessProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    nameBn: varchar("nameBn", { length: 180 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    address: text("address"),
    addressBn: text("addressBn"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("business_profiles_user_unique").on(table.userId)],
);

export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    nameBn: varchar("nameBn", { length: 180 }),
    address: text("address"),
    addressBn: text("addressBn"),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("customers_user_idx").on(table.userId)],
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    nameBn: varchar("nameBn", { length: 180 }),
    description: text("description"),
    descriptionBn: text("descriptionBn"),
    unitPrice: int("unitPrice").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("products_user_idx").on(table.userId)],
);

const invoiceStatusValues = ["draft", "sent", "paid", "overdue"] as const;

export const invoices = mysqlTable(
  "invoices",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    customerId: int("customerId").notNull(),
    invoiceNumber: varchar("invoiceNumber", { length: 80 }).notNull(),
    issueDate: timestamp("issueDate").notNull(),
    dueDate: timestamp("dueDate"),
    status: mysqlEnum("status", invoiceStatusValues).notNull().default("draft"),
    subtotal: int("subtotal").notNull().default(0),
    taxRate: int("taxRate").notNull().default(0),
    taxAmount: int("taxAmount").notNull().default(0),
    discountAmount: int("discountAmount").notNull().default(0),
    totalAmount: int("totalAmount").notNull().default(0),
    notes: text("notes"),
    sentAt: timestamp("sentAt"),
    paidAt: timestamp("paidAt"),
    overdueAt: timestamp("overdueAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("invoices_user_idx").on(table.userId),
    index("invoices_customer_idx").on(table.customerId),
    index("invoices_status_idx").on(table.userId, table.status),
    uniqueIndex("invoices_user_number_unique").on(table.userId, table.invoiceNumber),
  ],
);

export const invoiceItems = mysqlTable(
  "invoiceItems",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId").notNull(),
    productId: int("productId"),
    name: varchar("name", { length: 180 }).notNull(),
    nameBn: varchar("nameBn", { length: 180 }),
    description: text("description"),
    descriptionBn: text("descriptionBn"),
    quantity: int("quantity").notNull(),
    unitPrice: int("unitPrice").notNull(),
    lineTotal: int("lineTotal").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("invoice_items_invoice_idx").on(table.invoiceId)],
);

export const invoiceStatusHistory = mysqlTable(
  "invoiceStatusHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId").notNull(),
    userId: int("userId").notNull(),
    previousStatus: mysqlEnum("previousStatus", invoiceStatusValues),
    status: mysqlEnum("status", invoiceStatusValues).notNull(),
    changedAt: timestamp("changedAt").defaultNow().notNull(),
  },
  (table) => [index("invoice_status_history_invoice_idx").on(table.invoiceId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
