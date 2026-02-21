import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@shared/schema";

const priorityOptions = ["low", "medium", "high", "urgent"];
const statusOptions = ["pending", "in_progress", "completed", "cancelled"];

function TaskForm({ task, onClose }: { task?: Task; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo || "",
    dueDate: task?.dueDate || "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (task) {
        const res = await apiRequest("PATCH", `/api/tasks/${task.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: task ? "Task updated" : "Task created" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-task-title" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
            <SelectTrigger data-testid="select-task-priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              {priorityOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
            <SelectTrigger data-testid="select-task-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assigned To</Label>
          <Input value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} data-testid="input-task-assigned" />
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} data-testid="input-task-due" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="input-task-description" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-task">
          {mutation.isPending ? "Saving..." : task ? "Update" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}

export default function Tasks() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/tasks/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  const handleClose = () => { setDialogOpen(false); setEditingTask(undefined); };

  const filtered = tasks?.filter((t) => filter === "all" || t.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive" as const;
      case "high": return "default" as const;
      default: return "secondary" as const;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-tasks-title">Tasks</h1>
          <p className="text-muted-foreground">Manage team tasks and assignments</p>
        </div>
        <Button onClick={() => { setEditingTask(undefined); setDialogOpen(true); }} data-testid="button-add-task">
          <Plus className="w-4 h-4 mr-2" />Add Task
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <TaskForm task={editingTask} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        {["all", ...statusOptions].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} data-testid={`filter-task-${s}`}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered && filtered.length > 0 ? filtered.map((task) => (
          <Card key={task.id} data-testid={`task-item-${task.id}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={(checked) => {
                  toggleMutation.mutate({
                    id: task.id,
                    status: checked ? "completed" : "pending",
                  });
                }}
                data-testid={`checkbox-task-${task.id}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  {task.assignedTo && (
                    <span className="text-xs text-muted-foreground">{task.assignedTo}</span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditingTask(task); setDialogOpen(true); }}>
                    <Pencil className="w-4 h-4 mr-2" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 text-muted-foreground">No tasks found</div>
        )}
      </div>
    </div>
  );
}
