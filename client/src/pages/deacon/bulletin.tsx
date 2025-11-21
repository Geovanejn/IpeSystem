import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Book, Download, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  editionNumber: z.coerce.number().min(1, "Número da edição obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  devotionalTitle: z.string().min(3, "Título do devocional obrigatório"),
  devotionalBibleText: z.string().min(3, "Texto bíblico obrigatório"),
  devotionalMessage: z.string().min(10, "Mensagem obrigatória"),
  departmentNotices: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Bulletin {
  id: string;
  editionNumber: number;
  date: string;
  devotionalTitle: string;
  devotionalBibleText: string;
  devotionalMessage: string;
  departmentNotices?: string;
  published: boolean;
  createdAt: string;
}

export default function DeaconBulletinPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: bulletins, isLoading: bulletinsLoading } = useQuery<Bulletin[]>({
    queryKey: ["/api/bulletins"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        editionNumber: data.editionNumber,
        date: data.date,
        devotionalTitle: data.devotionalTitle,
        devotionalBibleText: data.devotionalBibleText,
        devotionalMessage: data.devotionalMessage,
        departmentNotices: data.departmentNotices || "",
        liturgy: JSON.stringify({
          items: [
            { type: "hymn", title: "Hinário Cristão" },
            { type: "prayer", title: "Oração Inicial" },
            { type: "reading", title: "Leitura da Palavra" },
            { type: "sermon", title: "Mensagem" },
          ],
        }),
        published: false,
      };

      if (editingId) {
        return await fetch(`/api/bulletins/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(r => r.json());
      }
      return await fetch("/api/bulletins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: editingId ? "Boletim atualizado" : "Boletim criado",
        description: editingId ? "Boletim foi atualizado" : "Novo boletim criado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bulletins"] });
      setOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar boletim",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/bulletins/${id}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Boletim deletado",
        description: "Boletim foi removido",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bulletins"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar boletim",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await fetch(`/api/bulletins/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Boletim publicado",
        description: "Boletim foi publicado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bulletins"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao publicar boletim",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      editionNumber: bulletins && bulletins.length > 0 ? Math.max(...bulletins.map(b => b.editionNumber)) + 1 : 1,
      date: new Date().toISOString().split("T")[0],
      devotionalTitle: "",
      devotionalBibleText: "",
      devotionalMessage: "",
      departmentNotices: "",
      notes: "",
    },
  });

  const handleEdit = (bulletin: Bulletin) => {
    form.reset({
      editionNumber: bulletin.editionNumber,
      date: bulletin.date,
      devotionalTitle: bulletin.devotionalTitle,
      devotionalBibleText: bulletin.devotionalBibleText,
      devotionalMessage: bulletin.devotionalMessage,
      departmentNotices: bulletin.departmentNotices || "",
    });
    setEditingId(bulletin.id);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingId(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  const publishedCount = bulletins?.filter(b => b.published).length || 0;
  const draftCount = (bulletins?.length || 0) - publishedCount;

  if (bulletinsLoading) {
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
          <h1 className="text-3xl font-bold">Boletim Dominical</h1>
          <p className="text-muted-foreground mt-1">Gestão e publicação de boletins semanais</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-bulletin">
              <Plus className="h-4 w-4" />
              Novo Boletim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Boletim" : "Novo Boletim"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados do boletim" : "Crie um novo boletim dominical"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="editionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número da Edição *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" min="1" data-testid="input-edition" {...field} />
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
                </div>

                <FormField
                  control={form.control}
                  name="devotionalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Devocional *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fé em Ação" data-testid="input-title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="devotionalBibleText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto Bíblico *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João 3:16" data-testid="input-bible" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="devotionalMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem Devocional *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite a mensagem devocional..." 
                          className="min-h-[150px]"
                          data-testid="textarea-message"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentNotices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avisos dos Departamentos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste os avisos importantes..." 
                          className="min-h-[100px]"
                          data-testid="textarea-notices"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save">
                  {mutation.isPending ? "Salvando..." : "Salvar Boletim"}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Boletins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="stat-total">
              {bulletins?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-published">
              {publishedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600" data-testid="stat-drafts">
              {draftCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Boletins</CardTitle>
          <CardDescription>Todos os boletins criados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletins && bulletins.length > 0 ? (
                  bulletins
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((bulletin) => (
                      <TableRow key={bulletin.id} data-testid={`row-bulletin-${bulletin.id}`}>
                        <TableCell className="font-semibold">#{bulletin.editionNumber}</TableCell>
                        <TableCell>{new Date(bulletin.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="max-w-xs truncate">{bulletin.devotionalTitle}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${bulletin.published ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                            {bulletin.published ? "Publicado" : "Rascunho"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!bulletin.published && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => publishMutation.mutate(bulletin.id)}
                                data-testid={`button-publish-${bulletin.id}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(bulletin)} data-testid={`button-edit-${bulletin.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(bulletin.id)} data-testid={`button-delete-${bulletin.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum boletim criado
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
