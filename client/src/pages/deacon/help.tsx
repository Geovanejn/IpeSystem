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
import { Plus, Trash2, Edit2, Heart } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { DiaconalHelp, Member } from "@shared/schema";
import { insertDiaconalHelpSchema } from "@shared/schema";

const formSchema = insertDiaconalHelpSchema.extend({
  type: z.enum(["cesta_basica", "remedio", "aluguel", "consulta", "transporte", "outros"]),
});

type FormData = z.infer<typeof formSchema>;

const HELP_TYPES = {
  cesta_basica: "Cesta Básica",
  remedio: "Medicamento",
  aluguel: "Aluguel",
  consulta: "Consulta",
  transporte: "Transporte",
  outros: "Outros",
} as const;

const TYPE_COLORS = {
  cesta_basica: "bg-amber-100 text-amber-800",
  remedio: "bg-red-100 text-red-800",
  aluguel: "bg-blue-100 text-blue-800",
  consulta: "bg-green-100 text-green-800",
  transporte: "bg-purple-100 text-purple-800",
  outros: "bg-gray-100 text-gray-800",
} as const;

export default function DeaconHelpPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: helps, isLoading: helpsLoading } = useQuery<DiaconalHelp[]>({
    queryKey: ["/api/diaconal-help"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        memberId: data.memberId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        date: data.date,
        receiptUrl: "https://example.com/receipt",
      };

      if (editingId) {
        return await fetch(`/api/diaconal-help/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return await fetch("/api/diaconal-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Ajuda atualizada" : "Ajuda registrada",
        description: editingId ? "A ajuda foi atualizada" : "Nova ajuda registrada",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diaconal-help"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar ajuda",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/diaconal-help/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Ajuda deletada",
        description: "A ajuda foi removida",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diaconal-help"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar ajuda",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      type: "cesta_basica",
      description: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleEdit = (help: DiaconalHelp) => {
    form.reset({
      memberId: help.memberId,
      type: help.type as any,
      description: help.description,
      amount: help.amount.toString(),
      date: help.date,
    });
    setEditingId(help.id);
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
  const totals = helps?.reduce(
    (acc, help) => ({
      ...acc,
      [help.type]: (acc[help.type] || 0) + parseFloat(help.amount.toString()),
    }),
    {} as Record<string, number>
  ) || {};

  const totalHelps = Object.values(totals).reduce((a, b) => a + b, 0);

  if (helpsLoading || membersLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Ajuda Diaconal</h1>
          <p className="text-muted-foreground mt-1">Gestão de ajudas diaconais aos membros</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-help">
              <Plus className="h-4 w-4" />
              Nova Ajuda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Ajuda" : "Nova Ajuda"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados da ajuda" : "Registre uma nova ajuda"}
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ajuda *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-help-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(HELP_TYPES).map(([key, label]) => (
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
                        <Textarea placeholder="Descreva a ajuda" data-testid="textarea-description" value={field.value || ""} onChange={field.onChange} />
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

      {/* Totais por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-total-helps">
              R$ {totalHelps.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {Object.entries(HELP_TYPES).map(([type, label]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`stat-total-${type}`}>
                R$ {(totals[type] || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ajudas</CardTitle>
          <CardDescription>Todas as ajudas diaconais registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {helps && helps.length > 0 ? (
                  helps.map((help) => (
                    <TableRow key={help.id} data-testid={`row-help-${help.id}`}>
                      <TableCell>{new Date(help.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{members?.find(m => m.id === help.memberId)?.fullName || "N/A"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${TYPE_COLORS[help.type]}`}>
                          {HELP_TYPES[help.type]}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{help.description}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {parseFloat(help.amount.toString()).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(help)} data-testid={`button-edit-${help.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(help.id)} data-testid={`button-delete-${help.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma ajuda registrada
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
