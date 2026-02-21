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

      const body = req.body;

      if (!body.name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const lead = await storage.createLead({
        name: body.name,
        email: body.email || null,
        phone: body.phone || body.phoneNumber || null,
        company: body.company || body.companyName || null,
        category: body.category || null,
        city: body.city || null,
        country: body.country || null,
        address: body.address || null,
        website: body.website || null,
        linkedin: body.linkedin || null,
        facebook: body.facebook || null,
        instagram: body.instagram || null,
        description: body.description || null,
        businessHours: body.businessHours || null,
        leadQualityScore: body.leadQualityScore ? parseInt(body.leadQualityScore) : null,
        qualityReasoning: body.qualityReasoning || null,
        socialSignals: body.socialSignals || null,
        growthSignals: body.growthSignals || null,
        source: body.source || "n8n_webhook",
        status: "new",
        notes: body.notes || null,
        value: body.value ? parseInt(body.value) : 0,
        tags: body.tags || [],
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

  // ========== INVOICES ==========
  app.get("/api/invoices", async (_req, res) => {
    const all = await storage.getInvoices();
    res.json(all);
  });

  app.get("/api/invoices/:id", async (req, res) => {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    const items = await storage.getInvoiceItems(req.params.id);
    const invoicePayments = await storage.getPaymentsByInvoiceId(req.params.id);
    res.json({ ...invoice, items, payments: invoicePayments });
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;
      const count = (await storage.getInvoices()).length;
      const invoiceNumber = invoiceData.invoiceNumber || `INV-${String(count + 1).padStart(4, "0")}`;
      const invoice = await storage.createInvoice({ ...invoiceData, invoiceNumber });
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.createInvoiceItem({ ...item, invoiceId: invoice.id });
        }
      }
      await storage.createActivity({
        type: "invoice_created",
        description: `Invoice ${invoiceNumber} created for ${invoice.clientName}`,
        entityType: "invoice",
        entityId: invoice.id,
      });
      const createdItems = await storage.getInvoiceItems(invoice.id);
      res.status(201).json({ ...invoice, items: createdItems });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;
      const invoice = await storage.updateInvoice(req.params.id, invoiceData);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      if (items && Array.isArray(items)) {
        await storage.deleteInvoiceItemsByInvoiceId(req.params.id);
        for (const item of items) {
          await storage.createInvoiceItem({ ...item, invoiceId: invoice.id });
        }
      }
      const updatedItems = await storage.getInvoiceItems(invoice.id);
      res.json({ ...invoice, items: updatedItems });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    await storage.deleteInvoice(req.params.id);
    res.status(204).send();
  });

  app.post("/api/invoices/:id/send-email", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      if (!invoice.clientEmail) return res.status(400).json({ message: "Client email is required" });
      const items = await storage.getInvoiceItems(req.params.id);

      const itemsHtml = items.map(item =>
        `<tr><td style="padding:8px;border:1px solid #ddd">${item.description}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">₹${item.rate.toLocaleString("en-IN")}</td><td style="padding:8px;border:1px solid #ddd;text-align:right">₹${item.amount.toLocaleString("en-IN")}</td></tr>`
      ).join("");

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#EE2B2B;color:white;padding:20px;text-align:center">
            <h1 style="margin:0">Canvas Cartel</h1>
            <p style="margin:4px 0 0">Invoice ${invoice.invoiceNumber}</p>
          </div>
          <div style="padding:20px">
            <p>Dear ${invoice.clientName},</p>
            <p>Please find your invoice details below:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd;text-align:left">Service</th><th style="padding:8px;border:1px solid #ddd">Qty</th><th style="padding:8px;border:1px solid #ddd;text-align:right">Rate</th><th style="padding:8px;border:1px solid #ddd;text-align:right">Amount</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align:right;margin-top:16px">
              <p>Subtotal: ₹${(invoice.subtotal || 0).toLocaleString("en-IN")}</p>
              ${invoice.discountValue ? `<p>Discount: ${invoice.discountType === "percentage" ? invoice.discountValue + "%" : "₹" + invoice.discountValue.toLocaleString("en-IN")}</p>` : ""}
              ${invoice.taxPercentage ? `<p>Tax (${invoice.taxPercentage}%): ₹${Math.round((invoice.subtotal || 0) * (invoice.taxPercentage || 0) / 100).toLocaleString("en-IN")}</p>` : ""}
              <p style="font-size:18px;font-weight:bold">Total: ₹${(invoice.total || 0).toLocaleString("en-IN")}</p>
              ${invoice.dueDate ? `<p>Due Date: ${invoice.dueDate}</p>` : ""}
            </div>
            ${invoice.notes ? `<p style="margin-top:16px;color:#666">Notes: ${invoice.notes}</p>` : ""}
          </div>
          <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#666">
            <p>Canvas Cartel | canvascartel.in</p>
          </div>
        </div>
      `;

      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        return res.status(500).json({ message: "Email service not configured. Please set up the Resend integration." });
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Canvas Cartel <onboarding@resend.dev>",
          to: [invoice.clientEmail],
          subject: `Invoice ${invoice.invoiceNumber} from Canvas Cartel`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        return res.status(500).json({ message: `Email failed: ${errText}` });
      }

      await storage.updateInvoice(req.params.id, { status: "sent", sentAt: new Date().toISOString() } as any);
      await storage.createActivity({
        type: "invoice_sent",
        description: `Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`,
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, message: "Invoice sent successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ========== INVOICE ITEMS ==========
  app.post("/api/invoice-items", async (req, res) => {
    try {
      const item = await storage.createInvoiceItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/invoice-items/:id", async (req, res) => {
    await storage.deleteInvoiceItem(req.params.id);
    res.status(204).send();
  });

  // ========== PAYMENTS ==========
  app.get("/api/payments", async (_req, res) => {
    const all = await storage.getPayments();
    res.json(all);
  });

  app.get("/api/payments/invoice/:invoiceId", async (req, res) => {
    const payments = await storage.getPaymentsByInvoiceId(req.params.invoiceId);
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice) {
        const allPayments = await storage.getPaymentsByInvoiceId(payment.invoiceId);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const newStatus = totalPaid >= (invoice.total || 0) ? "paid" : "partially_paid";
        await storage.updateInvoice(payment.invoiceId, { amountPaid: totalPaid, status: newStatus } as any);
      }
      await storage.createActivity({
        type: "payment_received",
        description: `Payment of ₹${payment.amount.toLocaleString("en-IN")} received${invoice ? ` for invoice ${invoice.invoiceNumber}` : ""}`,
        entityType: "payment",
        entityId: payment.id,
      });
      res.status(201).json(payment);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, req.body);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice) {
        const allPayments = await storage.getPaymentsByInvoiceId(payment.invoiceId);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const newStatus = totalPaid >= (invoice.total || 0) ? "paid" : totalPaid > 0 ? "partially_paid" : invoice.status;
        await storage.updateInvoice(payment.invoiceId, { amountPaid: totalPaid, status: newStatus } as any);
      }
      res.json(payment);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    const payment = await storage.getPayment(req.params.id);
    await storage.deletePayment(req.params.id);
    if (payment) {
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice) {
        const allPayments = await storage.getPaymentsByInvoiceId(payment.invoiceId);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const newStatus = totalPaid >= (invoice.total || 0) ? "paid" : totalPaid > 0 ? "partially_paid" : "sent";
        await storage.updateInvoice(payment.invoiceId, { amountPaid: totalPaid, status: newStatus } as any);
      }
    }
    res.status(204).send();
  });

  // ========== EXPENSES ==========
  app.get("/api/expenses", async (_req, res) => {
    const all = await storage.getExpenses();
    res.json(all);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await storage.createExpense(req.body);
      await storage.createActivity({
        type: "expense_created",
        description: `Expense recorded: ${expense.title} - ₹${expense.amount.toLocaleString("en-IN")}`,
        entityType: "expense",
        entityId: expense.id,
      });
      res.status(201).json(expense);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.updateExpense(req.params.id, req.body);
      if (!expense) return res.status(404).json({ message: "Expense not found" });
      res.json(expense);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    await storage.deleteExpense(req.params.id);
    res.status(204).send();
  });

  // ========== ACTIVITIES ==========
  app.get("/api/activities", async (_req, res) => {
    const acts = await storage.getActivities();
    res.json(acts);
  });

  return httpServer;
}
