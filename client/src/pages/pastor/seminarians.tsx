import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSeminarianSchema } from "@shared/schema";
import type { Seminarian } from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GraduationCap, Search } from "lucide-react";

// Schemas para formulários
const createSeminarianFormSchema = insertSeminarianSchema;
const updateSeminarianFormSchema = insertSeminarianSchema.partial();

type CreateSeminarianFormValues = z.infer<typeof createSeminarianFormSchema>;
type UpdateSeminarianFormValues = z.infer<typeof updateSeminarianFormSchema>;

// Labels e cores para status
const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  em_estagio: "Em Estágio",
  concluido: "Concluído",
};

const statusColors: Record<string, string> = {
  ativo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  em_estagio: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  concluido: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

// Instituições teológicas comuns
const commonInstitutions = [
  "CPAJ - Centro Presbiteriano de Pós-Graduação Andrew Jumper",
  "FTSA - Faculdade Teológica Sul Americana",
  "JMC - Instituto Presbiteriano José Manoel da Conceição",
  "STB - Seminário Teológico Betel Brasileiro",
  "Outra instituição",
];

export default function SeminariansPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSeminarian, setSelectedSeminarian] = useState<Seminarian | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Buscar seminaristas
  const { data: seminarians, isLoading: seminariansLoading } = useQuery<Seminarian[]>({
    queryKey: ["/api/seminarians"],
  });

  // Formulários
  const createForm = useForm<CreateSeminarianFormValues>({
    resolver: zodResolver(createSeminarianFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      institution: "",
      enrollmentYear: new Date().getFullYear(),
      status: "ativo",
      notes: "",
    },
  });

  const editForm = useForm<UpdateSeminarianFormValues>({
    resolver: zodResolver(updateSeminarianFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      institution: "",
      enrollmentYear: new Date().getFullYear(),
      status: "ativo",
      notes: "",
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateSeminarianFormValues) => {
      const response = await apiRequest("POST", "/api/seminarians", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seminarians"] });
      toast({
        title: "Seminarista cadastrado",
        description: "O seminarista foi cadastrado com sucesso.",
      });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar seminarista",
        description: error.message || "Ocorreu um erro ao cadastrar o seminarista.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSeminarianFormValues }) => {
      const response = await apiRequest("PUT", `/api/seminarians/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seminarians"] });
      toast({
        title: "Seminarista atualizado",
        description: "O seminarista foi atualizado com sucesso.",
      });
      setEditDialogOpen(false);
      editForm.reset();
      setSelectedSeminarian(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar seminarista",
        description: error.message || "Ocorreu um erro ao atualizar o seminarista.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/seminarians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seminarians"] });
      toast({
        title: "Seminarista removido",
        description: "O seminarista foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setSelectedSeminarian(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover seminarista",
        description: error.message || "Ocorreu um erro ao remover o seminarista.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const onCreateSubmit = (data: CreateSeminarianFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: UpdateSeminarianFormValues) => {
    if (!selectedSeminarian) return;
    updateMutation.mutate({ id: selectedSeminarian.id, data });
  };

  const handleEdit = (seminarian: Seminarian) => {
    setSelectedSeminarian(seminarian);
    editForm.reset({
      fullName: seminarian.fullName,
      email: seminarian.email,
      phone: seminarian.phone,
      institution: seminarian.institution,
      enrollmentYear: seminarian.enrollmentYear,
      status: seminarian.status,
      notes: seminarian.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (seminarian: Seminarian) => {
    setSelectedSeminarian(seminarian);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSeminarian) {
      deleteMutation.mutate(selectedSeminarian.id);
    }
  };

  // Filtros
  const filteredSeminarians = seminarians?.filter((sem) => {
    const matchesSearch = 
      sem.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sem.institution.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (seminariansLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Seminaristas</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de seminaristas da IPE
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-seminarian">
              <Plus className="w-4 h-4 mr-2" />
              Novo Seminarista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Seminarista</DialogTitle>
              <DialogDescription>
                Preencha os dados do seminarista
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo"
                          {...field}
                          data-testid="input-fullname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 98765-4321"
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição Teológica *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-institution">
                            <SelectValue placeholder="Selecione a instituição" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commonInstitutions.map((inst) => (
                            <SelectItem key={inst} value={inst}>
                              {inst}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione "Outra instituição" e especifique nas observações se necessário
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="enrollmentYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano de Ingresso *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2100"
                            placeholder="2024"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            data-testid="input-enrollment-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="em_estagio">Em Estágio</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o seminarista"
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Lista de Seminaristas
          </CardTitle>
          <CardDescription>
            Seminaristas aparecem automaticamente no boletim dominical
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou instituição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em_estagio">Em Estágio</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Ano Ingresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSeminarians.length > 0 ? (
                  filteredSeminarians.map((seminarian) => (
                    <TableRow key={seminarian.id} data-testid={`row-seminarian-${seminarian.id}`}>
                      <TableCell className="font-medium">{seminarian.fullName}</TableCell>
                      <TableCell>{seminarian.email}</TableCell>
                      <TableCell>{seminarian.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={seminarian.institution}>
                        {seminarian.institution}
                      </TableCell>
                      <TableCell>{seminarian.enrollmentYear}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[seminarian.status]} variant="secondary">
                          {statusLabels[seminarian.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(seminarian)}
                            data-testid={`button-edit-${seminarian.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(seminarian)}
                            data-testid={`button-delete-${seminarian.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum seminarista encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredSeminarians.length} de {seminarians?.length || 0} seminaristas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Seminarista</DialogTitle>
            <DialogDescription>
              Atualize os dados do seminarista
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome completo"
                        {...field}
                        data-testid="input-edit-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                          data-testid="input-edit-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 98765-4321"
                          {...field}
                          data-testid="input-edit-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição Teológica</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-institution">
                          <SelectValue placeholder="Selecione a instituição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonInstitutions.map((inst) => (
                          <SelectItem key={inst} value={inst}>
                            {inst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="enrollmentYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano de Ingresso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1900"
                          max="2100"
                          placeholder="2024"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : Number(value));
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          data-testid="input-edit-enrollment-year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-status">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="em_estagio">Em Estágio</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre o seminarista"
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedSeminarian?.fullName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
