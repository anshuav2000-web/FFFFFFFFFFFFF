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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  DollarSign,
  User,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Deal, Lead } from "@shared/schema";

const stages = [
  { key: "new_lead", label: "New Lead", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" },
  { key: "proposal", label: "Proposal Sent", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300" },
  { key: "negotiation", label: "Negotiation", color: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { key: "won", label: "Won", color: "bg-green-500/10 text-green-700 dark:text-green-300" },
  { key: "lost", label: "Lost", color: "bg-red-500/10 text-red-700 dark:text-red-300" },
];

const leadStatusToStage: Record<string, string> = {
  new: "new_lead",
  contacted: "contacted",
  qualified: "proposal",
  proposal: "proposal",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
};

const stageToLeadStatus: Record<string, string> = {
  new_lead: "new",
  contacted: "contacted",
  proposal: "qualified",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
};

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

type PipelineItem = {
  type: "lead" | "deal";
  id: string;
  dragId: string;
  title: string;
  subtitle?: string;
  category?: string | null;
  value?: number | null;
  qualityScore?: number | null;
  probability?: number | null;
  closeDate?: string | null;
  stageKey: string;
};

function DraggableCard({
  item,
  onEdit,
  onDelete,
}: {
  item: PipelineItem;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.dragId,
    data: item,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-testid={`${item.type}-card-${item.id}`}>
      <Card className={`${item.type === "lead" ? "border-primary/30" : ""} ${isDragging ? "shadow-lg ring-2 ring-primary/50" : ""}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-1">
            <div {...listeners} {...attributes} className="mt-1 cursor-grab active:cursor-grabbing shrink-0 touch-none">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.type === "lead" && <User className="w-3 h-3 text-primary shrink-0" />}
                    <p className="font-medium text-sm truncate">{item.title}</p>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
                  )}
                </div>
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {item.category && (
                <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
              )}
              {item.value ? (
                <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  ₹{item.value.toLocaleString("en-IN")}
                </div>
              ) : null}
              {item.type === "lead" && item.qualityScore ? (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Quality</span>
                    <span>{item.qualityScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${item.qualityScore}%` }} />
                  </div>
                </div>
              ) : null}
              {item.type === "deal" && item.probability !== null && item.probability !== undefined && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Probability</span>
                    <span>{item.probability}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${item.probability}%` }} />
                  </div>
                </div>
              )}
              {item.closeDate && (
                <p className="text-xs text-muted-foreground mt-1.5">Close: {item.closeDate}</p>
              )}
              <Badge variant="outline" className="mt-2 text-[10px]">{item.type === "lead" ? "Lead" : "Deal"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({
  stageKey,
  children,
  isOver,
}: {
  stageKey: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stageKey });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 flex-1 min-h-[200px] rounded-md p-2 transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed" : ""}`}
    >
      {children}
    </div>
  );
}

function OverlayCard({ item }: { item: PipelineItem }) {
  return (
    <div className="w-[272px]">
      <Card className={`shadow-xl ring-2 ring-primary/50 ${item.type === "lead" ? "border-primary/30" : ""}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            {item.type === "lead" && <User className="w-3 h-3 text-primary" />}
            <p className="font-medium text-sm truncate">{item.title}</p>
          </div>
          {item.value ? (
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <DollarSign className="w-3 h-3" />₹{item.value.toLocaleString("en-IN")}
            </div>
          ) : null}
          <Badge variant="outline" className="mt-2 text-[10px]">{item.type === "lead" ? "Lead" : "Deal"}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Pipeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>();
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  const isLoading = dealsLoading || leadsLoading;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const moveDealMutation = useMutation({
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

  const getLeadsForStage = (stageKey: string) => {
    if (!leads) return [];
    return leads.filter((lead) => leadStatusToStage[lead.status] === stageKey);
  };

  const buildItems = (stageKey: string): PipelineItem[] => {
    const stageLeads = getLeadsForStage(stageKey).map((lead): PipelineItem => ({
      type: "lead",
      id: lead.id,
      dragId: `lead-${lead.id}`,
      title: lead.company || lead.name,
      subtitle: lead.company ? lead.name : undefined,
      category: lead.category,
      value: lead.value,
      qualityScore: lead.leadQualityScore,
      stageKey,
    }));
    const stageDeals = (deals?.filter((d) => d.stage === stageKey) || []).map((deal): PipelineItem => ({
      type: "deal",
      id: deal.id,
      dragId: `deal-${deal.id}`,
      title: deal.title,
      value: deal.value,
      probability: deal.probability,
      closeDate: deal.expectedCloseDate,
      stageKey,
    }));
    return [...stageLeads, ...stageDeals];
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as PipelineItem;
    setActiveItem(data);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (!overId) {
      setOverColumn(null);
      return;
    }
    const isStage = stages.some((s) => s.key === overId);
    if (isStage) {
      setOverColumn(overId);
    } else {
      const overData = event.over?.data?.current as PipelineItem | undefined;
      if (overData) {
        setOverColumn(overData.stageKey);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setOverColumn(null);

    if (!over) return;

    const draggedItem = active.data.current as PipelineItem;
    let targetStage: string | null = null;

    const isStage = stages.some((s) => s.key === over.id);
    if (isStage) {
      targetStage = over.id as string;
    } else {
      const overData = over.data?.current as PipelineItem | undefined;
      if (overData) {
        targetStage = overData.stageKey;
      }
    }

    if (!targetStage || targetStage === draggedItem.stageKey) return;

    if (draggedItem.type === "deal") {
      moveDealMutation.mutate({ id: draggedItem.id, stage: targetStage });
    } else {
      const newStatus = stageToLeadStatus[targetStage];
      if (newStatus) {
        moveLeadMutation.mutate({ id: draggedItem.id, status: newStatus });
      }
    }
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
          <p className="text-muted-foreground">Drag and drop cards to move between stages</p>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="flex-1">
          <div className="flex gap-4 pb-4 min-w-max">
            {stages.map((stage) => {
              const items = buildItems(stage.key);
              const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);

              return (
                <div
                  key={stage.key}
                  className="w-72 shrink-0 flex flex-col"
                  data-testid={`pipeline-column-${stage.key}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{stage.label}</h3>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ₹{totalValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <DroppableColumn stageKey={stage.key} isOver={overColumn === stage.key}>
                    {items.map((item) => (
                      <DraggableCard
                        key={item.dragId}
                        item={item}
                        onEdit={item.type === "deal" ? () => {
                          const deal = deals?.find((d) => d.id === item.id);
                          if (deal) { setEditingDeal(deal); setDialogOpen(true); }
                        } : undefined}
                        onDelete={item.type === "deal" ? () => deleteMutation.mutate(item.id) : undefined}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-md">
                        Drop here
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DragOverlay>
          {activeItem ? <OverlayCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
