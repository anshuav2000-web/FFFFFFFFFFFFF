import {
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Contact, type InsertContact,
  type Deal, type InsertDeal,
  type CallLog, type InsertCallLog,
  type Task, type InsertTask,
  type Webhook, type InsertWebhook,
  type Activity, type InsertActivity,
  users, leads, contacts, deals, callLogs, tasks, webhooks, activities,
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
}

export const storage = new DatabaseStorage();
