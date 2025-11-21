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
import { Plus, Trash2, Edit2, ShoppingCart } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BookstoreSale, Member } from "@shared/schema";
import { insertBookstoreSaleSchema } from "@shared/schema";

const formSchema = insertBookstoreSaleSchema.extend({
  buyerType: z.enum(["member", "visitor"]),
  buyerMemberId: z.string().optional(),
  buyerVisitorName: z.string().optional(),
  paymentMethod: z.enum(["dinheiro", "pix", "transferencia", "cartao", "cheque"]),
  receiptUrl: z.string().optional(),
}).refine((data) => {
  if (data.buyerType === "member" && !data.buyerMemberId) {
    return false;
  }
  return true;
}, {
  message: "Selecione um membro quando o tipo de comprador for 'Membro'",
  path: ["buyerMemberId"],
});

type FormData = z.infer<typeof formSchema>;

const PAYMENT_METHODS = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  cartao: "Cartão",
  cheque: "Cheque",
} as const;

export default function TreasurerBookstorePage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [buyerType, setBuyerType] = useState<"member" | "visitor">("member");
  const { toast } = useToast();

  const { data: sales, isLoading: salesLoading } = useQuery<BookstoreSale[]>({
    queryKey: ["/api/bookstore-sales"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        productName: data.productName,
        quantity: data.quantity,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        buyerMemberId: buyerType === "member" ? data.buyerMemberId : null,
        buyerVisitorId: buyerType === "visitor" ? data.buyerVisitorName || null : null,
        date: data.date,
        receiptUrl: data.receiptUrl || undefined,
      };

      if (editingId) {
        return await apiRequest("PATCH", `/api/bookstore-sales/${editingId}`, body);
      }
      return await apiRequest("POST", "/api/bookstore-sales", body);
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Venda atualizada" : "Venda registrada",
        description: editingId ? "A venda foi atualizada" : "Nova venda registrada",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookstore-sales"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
      setBuyerType("member");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar venda",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/bookstore-sales/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Venda deletada",
        description: "A venda foi removida",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookstore-sales"] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar venda",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      quantity: 1,
      totalAmount: undefined,
      paymentMethod: "dinheiro",
      buyerType: "member",
      buyerMemberId: "",
      buyerVisitorName: "",
      date: new Date().toISOString().split("T")[0],
      receiptUrl: "",
    },
  });

  const handleEdit = (sale: BookstoreSale) => {
    form.reset({
      productName: sale.productName,
      quantity: sale.quantity,
      totalAmount: sale.totalAmount.toString(),
      paymentMethod: sale.paymentMethod as any,
      buyerMemberId: sale.buyerMemberId || "",
      date: sale.date,
    });
    setBuyerType(sale.buyerMemberId ? "member" : "visitor");
    setEditingId(sale.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      setBuyerType("member");
      form.reset();
    }
    setOpen(newOpen);
  };

  const totalRevenue = sales?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0) || 0;
  const totalItems = sales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;

  if (salesLoading || membersLoading) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Livraria</h1>
          <p className="text-muted-foreground mt-1">Gestão de vendas de livros e materiais</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-sale">
              <Plus className="h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venda" : "Nova Venda"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados da venda" : "Registre uma nova venda"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do produto" data-testid="input-product-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" min="1" data-testid="input-quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" data-testid="input-amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
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
                  name="buyerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Comprador *</FormLabel>
                      <Select value={field.value} onValueChange={(value) => { field.onChange(value); setBuyerType(value as "member" | "visitor"); }}>
                        <FormControl>
                          <SelectTrigger data-testid="select-buyer-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Membro</SelectItem>
                          <SelectItem value="visitor">Visitante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {buyerType === "member" && (
                  <FormField
                    control={form.control}
                    name="buyerMemberId"
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
                )}
                {buyerType === "visitor" && (
                  <FormField
                    control={form.control}
                    name="buyerVisitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Visitante</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do visitante" data-testid="input-visitor-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                <FormField
                  control={form.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Comprovante (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." data-testid="input-receipt-url" {...field} />
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent" data-testid="stat-total-sales">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="stat-total-items">
              {totalItems}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Número de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-transactions">
              {sales?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Todas as vendas da livraria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                      <TableCell>{new Date(sale.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{sale.productName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {parseFloat(sale.totalAmount.toString()).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {PAYMENT_METHODS[sale.paymentMethod]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(sale)} data-testid={`button-edit-${sale.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(sale.id)} data-testid={`button-delete-${sale.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma venda registrada
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
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
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
