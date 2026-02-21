import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Copy, Webhook, ExternalLink } from "lucide-react";
import type { Webhook as WebhookType } from "@shared/schema";

export default function Webhooks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const { data: webhooks, isLoading } = useQuery<WebhookType[]>({ queryKey: ["/api/webhooks"] });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/webhooks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Webhook created" });
      setDialogOpen(false);
      setName("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/webhooks/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/webhooks/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Webhook deleted" });
    },
  });

  const copyUrl = (id: string) => {
    const url = `${window.location.origin}/api/webhook/n8n/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Webhook URL copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-webhooks-title">Webhooks & n8n Integration</h1>
          <p className="text-muted-foreground">Connect external tools to create leads automatically</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-webhook">
          <Plus className="w-4 h-4 mr-2" />Add Webhook
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Webhook</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name }); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. n8n Lead Capture" required data-testid="input-webhook-name" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-webhook">
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            n8n Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the webhook URLs below in your n8n workflows to automatically create leads in Canvas Cartel CRM.
          </p>
          <div className="bg-muted/50 rounded-md p-4 space-y-2">
            <p className="text-sm font-medium">How to connect with n8n:</p>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Create a new webhook endpoint below</li>
              <li>Copy the webhook URL</li>
              <li>In n8n, add an <strong>"HTTP Request"</strong> node</li>
              <li>Set method to <strong>POST</strong> and paste the webhook URL</li>
              <li>Set <strong>Content-Type</strong> header to <code className="bg-muted px-1 rounded">application/json</code></li>
              <li>Send JSON body with the fields shown below</li>
            </ol>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-sm font-medium mb-1">Required field:</p>
            <p className="text-xs text-muted-foreground mb-3"><code className="bg-muted px-1 rounded">name</code> — Contact person name (required)</p>
            <p className="text-sm font-medium mb-1">Supported fields:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-muted-foreground mb-4">
              <span><code className="bg-muted px-1 rounded">companyName</code> — Company name</span>
              <span><code className="bg-muted px-1 rounded">category</code> — Business category</span>
              <span><code className="bg-muted px-1 rounded">phoneNumber</code> — Phone number</span>
              <span><code className="bg-muted px-1 rounded">email</code> — Email address</span>
              <span><code className="bg-muted px-1 rounded">city</code> — City</span>
              <span><code className="bg-muted px-1 rounded">country</code> — Country</span>
              <span><code className="bg-muted px-1 rounded">address</code> — Street address</span>
              <span><code className="bg-muted px-1 rounded">website</code> — Website URL</span>
              <span><code className="bg-muted px-1 rounded">linkedin</code> — LinkedIn URL</span>
              <span><code className="bg-muted px-1 rounded">facebook</code> — Facebook URL</span>
              <span><code className="bg-muted px-1 rounded">instagram</code> — Instagram URL</span>
              <span><code className="bg-muted px-1 rounded">description</code> — Business description</span>
              <span><code className="bg-muted px-1 rounded">businessHours</code> — Operating hours</span>
              <span><code className="bg-muted px-1 rounded">leadQualityScore</code> — Score 0-100</span>
              <span><code className="bg-muted px-1 rounded">qualityReasoning</code> — Score reasoning</span>
              <span><code className="bg-muted px-1 rounded">socialSignals</code> — Social signals</span>
              <span><code className="bg-muted px-1 rounded">growthSignals</code> — Growth signals</span>
              <span><code className="bg-muted px-1 rounded">source</code> — Lead source</span>
              <span><code className="bg-muted px-1 rounded">notes</code> — Additional notes</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-sm font-medium mb-2">Example JSON payload:</p>
            <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
{`{
  "name": "Urban Threads",
  "companyName": "Urban Threads Boutique",
  "category": "Clothing Store",
  "phoneNumber": "+919876543210",
  "email": "urbanthreads.delhi@gmail.com",
  "city": "New Delhi",
  "country": "India",
  "address": "G-12, Lajpat Nagar II",
  "website": "",
  "linkedin": "",
  "facebook": "",
  "instagram": "",
  "description": "Newly opened boutique offering contemporary ethnic wear, launched May 2024",
  "businessHours": "11:00 AM - 8:00 PM, closed Mondays",
  "leadQualityScore": 82,
  "qualityReasoning": "Strong WhatsApp integration, active Instagram growth signals, no website meets criteria",
  "socialSignals": "Daily Instagram story updates, Facebook event posts for new arrivals",
  "growthSignals": "500+ Instagram followers gained in 30 days, New Collection promo posts",
  "source": "n8n_webhook",
  "notes": "Interested in social media marketing"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {webhooks && webhooks.length > 0 ? webhooks.map((wh) => (
          <Card key={wh.id} data-testid={`webhook-card-${wh.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{wh.name}</p>
                    <Badge variant={wh.isActive ? "default" : "secondary"}>
                      {wh.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded truncate block max-w-md">
                      {`${window.location.origin}/api/webhook/n8n/${wh.id}`}
                    </code>
                    <Button size="icon" variant="ghost" onClick={() => copyUrl(wh.id)} data-testid={`button-copy-webhook-${wh.id}`}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {wh.createdAt ? new Date(wh.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={wh.isActive || false}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: wh.id, isActive: checked })}
                    data-testid={`switch-webhook-${wh.id}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(wh.id)}
                    data-testid={`button-delete-webhook-${wh.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 text-muted-foreground">
            No webhooks created yet. Create one to start receiving leads from n8n.
          </div>
        )}
      </div>
    </div>
  );
}
