import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Percent } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  memberId: z.string().min(1, "Selecione um membro"),
  description: z.string().min(3, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  interestRate: z.coerce.number().min(0),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
  status: z.enum(["active", "paid", "overdue"]),
});

type FormData = z.infer<typeof formSchema>;

interface Loan {
  id: string;
  memberId: string;
  memberName?: string;
  description: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  status: "active" | "paid" | "overdue";
}

interface Member {
  id: string;
  fullName: string;
}

const STATUS_LABELS = {
  active: "Ativo",
  paid: "Pago",
  overdue: "Atrasado",
} as const;

const STATUS_COLORS = {
  active: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
} as const;

export default function TreasurerLoansPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        memberId: data.memberId,
        description: data.description,
        amount: data.amount,
        interestRate: data.interestRate,
        dueDate: data.dueDate,
        status: data.status,
      };

      if (editingId) {
        return await fetch(`/api/loans/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Empréstimo atualizado" : "Empréstimo registrado",
        description: editingId ? "Empréstimo foi atualizado" : "Novo empréstimo registrado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar empréstimo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/loans/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Empréstimo deletado",
        description: "Empréstimo foi removido",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar empréstimo",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      description: "",
      amount: undefined,
      interestRate: "0",
      dueDate: new Date().toISOString().split("T")[0],
      status: "active",
    },
  });

  const handleEdit = (loan: Loan) => {
    form.reset({
      memberId: loan.memberId,
      description: loan.description,
      amount: loan.amount.toString(),
      interestRate: loan.interestRate.toString(),
      dueDate: loan.dueDate,
      status: loan.status,
    });
    setEditingId(loan.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  const totalActive = loans?.filter(l => l.status === "active").reduce((sum, l) => sum + l.amount, 0) || 0;
  const totalPaid = loans?.filter(l => l.status === "paid").reduce((sum, l) => sum + l.amount, 0) || 0;
  const totalOverdue = loans?.filter(l => l.status === "overdue").reduce((sum, l) => sum + l.amount, 0) || 0;

  if (loansLoading || membersLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Gestão de empréstimos aos membros</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-loan">
              <Plus className="h-4 w-4" />
              Novo Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Empréstimo" : "Novo Empréstimo"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados do empréstimo" : "Registre um novo empréstimo"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membro *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-member">
                            <SelectValue placeholder="Selecione o membro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Motivo do empréstimo" data-testid="textarea-description" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" data-testid="input-amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa de Juros (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" step="0.01" data-testid="input-interest" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento *</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-due-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="overdue">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save">
                  {mutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-total-active">
              R$ {totalActive.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-total-paid">
              R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Atrasado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-total-overdue">
              R$ {totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-count">
              {loans?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Empréstimos</CardTitle>
          <CardDescription>Todos os empréstimos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Juros (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? (
                  loans.map((loan) => (
                    <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`}>
                      <TableCell>{new Date(loan.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{members?.find(m => m.id === loan.memberId)?.fullName || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">{loan.description}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {parseFloat(loan.amount.toString()).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[loan.status]}`}>
                          {STATUS_LABELS[loan.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(loan)} data-testid={`button-edit-${loan.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(loan.id)} data-testid={`button-delete-${loan.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum empréstimo registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
