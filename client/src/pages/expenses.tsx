import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Receipt,
} from "lucide-react";
import type { Expense } from "@shared/schema";

const EXPENSE_CATEGORIES = [
  "general",
  "software",
  "hardware",
  "marketing",
  "travel",
  "office",
  "salary",
  "utilities",
  "freelancer",
  "hosting",
  "subscription",
  "other",
];

const categoryColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  software: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  hardware: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  travel: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  office: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  salary: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  utilities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  freelancer: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  hosting: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  subscription: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  other: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function ExpenseForm({
  expense,
  onClose,
}: {
  expense?: Expense;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: expense?.title || "",
    category: expense?.category || "general",
    amount: expense?.amount || 0,
    description: expense?.description || "",
    vendor: expense?.vendor || "",
    expenseDate: expense?.expenseDate || new Date().toISOString().split("T")[0],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (expense) {
        const res = await apiRequest("PATCH", `/api/expenses/${expense.id}`, formData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/expenses", formData);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: expense ? "Expense updated" : "Expense recorded" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input
          data-testid="input-expense-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Adobe Creative Cloud"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger data-testid="select-expense-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount (₹) *</Label>
          <Input
            data-testid="input-expense-amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Vendor</Label>
          <Input
            data-testid="input-expense-vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="e.g., Adobe Inc."
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input
            data-testid="input-expense-date"
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          data-testid="input-expense-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          placeholder="Additional details about this expense..."
        />
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !formData.title || !formData.amount}
        className="w-full"
        data-testid="button-save-expense"
      >
        {mutation.isPending ? "Saving..." : expense ? "Update Expense" : "Record Expense"}
      </Button>
    </div>
  );
}

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Expense deleted" });
    },
  });

  const filtered = expenses?.filter((exp) => {
    const matchSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.vendor || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || exp.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const thisMonthExpenses =
    expenses
      ?.filter((exp) => {
        const now = new Date();
        const expDate = exp.expenseDate ? new Date(exp.expenseDate) : exp.createdAt ? new Date(exp.createdAt) : null;
        return expDate && expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-expenses-title">Expenses</h1>
          <p className="text-muted-foreground">Track company expenses</p>
        </div>
        <Button
          onClick={() => {
            setEditingExpense(undefined);
            setDialogOpen(true);
          }}
          data-testid="button-add-expense"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold" data-testid="text-month-expenses">
              ₹{thisMonthExpenses.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-expenses"
            placeholder="Search expenses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" data-testid="select-category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-muted-foreground">Record your first expense</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered?.map((expense) => (
            <Card key={expense.id} data-testid={`card-expense-${expense.id}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{expense.title}</span>
                    <Badge className={categoryColors[expense.category] || ""}>
                      {expense.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {expense.vendor && `${expense.vendor} • `}
                    {expense.expenseDate || "No date"}
                    {expense.description && ` • ${expense.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-red-600">
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-expense-menu-${expense.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingExpense(expense);
                          setDialogOpen(true);
                        }}
                        data-testid={`button-edit-expense-${expense.id}`}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(expense.id)}
                        className="text-red-600"
                        data-testid={`button-delete-expense-${expense.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingExpense(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onClose={() => {
              setDialogOpen(false);
              setEditingExpense(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
