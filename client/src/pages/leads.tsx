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
  DialogTrigger,
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
import { Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Lead } from "@shared/schema";

const statusOptions = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
const sourceOptions = ["manual", "website", "referral", "social_media", "n8n_webhook", "email"];

function LeadForm({
  lead,
  onClose,
}: {
  lead?: Lead;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    source: lead?.source || "manual",
    status: lead?.status || "new",
    notes: lead?.notes || "",
    value: lead?.value || 0,
    assignedTo: lead?.assignedTo || "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/leads", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: "Lead created successfully" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PATCH", `/api/leads/${lead!.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: "Lead updated successfully" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lead) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-lead-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            data-testid="input-lead-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            data-testid="input-lead-phone"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            data-testid="input-lead-company"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select
            value={formData.source}
            onValueChange={(val) => setFormData({ ...formData, source: val })}
          >
            <SelectTrigger data-testid="select-lead-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => setFormData({ ...formData, status: val })}
          >
            <SelectTrigger data-testid="select-lead-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Deal Value (₹)</Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
            data-testid="input-lead-value"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            data-testid="input-lead-assigned"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          data-testid="input-lead-notes"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-lead">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-save-lead">
          {isPending ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const { toast } = useToast();

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead deleted" });
    },
  });

  const filtered = leads?.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase())) ||
      (lead.company?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingLead(undefined);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-leads-title">Leads</h1>
          <p className="text-muted-foreground">Manage your sales leads</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditingLead(undefined); setDialogOpen(true); }}
              data-testid="button-add-lead"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
            </DialogHeader>
            <LeadForm lead={editingLead} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-leads"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Source</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Value</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered && filtered.length > 0 ? (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0" data-testid={`lead-item-${lead.id}`}>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{lead.email}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm">{lead.email || "-"}</td>
                      <td className="p-4 hidden lg:table-cell text-sm">{lead.company || "-"}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            lead.status === "won" ? "default" :
                            lead.status === "lost" ? "destructive" :
                            "secondary"
                          }
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-sm text-muted-foreground">
                        {lead.source?.replace(/_/g, " ")}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm">
                        {lead.value ? `₹${lead.value.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" data-testid={`button-lead-actions-${lead.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(lead)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(lead.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
