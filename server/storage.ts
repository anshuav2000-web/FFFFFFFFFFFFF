import {
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Contact, type InsertContact,
  type Deal, type InsertDeal,
  type CallLog, type InsertCallLog,
  type Task, type InsertTask,
  type Webhook, type InsertWebhook,
  type Activity, type InsertActivity,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type Payment, type InsertPayment,
  type Expense, type InsertExpense,
  type Service, type InsertService,
  type Setting, type InsertSetting,
  users, leads, contacts, deals, callLogs, tasks, webhooks, activities,
  invoices, invoiceItems, payments, expenses, services, settings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<void>;

  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<void>;

  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, data: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<void>;

  getCallLogs(): Promise<CallLog[]>;
  getCallLog(id: string): Promise<CallLog | undefined>;
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  updateCallLog(id: string, data: Partial<InsertCallLog>): Promise<CallLog | undefined>;
  deleteCallLog(id: string): Promise<void>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getWebhooks(): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, data: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<void>;

  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<void>;

  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, data: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: string): Promise<void>;
  deleteInvoiceItemsByInvoiceId(invoiceId: string): Promise<void>;

  getPayments(): Promise<Payment[]>;
  getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<void>;

  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<void>;

  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getLeads() {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }
  async getLead(id: string) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  async createLead(lead: InsertLead) {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }
  async updateLead(id: string, data: Partial<InsertLead>) {
    const [updated] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return updated;
  }
  async deleteLead(id: string) {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getContacts() {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
  async getContact(id: string) {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  async createContact(contact: InsertContact) {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }
  async updateContact(id: string, data: Partial<InsertContact>) {
    const [updated] = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return updated;
  }
  async deleteContact(id: string) {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getDeals() {
    return db.select().from(deals).orderBy(desc(deals.createdAt));
  }
  async getDeal(id: string) {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }
  async createDeal(deal: InsertDeal) {
    const [created] = await db.insert(deals).values(deal).returning();
    return created;
  }
  async updateDeal(id: string, data: Partial<InsertDeal>) {
    const [updated] = await db.update(deals).set(data).where(eq(deals.id, id)).returning();
    return updated;
  }
  async deleteDeal(id: string) {
    await db.delete(deals).where(eq(deals.id, id));
  }

  async getCallLogs() {
    return db.select().from(callLogs).orderBy(desc(callLogs.createdAt));
  }
  async getCallLog(id: string) {
    const [cl] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return cl;
  }
  async createCallLog(callLog: InsertCallLog) {
    const [created] = await db.insert(callLogs).values(callLog).returning();
    return created;
  }
  async updateCallLog(id: string, data: Partial<InsertCallLog>) {
    const [updated] = await db.update(callLogs).set(data).where(eq(callLogs.id, id)).returning();
    return updated;
  }
  async deleteCallLog(id: string) {
    await db.delete(callLogs).where(eq(callLogs.id, id));
  }

  async getTasks() {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  async getTask(id: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  async createTask(task: InsertTask) {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }
  async updateTask(id: string, data: Partial<InsertTask>) {
    const [updated] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return updated;
  }
  async deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getWebhooks() {
    return db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
  }
  async getWebhook(id: string) {
    const [wh] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return wh;
  }
  async createWebhook(webhook: InsertWebhook) {
    const [created] = await db.insert(webhooks).values(webhook).returning();
    return created;
  }
  async updateWebhook(id: string, data: Partial<InsertWebhook>) {
    const [updated] = await db.update(webhooks).set(data).where(eq(webhooks.id, id)).returning();
    return updated;
  }
  async deleteWebhook(id: string) {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }

  async getActivities() {
    return db.select().from(activities).orderBy(desc(activities.createdAt));
  }
  async createActivity(activity: InsertActivity) {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }

  async getInvoices() {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }
  async getInvoice(id: string) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  async createInvoice(invoice: InsertInvoice) {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }
  async updateInvoice(id: string, data: Partial<InsertInvoice>) {
    const [updated] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return updated;
  }
  async deleteInvoice(id: string) {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(payments).where(eq(payments.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getInvoiceItems(invoiceId: string) {
    return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
  async createInvoiceItem(item: InsertInvoiceItem) {
    const [created] = await db.insert(invoiceItems).values(item).returning();
    return created;
  }
  async updateInvoiceItem(id: string, data: Partial<InsertInvoiceItem>) {
    const [updated] = await db.update(invoiceItems).set(data).where(eq(invoiceItems.id, id)).returning();
    return updated;
  }
  async deleteInvoiceItem(id: string) {
    await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
  }
  async deleteInvoiceItemsByInvoiceId(invoiceId: string) {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async getPayments() {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }
  async getPaymentsByInvoiceId(invoiceId: string) {
    return db.select().from(payments).where(eq(payments.invoiceId, invoiceId)).orderBy(desc(payments.createdAt));
  }
  async getPayment(id: string) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  async createPayment(payment: InsertPayment) {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }
  async updatePayment(id: string, data: Partial<InsertPayment>) {
    const [updated] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return updated;
  }
  async deletePayment(id: string) {
    await db.delete(payments).where(eq(payments.id, id));
  }

  async getExpenses() {
    return db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }
  async getExpense(id: string) {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }
  async createExpense(expense: InsertExpense) {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }
  async updateExpense(id: string, data: Partial<InsertExpense>) {
    const [updated] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return updated;
  }
  async deleteExpense(id: string) {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getServices() {
    return db.select().from(services).orderBy(desc(services.createdAt));
  }
  async getService(id: string) {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  async createService(service: InsertService) {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }
  async updateService(id: string, data: Partial<InsertService>) {
    const [updated] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return updated;
  }
  async deleteService(id: string) {
    await db.delete(services).where(eq(services.id, id));
  }

  async getSettings() {
    return db.select().from(settings);
  }
  async getSetting(key: string) {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }
  async upsertSetting(key: string, value: string) {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return updated;
    }
    const [created] = await db.insert(settings).values({ key, value }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
