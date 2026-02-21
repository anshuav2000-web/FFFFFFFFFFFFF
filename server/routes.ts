import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { log } from "./index";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ========== LEADS ==========
  app.get("/api/leads", async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.get("/api/leads/:id", async (req, res) => {
    const lead = await storage.getLead(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const lead = await storage.createLead(req.body);
      await storage.createActivity({
        type: "lead_created",
        description: `New lead created: ${lead.name}`,
        entityType: "lead",
        entityId: lead.id,
      });
      res.status(201).json(lead);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    await storage.deleteLead(req.params.id);
    res.status(204).send();
  });

  // ========== CONTACTS ==========
  app.get("/api/contacts", async (_req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = await storage.createContact(req.body);
      await storage.createActivity({
        type: "contact_created",
        description: `New contact added: ${contact.name}`,
        entityType: "contact",
        entityId: contact.id,
      });
      res.status(201).json(contact);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.id, req.body);
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json(contact);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    await storage.deleteContact(req.params.id);
    res.status(204).send();
  });

  // ========== DEALS ==========
  app.get("/api/deals", async (_req, res) => {
    const deals = await storage.getDeals();
    res.json(deals);
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const deal = await storage.createDeal(req.body);
      await storage.createActivity({
        type: "deal_created",
        description: `New deal created: ${deal.title} (₹${deal.value?.toLocaleString("en-IN") || 0})`,
        entityType: "deal",
        entityId: deal.id,
      });
      res.status(201).json(deal);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.updateDeal(req.params.id, req.body);
      if (!deal) return res.status(404).json({ message: "Deal not found" });
      res.json(deal);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    await storage.deleteDeal(req.params.id);
    res.status(204).send();
  });

  // ========== CALL LOGS ==========
  app.get("/api/call-logs", async (_req, res) => {
    const logs = await storage.getCallLogs();
    res.json(logs);
  });

  app.post("/api/call-logs", async (req, res) => {
    try {
      const cl = await storage.createCallLog(req.body);
      await storage.createActivity({
        type: "call_logged",
        description: `Call logged: ${cl.outcome} ${cl.calledBy ? `by ${cl.calledBy}` : ""}`,
        entityType: "call_log",
        entityId: cl.id,
      });
      res.status(201).json(cl);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/call-logs/:id", async (req, res) => {
    try {
      const cl = await storage.updateCallLog(req.params.id, req.body);
      if (!cl) return res.status(404).json({ message: "Call log not found" });
      res.json(cl);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/call-logs/:id", async (req, res) => {
    await storage.deleteCallLog(req.params.id);
    res.status(204).send();
  });

  // ========== TASKS ==========
  app.get("/api/tasks", async (_req, res) => {
    const allTasks = await storage.getTasks();
    res.json(allTasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await storage.createTask(req.body);
      res.status(201).json(task);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.status(204).send();
  });

  // ========== WEBHOOKS ==========
  app.get("/api/webhooks", async (_req, res) => {
    const wh = await storage.getWebhooks();
    res.json(wh);
  });

  app.post("/api/webhooks", async (req, res) => {
    try {
      const wh = await storage.createWebhook(req.body);
      res.status(201).json(wh);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/webhooks/:id", async (req, res) => {
    try {
      const wh = await storage.updateWebhook(req.params.id, req.body);
      if (!wh) return res.status(404).json({ message: "Webhook not found" });
      res.json(wh);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    await storage.deleteWebhook(req.params.id);
    res.status(204).send();
  });

  // ========== N8N WEBHOOK ENDPOINT ==========
  app.post("/api/webhook/n8n/:webhookId", async (req, res) => {
    try {
      const webhook = await storage.getWebhook(req.params.webhookId);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }
      if (!webhook.isActive) {
        return res.status(403).json({ message: "Webhook is inactive" });
      }

      const { name, email, phone, company, source, notes, value, tags } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const lead = await storage.createLead({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source: source || "n8n_webhook",
        status: "new",
        notes: notes || null,
        value: value ? parseInt(value) : 0,
        tags: tags || [],
        assignedTo: null,
      });

      await storage.createActivity({
        type: "lead_created_webhook",
        description: `Lead "${lead.name}" created via n8n webhook "${webhook.name}"`,
        entityType: "lead",
        entityId: lead.id,
      });

      log(`n8n webhook received: Lead "${lead.name}" created via "${webhook.name}"`, "webhook");

      res.status(201).json({
        success: true,
        message: "Lead created successfully",
        lead,
      });
    } catch (err: any) {
      log(`n8n webhook error: ${err.message}`, "webhook");
      res.status(500).json({ message: err.message });
    }
  });

  // ========== ACTIVITIES ==========
  app.get("/api/activities", async (_req, res) => {
    const acts = await storage.getActivities();
    res.json(acts);
  });

  return httpServer;
}
