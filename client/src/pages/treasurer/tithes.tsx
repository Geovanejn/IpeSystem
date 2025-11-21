import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, DollarSign, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tithe, Member } from "@shared/schema";

const paymentMethods = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  cartao: "Cartão",
  cheque: "Cheque",
} as const;

const titheFormSchema = z.object({
  memberId: z.string().min(1, "Selecione o membro"),
  amount: z.string().min(1, "Informe o valor").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  date: z.string().min(1, "Informe a data"),
  paymentMethod: z.enum(["dinheiro", "pix", "transferencia", "cartao", "cheque"], {
    required_error: "Selecione a forma de pagamento",
  }),
  notes: z.string().optional(),
});

type TitheFormData = z.infer<typeof titheFormSchema>;

export default function TreasurerTithes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: tithes = [], isLoading: tithesLoading } = useQuery<Tithe[]>({
    queryKey: ["/api/tithes"],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const form = useForm<TitheFormData>({
    resolver: zodResolver(titheFormSchema),
    defaultValues: {
      memberId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "pix",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TitheFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
      };
      return await apiRequest("POST", "/api/tithes", payload);
    },
    onSuccess: () => {
      toast({
        title: "Dízimo registrado",
        description: "O dízimo foi registrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tithes"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao registrar dízimo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tithes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Dízimo excluído",
        description: "O dízimo foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tithes"] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir dízimo",
        variant: "destructive",
      });
    },
  });

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.fullName || "Membro não encontrado";
  };

  const filteredTithes = tithes.filter(tithe => {
    const memberName = getMemberName(tithe.memberId);
    return memberName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalThisMonth = tithes
    .filter(tithe => {
      const titheDate = new Date(tithe.date);
      const now = new Date();
      return titheDate.getMonth() === now.getMonth() && 
             titheDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, tithe) => sum + parseFloat(tithe.amount), 0);

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

  if (tithesLoading || membersLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dízimos</h1>
          <p className="text-muted-foreground">
            Registro e acompanhamento de dízimos dos membros
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tithe">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Dízimo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Dízimo</DialogTitle>
              <DialogDescription>
                Informe os dados do dízimo recebido
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4 py-4">
                <div className="grid gap-4 grid-cols-2">
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
                            {members
                              .filter(m => m.memberStatus === "ativo")
                              .sort((a, b) => a.fullName.localeCompare(b.fullName))
                              .map((member) => (
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
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01"
                            data-testid="input-amount"
                            {...field}
                          />
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
                          <Input 
                            type="date" 
                            data-testid="input-date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(paymentMethods).map(([key, label]) => (
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
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Observações adicionais (opcional)"
                          data-testid="input-notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-save-tithe"
                  >
                    {createMutation.isPending ? "Salvando..." : "Salvar Dízimo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Dízimos Registrados</CardTitle>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{formatCurrency(totalThisMonth)}</span>
              <span className="text-sm text-muted-foreground">este mês</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por membro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-tithes"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTithes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "Nenhum dízimo encontrado" : "Nenhum dízimo registrado ainda"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTithes
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((tithe) => (
                      <TableRow key={tithe.id} className="hover-elevate">
                        <TableCell className="font-medium" data-testid={`cell-member-${tithe.id}`}>
                          {getMemberName(tithe.memberId)}
                        </TableCell>
                        <TableCell className="font-semibold text-accent" data-testid={`cell-amount-${tithe.id}`}>
                          {formatCurrency(tithe.amount)}
                        </TableCell>
                        <TableCell data-testid={`cell-date-${tithe.id}`}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(tithe.date)}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`cell-payment-${tithe.id}`}>
                          {paymentMethods[tithe.paymentMethod]}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-xs truncate" data-testid={`cell-notes-${tithe.id}`}>
                          {tithe.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteId(tithe.id)}
                            data-testid={`button-delete-${tithe.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dízimo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
