import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  DollarSign,
  User,
} from "lucide-react";
import type { Deal, Lead } from "@shared/schema";

const stages = [
  { key: "new_lead", label: "New Lead", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" },
  { key: "proposal", label: "Proposal Sent", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300" },
  { key: "negotiation", label: "Negotiation", color: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { key: "won", label: "Won", color: "bg-green-500/10 text-green-700 dark:text-green-300" },
  { key: "lost", label: "Lost", color: "bg-red-500/10 text-red-700 dark:text-red-300" },
];

function DealForm({ deal, onClose }: { deal?: Deal; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    value: deal?.value || 0,
    stage: deal?.stage || "new_lead",
    probability: deal?.probability || 10,
    expectedCloseDate: deal?.expectedCloseDate || "",
    notes: deal?.notes || "",
    assignedTo: deal?.assignedTo || "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (deal) {
        const res = await apiRequest("PATCH", `/api/deals/${deal.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: deal ? "Deal updated" : "Deal created" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label>Deal Title *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-deal-title" />
        </div>
        <div className="space-y-2">
          <Label>Value (₹)</Label>
          <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })} data-testid="input-deal-value" />
        </div>
        <div className="space-y-2">
          <Label>Stage</Label>
          <Select value={formData.stage} onValueChange={(val) => setFormData({ ...formData, stage: val })}>
            <SelectTrigger data-testid="select-deal-stage"><SelectValue /></SelectTrigger>
            <SelectContent>
              {stages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Probability (%)</Label>
          <Input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })} data-testid="input-deal-probability" />
        </div>
        <div className="space-y-2">
          <Label>Expected Close Date</Label>
          <Input type="date" value={formData.expectedCloseDate} onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })} data-testid="input-deal-close-date" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="input-deal-notes" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-deal">
          {mutation.isPending ? "Saving..." : deal ? "Update" : "Create Deal"}
        </Button>
      </div>
    </form>
  );
}

const leadStatusToStage: Record<string, string> = {
  new: "new_lead",
  contacted: "contacted",
  qualified: "proposal",
  proposal: "proposal",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
};

export default function Pipeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const { toast } = useToast();

  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  const isLoading = dealsLoading || leadsLoading;

  const moveMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/deals/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
    },
  });

  const moveLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/leads/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/deals/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({ title: "Deal deleted" });
    },
  });

  const handleClose = () => { setDialogOpen(false); setEditingDeal(undefined); };

  const getNextStage = (current: string) => {
    const idx = stages.findIndex((s) => s.key === current);
    return idx < stages.length - 2 ? stages[idx + 1].key : null;
  };

  const getNextLeadStatus = (current: string) => {
    const order = ["new", "contacted", "qualified", "proposal", "negotiation", "won"];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getLeadsForStage = (stageKey: string) => {
    if (!leads) return [];
    return leads.filter((lead) => leadStatusToStage[lead.status] === stageKey);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-pipeline-title">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track and manage your deals</p>
        </div>
        <Button onClick={() => { setEditingDeal(undefined); setDialogOpen(true); }} data-testid="button-add-deal">
          <Plus className="w-4 h-4 mr-2" />Add Deal
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDeal ? "Edit Deal" : "New Deal"}</DialogTitle></DialogHeader>
          <DealForm deal={editingDeal} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-1">
        <div className="flex gap-4 pb-4 min-w-max">
          {stages.map((stage) => {
            const stageDeals = deals?.filter((d) => d.stage === stage.key) || [];
            const stageLeads = getLeadsForStage(stage.key);
            const totalItems = stageDeals.length + stageLeads.length;
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0) +
              stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div
                key={stage.key}
                className="w-72 shrink-0 flex flex-col"
                data-testid={`pipeline-column-${stage.key}`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">{totalItems}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ₹{totalValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {stageLeads.map((lead) => (
                    <Card key={`lead-${lead.id}`} className="border-primary/30" data-testid={`lead-card-${lead.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-primary shrink-0" />
                              <p className="font-medium text-sm truncate">{lead.company || lead.name}</p>
                            </div>
                            {lead.company && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.name}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {getNextLeadStatus(lead.status) && (
                                <DropdownMenuItem onClick={() => moveLeadMutation.mutate({ id: lead.id, status: getNextLeadStatus(lead.status)! })}>
                                  <ArrowRight className="w-4 h-4 mr-2" />Move Forward
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {lead.category && (
                          <p className="text-xs text-muted-foreground mt-1">{lead.category}</p>
                        )}
                        {lead.value ? (
                          <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            ₹{lead.value.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                        {lead.leadQualityScore ? (
                          <div className="mt-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Quality</span>
                              <span>{lead.leadQualityScore}/100</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${lead.leadQualityScore}%` }}
                              />
                            </div>
                          </div>
                        ) : null}
                        <Badge variant="outline" className="mt-2 text-[10px]">Lead</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} data-testid={`deal-card-${deal.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-medium text-sm truncate">{deal.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
                                <Pencil className="w-4 h-4 mr-2" />Edit
                              </DropdownMenuItem>
                              {getNextStage(deal.stage) && (
                                <DropdownMenuItem onClick={() => moveMutation.mutate({ id: deal.id, stage: getNextStage(deal.stage)! })}>
                                  <ArrowRight className="w-4 h-4 mr-2" />Move Forward
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(deal.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {deal.value ? (
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            ₹{deal.value.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                        {deal.probability !== null && deal.probability !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Probability</span>
                              <span>{deal.probability}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {deal.expectedCloseDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Close: {deal.expectedCloseDate}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2 text-[10px]">Deal</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {totalItems === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-md">
                      No leads or deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
