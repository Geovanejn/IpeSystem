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
import { Plus, Trash2, Edit2, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Offering } from "@shared/schema";
import { insertOfferingSchema } from "@shared/schema";

const formSchema = insertOfferingSchema.extend({
  type: z.enum(["social", "geral", "obra", "missoes"]),
});

type FormData = z.infer<typeof formSchema>;

const OFFERING_TYPES = {
  social: "Social",
  geral: "Geral",
  obra: "Obra",
  missoes: "Missões",
} as const;

const TYPE_COLORS = {
  social: "bg-blue-100 text-blue-800",
  geral: "bg-purple-100 text-purple-800",
  obra: "bg-orange-100 text-orange-800",
  missoes: "bg-green-100 text-green-800",
} as const;

export default function TreasurerOfferingsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar ofertas
  const { data: offerings, isLoading, refetch } = useQuery<Offering[]>({
    queryKey: ["/api/offerings"],
  });

  // Criar/atualizar oferta
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editingId) {
        return await fetch(`/api/offerings/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(r => r.json());
      }
      return await fetch("/api/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Oferta atualizada" : "Oferta criada",
        description: editingId ? "A oferta foi atualizada com sucesso" : "A nova oferta foi registrada",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/offerings"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar oferta",
        variant: "destructive",
      });
    },
  });

  // Deletar oferta
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/offerings/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Oferta deletada",
        description: "A oferta foi removida com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/offerings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar oferta",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "geral",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const handleEdit = (offering: Offering) => {
    form.reset({
      type: offering.type as any,
      amount: offering.amount.toString(),
      date: offering.date,
      notes: offering.notes || "",
    });
    setEditingId(offering.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  // Calcular totais por tipo
  const totals = offerings?.reduce(
    (acc, offer) => ({
      ...acc,
      [offer.type]: (acc[offer.type] || 0) + parseFloat(offer.amount.toString()),
    }),
    {} as Record<string, number>
  ) || {};

  const totalOfferings = Object.values(totals).reduce((a, b) => a + b, 0);

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Ofertas</h1>
          <p className="text-muted-foreground mt-1">Gestão de ofertas por tipo</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-offering">
              <Plus className="h-4 w-4" />
              Nova Oferta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Oferta" : "Nova Oferta"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados da oferta" : "Registre uma nova oferta"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Oferta</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-offering-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(OFFERING_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key} data-testid={`option-${key}`}>
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
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
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite observações..." data-testid="textarea-notes" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                  data-testid="button-save-offering"
                >
                  {mutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Totais por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent" data-testid="stat-total-offerings">
              R$ {totalOfferings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {Object.entries(OFFERING_TYPES).map(([type, label]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`stat-total-${type}`}>
                R$ {(totals[type] || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {offerings?.filter(o => o.type === type).length || 0} entrada{offerings?.filter(o => o.type === type).length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Ofertas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ofertas</CardTitle>
          <CardDescription>Todas as ofertas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerings && offerings.length > 0 ? (
                  offerings.map((offering) => (
                    <TableRow key={offering.id} data-testid={`row-offering-${offering.id}`}>
                      <TableCell>
                        {new Date(offering.date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${TYPE_COLORS[offering.type]}`}>
                          {OFFERING_TYPES[offering.type]}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {parseFloat(offering.amount.toString()).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{offering.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(offering)}
                            data-testid={`button-edit-${offering.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(offering.id)}
                            data-testid={`button-delete-${offering.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma oferta registrada
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
