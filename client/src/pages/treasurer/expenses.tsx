import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Link as LinkIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Expense } from "@shared/schema";
import { insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Informe o valor").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const CATEGORIES = {
  agua: "Água",
  luz: "Luz",
  internet: "Internet",
  sistema_alarme: "Sistema de Alarme",
  zeladoria: "Zeladoria",
  salario_pastor: "Salário do Pastor",
  oferta_missionarios: "Oferta Missionários",
  ajuda_diaconal: "Ajuda Diaconal",
  manutencao: "Manutenção",
  insumos: "Insumos",
  parcela_emprestimo: "Parcela de Empréstimo",
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  agua: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  luz: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  internet: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  sistema_alarme: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  zeladoria: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  salario_pastor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  oferta_missionarios: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  ajuda_diaconal: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  manutencao: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  insumos: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  parcela_emprestimo: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default function TreasurerExpensesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "insumos",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      receiptUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const payload = {
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount).toFixed(2),
        date: data.date,
        receiptUrl: data.receiptUrl,
      };
      return await apiRequest(editingId ? "PATCH" : "POST", editingId ? `/api/expenses/${editingId}` : "/api/expenses", payload);
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Despesa atualizada" : "Despesa registrada",
        description: editingId ? "A despesa foi atualizada com sucesso." : "A despesa foi registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar despesa",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir despesa",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (expense: Expense) => {
    if (expense.loanId || expense.category === "parcela_emprestimo" || expense.category === "ajuda_diaconal") {
      toast({
        title: "Edição não permitida",
        description: "Despesas geradas automaticamente não podem ser editadas diretamente.",
        variant: "destructive",
      });
      return;
    }
    
    form.reset({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      receiptUrl: expense.receiptUrl || "",
    });
    setEditingId(expense.id);
    setOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    if (expense.loanId || expense.category === "parcela_emprestimo" || expense.category === "ajuda_diaconal") {
      toast({
        title: "Exclusão não permitida",
        description: "Despesas geradas automaticamente devem ser excluídas através do módulo de origem.",
        variant: "destructive",
      });
      return;
    }
    setDeleteId(expense.id);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const totals = expenses.reduce(
    (acc, expense) => ({
      ...acc,
      [expense.category]: (acc[expense.category] || 0) + parseFloat(expense.amount),
    }),
    {} as Record<string, number>
  );

  const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);

  const manualCategories = Object.entries(CATEGORIES).filter(
    ([key]) => key !== "parcela_emprestimo" && key !== "ajuda_diaconal"
  );

  if (expensesLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saídas / Despesas</h1>
          <p className="text-muted-foreground mt-1">Gestão de despesas operacionais da igreja</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-expense">
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados da despesa" : "Registre uma nova despesa operacional"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data: ExpenseFormData) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {manualCategories.map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
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
                        <Textarea placeholder="Descreva a despesa" data-testid="textarea-description" {...field} value={field.value || ""} />
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
                          <Input type="number" placeholder="0.00" step="0.01" data-testid="input-amount" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data *</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="input-date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Comprovante *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." data-testid="input-receipt-url" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-save">
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-total">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-count">
              {expenses.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parcelas de Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-loan-installments">
              {formatCurrency(totals["parcela_emprestimo"] || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ajuda Diaconal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-diaconal-help">
              {formatCurrency(totals["ajuda_diaconal"] || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
          <CardDescription>Todas as despesas registradas, incluindo parcelas de empréstimos e ajudas diaconais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => {
                    const isAutoGenerated = expense.loanId || expense.category === "parcela_emprestimo" || expense.category === "ajuda_diaconal";
                    
                    return (
                      <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                              {CATEGORIES[expense.category as keyof typeof CATEGORIES]}
                            </span>
                            {isAutoGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex flex-col">
                            <span className="truncate">{expense.description}</span>
                            {expense.installmentNumber && (
                              <span className="text-xs text-muted-foreground">
                                Parcela {expense.installmentNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {expense.receiptUrl && (
                              <Button
                                size="icon"
                                variant="ghost"
                                asChild
                                data-testid={`button-receipt-${expense.id}`}
                              >
                                <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(expense)}
                              disabled={!!isAutoGenerated}
                              data-testid={`button-edit-${expense.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(expense)}
                              disabled={!!isAutoGenerated}
                              data-testid={`button-delete-${expense.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma despesa registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
