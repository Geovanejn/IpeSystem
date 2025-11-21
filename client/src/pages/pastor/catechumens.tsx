import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCatechumenSchema } from "@shared/schema";
import type { Catechumen, Member } from "@shared/schema";
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
import { Plus, Pencil, Trash2, BookOpen, Search, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schemas para formulários
const createCatechumenFormSchema = insertCatechumenSchema;
const updateCatechumenFormSchema = insertCatechumenSchema.partial();

type CreateCatechumenFormValues = z.infer<typeof createCatechumenFormSchema>;
type UpdateCatechumenFormValues = z.infer<typeof updateCatechumenFormSchema>;

// Labels e cores para etapas
const stageLabels: Record<string, string> = {
  em_andamento: "Em Andamento",
  apto: "Apto",
  concluido: "Concluído",
};

const stageColors: Record<string, string> = {
  em_andamento: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  apto: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  concluido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default function CatechumensPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCatechumen, setSelectedCatechumen] = useState<Catechumen | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Buscar catecúmenos
  const { data: catechumens, isLoading: catechumensLoading } = useQuery<Catechumen[]>({
    queryKey: ["/api/catechumens"],
  });

  // Buscar membros (para selecionar professor - Pastor)
  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Filtrar apenas pastores
  const pastors = members?.filter(m => m.ecclesiasticalRole === "pastor") || [];
  
  // Pegar o primeiro pastor como padrão (ou criar um filtro mais específico)
  const defaultPastorId = pastors.length > 0 ? pastors[0].id : "";

  // Formulários
  const createForm = useForm<CreateCatechumenFormValues>({
    resolver: zodResolver(createCatechumenFormSchema),
    defaultValues: {
      fullName: "",
      startDate: new Date().toISOString().split('T')[0],
      expectedProfessionDate: "",
      stage: "em_andamento",
      professorId: defaultPastorId,
      notes: "",
    },
  });

  const editForm = useForm<UpdateCatechumenFormValues>({
    resolver: zodResolver(updateCatechumenFormSchema),
    defaultValues: {
      fullName: "",
      startDate: "",
      expectedProfessionDate: "",
      stage: "em_andamento",
      professorId: "",
      notes: "",
    },
  });

  // Auto-popular professorId quando members carregar
  useEffect(() => {
    if (defaultPastorId && !createForm.getValues("professorId")) {
      createForm.setValue("professorId", defaultPastorId);
    }
  }, [defaultPastorId, createForm]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: CreateCatechumenFormValues) => {
      const response = await apiRequest("POST", "/api/catechumens", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/catechumens"] });
      toast({
        title: "Catecúmeno cadastrado",
        description: "O catecúmeno foi cadastrado com sucesso.",
      });
      setCreateDialogOpen(false);
      createForm.reset({
        fullName: "",
        startDate: new Date().toISOString().split('T')[0],
        expectedProfessionDate: "",
        stage: "em_andamento",
        professorId: defaultPastorId,
        notes: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar catecúmeno",
        description: error.message || "Ocorreu um erro ao cadastrar o catecúmeno.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCatechumenFormValues }) => {
      const response = await apiRequest("PUT", `/api/catechumens/${id}`, data);
      return response.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/catechumens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] }); // Atualizar lista de membros também
      
      // ✅ Verificar se um membro foi criado automaticamente
      if (response.memberCreated) {
        toast({
          title: "✅ Catecúmeno concluído e Membro criado!",
          description: `${response.memberName} agora é um membro ativo da igreja. Complete os dados pessoais na página de Membros.`,
          duration: 7000,
        });
      } else {
        toast({
          title: "Catecúmeno atualizado",
          description: "O catecúmeno foi atualizado com sucesso.",
        });
      }
      
      setEditDialogOpen(false);
      editForm.reset({
        fullName: "",
        startDate: "",
        expectedProfessionDate: "",
        stage: "em_andamento",
        professorId: defaultPastorId,
        notes: "",
      });
      setSelectedCatechumen(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar catecúmeno",
        description: error.message || "Ocorreu um erro ao atualizar o catecúmeno.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/catechumens/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/catechumens"] });
      toast({
        title: "Catecúmeno removido",
        description: "O catecúmeno foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setSelectedCatechumen(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover catecúmeno",
        description: error.message || "Ocorreu um erro ao remover o catecúmeno.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const onCreateSubmit = (data: CreateCatechumenFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: UpdateCatechumenFormValues) => {
    if (!selectedCatechumen) return;
    updateMutation.mutate({ id: selectedCatechumen.id, data });
  };

  const handleEdit = (catechumen: Catechumen) => {
    setSelectedCatechumen(catechumen);
    editForm.reset({
      fullName: catechumen.fullName,
      startDate: catechumen.startDate,
      expectedProfessionDate: catechumen.expectedProfessionDate || "",
      stage: catechumen.stage,
      professorId: catechumen.professorId,
      notes: catechumen.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (catechumen: Catechumen) => {
    setSelectedCatechumen(catechumen);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCatechumen) {
      deleteMutation.mutate(selectedCatechumen.id);
    }
  };

  // Filtros
  const filteredCatechumens = catechumens?.filter((cat) => {
    const matchesSearch = cat.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || cat.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  }) || [];

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  if (catechumensLoading) {
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
          <h1 className="text-3xl font-bold">Catecúmenos</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de catecúmenos em preparação para profissão de fé
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-catechumen">
              <Plus className="w-4 h-4 mr-2" />
              Novo Catecúmeno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Catecúmeno</DialogTitle>
              <DialogDescription>
                Preencha os dados do catecúmeno em preparação
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
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="expectedProfessionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previsão Profissão de Fé</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-expected-profession-date"
                          />
                        </FormControl>
                        <FormDescription>
                          Data prevista para a profissão de fé
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etapa *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-stage">
                              <SelectValue placeholder="Selecione a etapa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="apto">Apto</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Ao marcar como "Concluído", um membro será criado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="professorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professor *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-professor">
                              <SelectValue placeholder="Carregando..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pastors.map((pastor) => (
                              <SelectItem key={pastor.id} value={pastor.id}>
                                {pastor.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Campo bloqueado - automaticamente preenchido com o Pastor
                        </FormDescription>
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
                          placeholder="Informações adicionais sobre o progresso do catecúmeno"
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

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ao marcar um catecúmeno como <strong>"Concluído"</strong>, um registro de membro será criado automaticamente no sistema.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lista de Catecúmenos
          </CardTitle>
          <CardDescription>
            Acompanhamento do progresso dos catecúmenos em preparação
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-stage">
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="apto">Apto</SelectItem>
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
                  <TableHead>Data Início</TableHead>
                  <TableHead>Previsão Profissão</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatechumens.length > 0 ? (
                  filteredCatechumens.map((catechumen) => (
                    <TableRow key={catechumen.id} data-testid={`row-catechumen-${catechumen.id}`}>
                      <TableCell className="font-medium">{catechumen.fullName}</TableCell>
                      <TableCell>{formatDate(catechumen.startDate)}</TableCell>
                      <TableCell>{formatDate(catechumen.expectedProfessionDate || "")}</TableCell>
                      <TableCell>
                        <Badge className={stageColors[catechumen.stage]} variant="secondary">
                          {stageLabels[catechumen.stage]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(catechumen)}
                            data-testid={`button-edit-${catechumen.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(catechumen)}
                            data-testid={`button-delete-${catechumen.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum catecúmeno encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCatechumens.length} de {catechumens?.length || 0} catecúmenos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Catecúmeno</DialogTitle>
            <DialogDescription>
              Atualize os dados do catecúmeno
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-edit-start-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="expectedProfessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previsão Profissão de Fé</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-edit-expected-profession-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etapa</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-stage">
                            <SelectValue placeholder="Selecione a etapa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="apto">Apto</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Marcar como "Concluído" criará um membro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="professorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-professor">
                            <SelectValue placeholder="Carregando..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pastors.map((pastor) => (
                            <SelectItem key={pastor.id} value={pastor.id}>
                              {pastor.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Campo bloqueado - sempre o Pastor responsável
                      </FormDescription>
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
                        placeholder="Informações adicionais sobre o progresso do catecúmeno"
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
              Tem certeza que deseja remover o catecúmeno <strong>{selectedCatechumen?.fullName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
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
