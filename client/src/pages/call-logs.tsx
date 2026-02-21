import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Phone,
  PhoneOff,
  PhoneIncoming,
  Clock,
  Calendar,
  ThumbsDown,
} from "lucide-react";
import type { CallLog, Lead } from "@shared/schema";

const outcomeOptions = [
  { value: "call", label: "Call Made", icon: Phone, color: "default" as const },
  { value: "picked_up", label: "Picked Up", icon: PhoneIncoming, color: "default" as const },
  { value: "not_interested", label: "Not Interested", icon: ThumbsDown, color: "destructive" as const },
  { value: "interested", label: "Interested", icon: Phone, color: "default" as const },
  { value: "call_later", label: "Call After Sometime", icon: Clock, color: "secondary" as const },
  { value: "schedule_call", label: "Schedule a Call", icon: Calendar, color: "secondary" as const },
  { value: "no_answer", label: "No Answer", icon: PhoneOff, color: "secondary" as const },
];

function CallLogForm({ callLog, onClose }: { callLog?: CallLog; onClose: () => void }) {
  const { toast } = useToast();
  const { data: leads } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  const [formData, setFormData] = useState({
    leadId: callLog?.leadId || "",
    calledBy: callLog?.calledBy || "",
    outcome: callLog?.outcome || "call",
    duration: callLog?.duration || "",
    notes: callLog?.notes || "",
    scheduledAt: callLog?.scheduledAt || "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (callLog) {
        const res = await apiRequest("PATCH", `/api/call-logs/${callLog.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/call-logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: callLog ? "Call log updated" : "Call log created" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lead</Label>
          <Select value={formData.leadId} onValueChange={(val) => setFormData({ ...formData, leadId: val })}>
            <SelectTrigger data-testid="select-calllog-lead"><SelectValue placeholder="Select a lead" /></SelectTrigger>
            <SelectContent>
              {leads?.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Called By</Label>
          <Input value={formData.calledBy} onChange={(e) => setFormData({ ...formData, calledBy: e.target.value })} placeholder="Employee name" data-testid="input-calllog-calledby" />
        </div>
        <div className="space-y-2">
          <Label>Outcome *</Label>
          <Select value={formData.outcome} onValueChange={(val) => setFormData({ ...formData, outcome: val })}>
            <SelectTrigger data-testid="select-calllog-outcome"><SelectValue /></SelectTrigger>
            <SelectContent>
              {outcomeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 5 min" data-testid="input-calllog-duration" />
        </div>
        {(formData.outcome === "schedule_call" || formData.outcome === "call_later") && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Scheduled Date/Time</Label>
            <Input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} data-testid="input-calllog-scheduled" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="input-calllog-notes" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-calllog">
          {mutation.isPending ? "Saving..." : callLog ? "Update" : "Log Call"}
        </Button>
      </div>
    </form>
  );
}

export default function CallLogs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CallLog | undefined>();
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const { toast } = useToast();

  const { data: callLogs, isLoading } = useQuery<CallLog[]>({ queryKey: ["/api/call-logs"] });
  const { data: leads } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/call-logs/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-logs"] });
      toast({ title: "Call log deleted" });
    },
  });

  const handleClose = () => { setDialogOpen(false); setEditingLog(undefined); };

  const getLeadName = (leadId: string | null) => {
    if (!leadId || !leads) return "Unknown";
    return leads.find((l) => l.id === leadId)?.name || "Unknown";
  };

  const getOutcomeInfo = (outcome: string) => {
    return outcomeOptions.find((o) => o.value === outcome) || outcomeOptions[0];
  };

  const filtered = callLogs?.filter((cl) =>
    outcomeFilter === "all" || cl.outcome === outcomeFilter
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-calllogs-title">Call Logs</h1>
          <p className="text-muted-foreground">Track all call interactions</p>
        </div>
        <Button onClick={() => { setEditingLog(undefined); setDialogOpen(true); }} data-testid="button-add-calllog">
          <Plus className="w-4 h-4 mr-2" />Log Call
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLog ? "Edit Call Log" : "Log a Call"}</DialogTitle></DialogHeader>
          <CallLogForm callLog={editingLog} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={outcomeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setOutcomeFilter("all")}
          data-testid="filter-all"
        >
          All
        </Button>
        {outcomeOptions.map((o) => (
          <Button
            key={o.value}
            variant={outcomeFilter === o.value ? "default" : "outline"}
            size="sm"
            onClick={() => setOutcomeFilter(o.value)}
            data-testid={`filter-${o.value}`}
          >
            {o.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Lead</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Outcome</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Called By</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered && filtered.length > 0 ? filtered.map((cl) => {
                  const outcomeInfo = getOutcomeInfo(cl.outcome);
                  return (
                    <tr key={cl.id} className="border-b last:border-0" data-testid={`calllog-row-${cl.id}`}>
                      <td className="p-4 font-medium">{getLeadName(cl.leadId)}</td>
                      <td className="p-4">
                        <Badge variant={outcomeInfo.color}>{outcomeInfo.label}</Badge>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-sm text-muted-foreground">{cl.calledBy || "-"}</td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{cl.duration || "-"}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground max-w-48 truncate">{cl.notes || "-"}</td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {cl.createdAt ? new Date(cl.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingLog(cl); setDialogOpen(true); }}>
                              <Pencil className="w-4 h-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(cl.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No call logs found</td>
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
