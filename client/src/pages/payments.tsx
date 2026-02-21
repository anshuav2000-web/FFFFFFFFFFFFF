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
  CreditCard,
  IndianRupee,
} from "lucide-react";
import type { Payment, Invoice } from "@shared/schema";

const methodLabels: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  upi: "UPI",
  cheque: "Cheque",
  card: "Card",
  other: "Other",
};

function PaymentForm({
  payment,
  onClose,
}: {
  payment?: Payment;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { data: invoices } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });

  const [formData, setFormData] = useState({
    invoiceId: payment?.invoiceId || "",
    amount: payment?.amount || 0,
    method: payment?.method || "bank_transfer",
    reference: payment?.reference || "",
    notes: payment?.notes || "",
    paidAt: payment?.paidAt || new Date().toISOString().split("T")[0],
  });

  const selectedInvoice = invoices?.find((inv) => inv.id === formData.invoiceId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (payment) {
        const res = await apiRequest("PATCH", `/api/payments/${payment.id}`, formData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/payments", formData);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: payment ? "Payment updated" : "Payment recorded" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Invoice *</Label>
        <Select
          value={formData.invoiceId}
          onValueChange={(v) => setFormData({ ...formData, invoiceId: v })}
        >
          <SelectTrigger data-testid="select-invoice">
            <SelectValue placeholder="Select invoice..." />
          </SelectTrigger>
          <SelectContent>
            {invoices?.map((inv) => (
              <SelectItem key={inv.id} value={inv.id}>
                {inv.invoiceNumber} - {inv.clientName} (₹{(inv.total || 0).toLocaleString("en-IN")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedInvoice && (
          <p className="text-xs text-muted-foreground mt-1">
            Invoice total: ₹{(selectedInvoice.total || 0).toLocaleString("en-IN")} | Paid: ₹
            {(selectedInvoice.amountPaid || 0).toLocaleString("en-IN")} | Remaining: ₹
            {((selectedInvoice.total || 0) - (selectedInvoice.amountPaid || 0)).toLocaleString("en-IN")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Amount (₹) *</Label>
          <Input
            data-testid="input-payment-amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Payment Method</Label>
          <Select
            value={formData.method}
            onValueChange={(v) => setFormData({ ...formData, method: v })}
          >
            <SelectTrigger data-testid="select-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Reference / Transaction ID</Label>
          <Input
            data-testid="input-reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          />
        </div>
        <div>
          <Label>Payment Date</Label>
          <Input
            data-testid="input-paid-at"
            type="date"
            value={formData.paidAt}
            onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          data-testid="input-payment-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !formData.invoiceId || !formData.amount}
        className="w-full"
        data-testid="button-save-payment"
      >
        {mutation.isPending ? "Saving..." : payment ? "Update Payment" : "Record Payment"}
      </Button>
    </div>
  );
}

export default function Payments() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const { toast } = useToast();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });
  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Payment deleted" });
    },
  });

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices?.find((inv) => inv.id === invoiceId)?.invoiceNumber || "Unknown";
  };

  const getInvoiceClient = (invoiceId: string) => {
    return invoices?.find((inv) => inv.id === invoiceId)?.clientName || "";
  };

  const filtered = payments?.filter((p) => {
    const invNumber = getInvoiceNumber(p.invoiceId);
    const clientName = getInvoiceClient(p.invoiceId);
    return (
      invNumber.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalReceived = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-payments-title">Payments</h1>
          <p className="text-muted-foreground">Track invoice payments</p>
        </div>
        <Button
          onClick={() => {
            setEditingPayment(undefined);
            setDialogOpen(true);
          }}
          data-testid="button-add-payment"
        >
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-total-received">
                ₹{totalReceived.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-testid="input-search-payments"
          placeholder="Search payments..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-muted-foreground">Record your first payment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered?.map((payment) => (
            <Card key={payment.id} data-testid={`card-payment-${payment.id}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </span>
                    <Badge variant="outline">{methodLabels[payment.method] || payment.method}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getInvoiceNumber(payment.invoiceId)} - {getInvoiceClient(payment.invoiceId)}
                    {payment.paidAt && ` • ${payment.paidAt}`}
                    {payment.reference && ` • Ref: ${payment.reference}`}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-payment-menu-${payment.id}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingPayment(payment);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-edit-payment-${payment.id}`}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate(payment.id)}
                      className="text-red-600"
                      data-testid={`button-delete-payment-${payment.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPayment(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "Record Payment"}</DialogTitle>
          </DialogHeader>
          <PaymentForm
            payment={editingPayment}
            onClose={() => {
              setDialogOpen(false);
              setEditingPayment(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
