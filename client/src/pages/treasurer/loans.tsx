import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Loan } from "@shared/schema";
import { insertLoanSchema } from "@shared/schema";
import { z } from "zod";

const loanFormSchema = insertLoanSchema.extend({
  totalAmount: z.string().min(1, "Informe o valor total").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  installmentAmount: z.string().min(1, "Informe o valor da parcela").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

export default function TreasurerLoansPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: loans = [], isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      creditorName: "",
      totalAmount: "",
      installments: 1,
      installmentAmount: "",
      firstInstallmentDate: new Date().toISOString().split("T")[0],
      receiptUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LoanFormData) => {
      const payload = {
        creditorName: data.creditorName,
        totalAmount: parseFloat(data.totalAmount).toFixed(2),
        installments: data.installments,
        installmentAmount: parseFloat(data.installmentAmount).toFixed(2),
        firstInstallmentDate: data.firstInstallmentDate,
        receiptUrl: data.receiptUrl || undefined,
      };
      return await apiRequest(editingId ? "PATCH" : "POST", editingId ? `/api/loans/${editingId}` : "/api/loans", payload);
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Empréstimo atualizado" : "Empréstimo registrado",
        description: editingId ? "O empréstimo foi atualizado com sucesso." : "O empréstimo foi registrado e as parcelas foram geradas automaticamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
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
      return await apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Empréstimo excluído",
        description: "O empréstimo foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir empréstimo",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (loan: Loan) => {
    form.reset({
      creditorName: loan.creditorName,
      totalAmount: loan.totalAmount.toString(),
      installments: loan.installments,
      installmentAmount: loan.installmentAmount.toString(),
      firstInstallmentDate: loan.firstInstallmentDate,
      receiptUrl: loan.receiptUrl || "",
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

  const totalLoaned = loans.reduce((sum, loan) => sum + parseFloat(loan.totalAmount), 0);

  if (loansLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Gestão de empréstimos para a igreja</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-loan">
              <Plus className="h-4 w-4" />
              Novo Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Empréstimo" : "Novo Empréstimo"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados do empréstimo" : "Registre um novo empréstimo. As parcelas serão geradas automaticamente nas despesas."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="creditorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Credor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Banco Itaú, João Silva" data-testid="input-creditor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" data-testid="input-total-amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="12" min="1" data-testid="input-installments" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="installmentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Parcela (R$) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" data-testid="input-installment-amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstInstallmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da 1ª Parcela *</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="input-first-installment-date" {...field} />
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
                      <FormLabel>URL do Comprovante</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." data-testid="input-receipt-url" {...field} />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emprestado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-loaned">
              {formatCurrency(totalLoaned)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quantidade de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-count">
              {loans.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média por Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-average">
              {formatCurrency(loans.length > 0 ? totalLoaned / loans.length : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>Credor</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Valor da Parcela</TableHead>
                  <TableHead>1ª Parcela</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? (
                  loans.map((loan) => (
                    <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`}>
                      <TableCell className="font-medium">{loan.creditorName}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(loan.totalAmount)}</TableCell>
                      <TableCell>{loan.installments}x</TableCell>
                      <TableCell>{formatCurrency(loan.installmentAmount)}</TableCell>
                      <TableCell>{formatDate(loan.firstInstallmentDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(loan)}
                            data-testid={`button-edit-${loan.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(loan.id)}
                            data-testid={`button-delete-${loan.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum empréstimo registrado
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
              Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.
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
