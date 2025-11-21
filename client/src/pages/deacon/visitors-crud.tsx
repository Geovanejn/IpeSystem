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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, UserCheck } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Visitor, Member } from "@shared/schema";
import { insertVisitorSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertVisitorSchema.extend({
  hasChurch: z.boolean().default(false),
  churchOrigin: z.string().optional(),
  invitedByMemberId: z.string().min(1, "Selecione quem convidou"),
});

type FormData = z.infer<typeof formSchema>;

export default function DeaconVisitorsCRUD() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasChurch, setHasChurch] = useState(false);
  const { toast } = useToast();

  // Buscar visitantes e membros
  const { data: visitors, isLoading: visitorsLoading } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Criar/atualizar visitante
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        hasChurch: hasChurch,
        churchOrigin: hasChurch ? data.churchOrigin : null,
        invitedByMemberId: data.invitedByMemberId,
        firstVisitDate: data.firstVisitDate,
        notes: data.notes,
        lgpdConsentUrl: "https://example.com/consent",
      };

      if (editingId) {
        return await fetch(`/api/visitors/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Visitante atualizado" : "Visitante criado",
        description: editingId ? "As informações foram atualizadas" : "O visitante foi registrado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
      setHasChurch(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar visitante",
        variant: "destructive",
      });
    },
  });

  // Deletar visitante
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/visitors/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Visitante deletado",
        description: "O visitante foi removido",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar visitante",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      hasChurch: false,
      churchOrigin: "",
      invitedByMemberId: "",
      firstVisitDate: new Date().toISOString().split("T")[0],
      notes: "",
      lgpdConsentUrl: "",
    },
  });

  const handleEdit = (visitor: Visitor) => {
    form.reset({
      fullName: visitor.fullName,
      phone: visitor.phone || "",
      email: visitor.email || "",
      address: visitor.address || "",
      hasChurch: visitor.hasChurch,
      churchOrigin: visitor.churchOrigin || "",
      invitedByMemberId: visitor.invitedByMemberId || "",
      firstVisitDate: visitor.firstVisitDate,
      notes: visitor.notes || "",
      lgpdConsentUrl: visitor.lgpdConsentUrl,
    });
    setHasChurch(visitor.hasChurch);
    setEditingId(visitor.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      setHasChurch(false);
      form.reset();
    }
    setOpen(newOpen);
  };

  const isLoading = visitorsLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visitantes</h1>
          <p className="text-muted-foreground mt-1">Cadastro e acompanhamento de visitantes</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-visitor">
              <Plus className="h-4 w-4" />
              Novo Visitante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Visitante" : "Novo Visitante"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados do visitante" : "Registre um novo visitante"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do visitante" data-testid="input-fullname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" data-testid="input-phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" data-testid="input-email" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, bairro, CEP" data-testid="input-address" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <FormLabel>É de alguma igreja?</FormLabel>
                  <Switch checked={hasChurch} onCheckedChange={setHasChurch} data-testid="switch-has-church" />
                </div>
                {hasChurch && (
                  <FormField
                    control={form.control}
                    name="churchOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual igreja?</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da igreja" data-testid="input-church-origin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="invitedByMemberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem convidou? *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-invited-by">
                            <SelectValue placeholder="Selecione um membro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.id} value={member.id} data-testid={`option-member-${member.id}`}>
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
                  name="firstVisitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primeira Visita *</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-first-visit" {...field} />
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
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações sobre o visitante" data-testid="textarea-notes" value={field.value || ""} onChange={field.onChange} />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Visitantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-visitors">{visitors?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Com Igreja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-with-church">
              {visitors?.filter(v => v.hasChurch).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sem Igreja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600" data-testid="stat-without-church">
              {visitors?.filter(v => !v.hasChurch).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Visitantes</CardTitle>
          <CardDescription>Todos os visitantes cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Igreja</TableHead>
                  <TableHead>1ª Visita</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors && visitors.length > 0 ? (
                  visitors.map((visitor) => (
                    <TableRow key={visitor.id} data-testid={`row-visitor-${visitor.id}`}>
                      <TableCell className="font-medium">{visitor.fullName}</TableCell>
                      <TableCell>{visitor.phone || "-"}</TableCell>
                      <TableCell>{visitor.email || "-"}</TableCell>
                      <TableCell>
                        {visitor.hasChurch ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {visitor.churchOrigin || "Sim"}
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Sem Igreja
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(visitor.firstVisitDate + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(visitor)} data-testid={`button-edit-${visitor.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(visitor.id)} data-testid={`button-delete-${visitor.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum visitante cadastrado
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
