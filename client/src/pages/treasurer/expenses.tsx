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
import { Plus, Trash2, Edit2, TrendingDown } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  category: z.enum(["aluguel", "agua", "luz", "manutencao", "salarios", "suprimentos", "outros"]),
  description: z.string().min(3, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  date: z.string().min(1, "Data obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const CATEGORIES = {
  aluguel: "Aluguel",
  agua: "Água",
  luz: "Eletricidade",
  manutencao: "Manutenção",
  salarios: "Salários",
  suprimentos: "Suprimentos",
  outros: "Outros",
} as const;

const CATEGORY_COLORS = {
  aluguel: "bg-red-100 text-red-800",
  agua: "bg-blue-100 text-blue-800",
  luz: "bg-yellow-100 text-yellow-800",
  manutencao: "bg-orange-100 text-orange-800",
  salarios: "bg-purple-100 text-purple-800",
  suprimentos: "bg-green-100 text-green-800",
  outros: "bg-gray-100 text-gray-800",
} as const;

export default function TreasurerExpensesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date,
      };

      if (editingId) {
        return await fetch(`/api/expenses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Despesa atualizada" : "Despesa registrada",
        description: editingId ? "Despesa foi atualizada" : "Nova despesa registrada",
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
      return await fetch(`/api/expenses/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Despesa deletada",
        description: "Despesa foi removida",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar despesa",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "outros",
      description: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleEdit = (expense: Expense) => {
    form.reset({
      category: expense.category as any,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setEditingId(expense.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  // Totais por categoria
  const totals = expenses?.reduce(
    (acc, expense) => ({
      ...acc,
      [expense.category]: (acc[expense.category] || 0) + parseFloat(expense.amount.toString()),
    }),
    {} as Record<string, number>
  ) || {};

  const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);

  if (expensesLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Saídas / Despesas</h1>
          <p className="text-muted-foreground mt-1">Gestão de despesas operacionais</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-expense">
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados da despesa" : "Registre uma nova despesa"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CATEGORIES).map(([key, label]) => (
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
                        <Textarea placeholder="Descreva a despesa" data-testid="textarea-description" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data *</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-date" {...field} />
                      </FormControl>
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

      {/* Totais por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-total">
              R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {Object.entries(CATEGORIES).map(([key, label]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold" data-testid={`stat-${key}`}>
                R$ {(totals[key] || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
          <CardDescription>Todas as despesas registradas</CardDescription>
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
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                      <TableCell>{new Date(expense.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]}`}>
                          {CATEGORIES[expense.category as keyof typeof CATEGORIES]}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className="font-semibold text-destructive">
                        - R$ {parseFloat(expense.amount.toString()).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(expense)} data-testid={`button-edit-${expense.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(expense.id)} data-testid={`button-delete-${expense.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
    </div>
  );
}
