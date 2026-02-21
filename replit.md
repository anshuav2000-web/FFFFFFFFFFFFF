# Canvas Cartel CRM

## Overview
A complete CRM system for Canvas Cartel (canvascartel.in), a creative design and marketing studio based in India. The CRM manages leads, contacts, deals pipeline, call logs, tasks, and integrates with n8n via webhooks.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express routes (backend)
- **State Management**: TanStack React Query

## Key Features
- Dashboard with real-time stats
- Lead management with CRUD, search, and status filtering
- Contact management with card view
- Sales pipeline with Kanban-style columns
- Call log system with outcome tracking (call, picked up, not interested, interested, call later, schedule call)
- Task management with priorities
- Invoice management with auto-numbering, services, discounts, tax, and email sending via Resend
- Payment management for tracking invoice payments with auto-status updates
- Expense management with categories and monthly tracking
- n8n webhook integration for automated lead creation
- Email sending via Resend integration
- Dark/Light mode toggle
- Canvas Cartel branding (red #EE2B2B primary color)

## Services Tracked
- Advertisement Design (₹15,000+)
- Social Media Content (₹20,000+)
- Website Development (₹50,000+)
- Video Production (₹25,000+)
- Photo Production (₹15,000+)
- Marketing Strategy (₹35,000+)
- n8n Automation (₹30,000+)

## API Endpoints
- GET/POST /api/leads, PATCH/DELETE /api/leads/:id
- GET/POST /api/contacts, PATCH/DELETE /api/contacts/:id
- GET/POST /api/deals, PATCH/DELETE /api/deals/:id
- GET/POST /api/call-logs, PATCH/DELETE /api/call-logs/:id
- GET/POST /api/tasks, PATCH/DELETE /api/tasks/:id
- GET/POST /api/webhooks, PATCH/DELETE /api/webhooks/:id
- POST /api/webhook/n8n/:webhookId (n8n integration endpoint)
- GET/POST /api/invoices, PATCH/DELETE /api/invoices/:id, GET /api/invoices/:id (with items & payments)
- POST /api/invoices/:id/send-email (send invoice via Resend)
- POST /api/invoice-items, DELETE /api/invoice-items/:id
- GET/POST /api/payments, PATCH/DELETE /api/payments/:id, GET /api/payments/invoice/:invoiceId
- GET/POST /api/expenses, PATCH/DELETE /api/expenses/:id
- GET /api/activities

## n8n Integration
POST to /api/webhook/n8n/:webhookId with JSON body:
```json
{
  "name": "Lead Name",
  "email": "email@example.com",
  "phone": "+91 9876543210",
  "company": "Company Name",
  "source": "n8n_webhook",
  "notes": "Notes about the lead"
}
```

## Database
PostgreSQL with tables: users, leads, contacts, deals, call_logs, tasks, webhooks, activities, invoices, invoice_items, payments, expenses

## Recent Changes (Feb 2026)
- Added Invoice Management: create/edit/delete invoices with auto-numbering, line items, services from catalog, discounts (percentage/fixed), GST tax, send via email (Resend)
- Added Payment Management: record/edit/delete payments linked to invoices, auto-updates invoice status (draft/sent/partially_paid/paid)
- Added Expense Management: create/edit/delete company expenses with categories, vendor tracking, monthly summaries
- Integrated Resend for sending invoice emails via Replit connector
