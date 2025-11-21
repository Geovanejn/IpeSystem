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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Plus, FileText, Clock, CheckCircle } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["correction", "deletion", "access", "portability"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  fields: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Request {
  id: string;
  type: "correction" | "deletion" | "access" | "portability";
  description: string;
  fields?: string;
  status: "pending" | "approved" | "completed";
  createdAt: string;
  completedAt?: string;
}

const REQUEST_TYPES = {
  correction: "Correção de Dados",
  deletion: "Exclusão de Dados",
  access: "Acesso aos Dados",
  portability: "Portabilidade de Dados",
} as const;

const STATUS_LABELS = {
  pending: "Pendente",
  approved: "Aprovado",
  completed: "Concluído",
} as const;

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
} as const;

export default function LGPDRequestsPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: requests, isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ["/api/lgpd-requests"],
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/lgpd-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação LGPD foi enviada com sucesso. Você será notificado em breve.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lgpd-requests"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar solicitação",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "correction",
      description: "",
      fields: "",
    },
  });

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;
  const completedCount = requests?.filter(r => r.status === "completed").length || 0;

  if (requestsLoading) {
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
          <h1 className="text-3xl font-bold">Minhas Solicitações LGPD</h1>
          <p className="text-muted-foreground mt-1">Gerenciar solicitações de dados pessoais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-new-request">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação LGPD</DialogTitle>
              <DialogDescription>
                Envie uma solicitação para correção, exclusão ou acesso aos seus dados
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Solicitação *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(REQUEST_TYPES).map(([key, label]) => (
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
                  name="fields"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campos Relacionados (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Nome, Email, Telefone" 
                          data-testid="input-fields"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Solicitação *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva sua solicitação em detalhes..." 
                          className="min-h-[120px]"
                          data-testid="textarea-description"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit">
                  {mutation.isPending ? "Enviando..." : "Enviar Solicitação"}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Solicitações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="stat-total">
              {requests?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600" data-testid="stat-pending">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-completed">
              {completedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert */}
      <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900 dark:text-yellow-200">Importante</p>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Todas as solicitações LGPD serão processadas em até 30 dias conforme a legislação brasileira.
          </p>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações</CardTitle>
          <CardDescription>Todas as suas solicitações LGPD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests && requests.length > 0 ? (
                  requests
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((request) => (
                      <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">
                          {REQUEST_TYPES[request.type]}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{request.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                            {STATUS_LABELS[request.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {request.completedAt ? new Date(request.completedAt).toLocaleDateString("pt-BR") : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma solicitação registrada
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
