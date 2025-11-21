import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Member } from "@shared/schema";
import { insertMemberSchema } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  "ativo": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "inativo": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  "transferido": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "em_disciplina": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

const communionColors: Record<string, string> = {
  "comungante": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "nao_comungante": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const updateMemberSchema = insertMemberSchema.partial().extend({
  id: z.string(),
});

type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;

export default function PastorMembers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Buscar membros da API
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Formulário de edição
  const editForm = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      memberStatus: "ativo",
      communionStatus: "nao_comungante",
    },
  });

  // Filtrar membros baseado na busca
  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutation para editar membro
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Member> }) => {
      const response = await apiRequest("PATCH", `/api/members/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"], refetchType: 'all' });
      toast({
        title: "Membro atualizado",
        description: "Os dados do membro foram atualizados com sucesso.",
      });
      setEditDialogOpen(false);
      setSelectedMember(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar membro",
        description: error.message || "Ocorreu um erro ao atualizar o membro.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar membro
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"], refetchType: 'all' });
      toast({
        title: "Membro removido",
        description: "O membro foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover membro",
        description: "Ocorreu um erro ao remover o membro.",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    editForm.reset({
      fullName: member.fullName,
      email: member.email,
      primaryPhone: member.primaryPhone,
      memberStatus: member.memberStatus,
      communionStatus: member.communionStatus,
      pastoralNotes: member.pastoralNotes || "",
      id: member.id,
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = (data: UpdateMemberFormValues) => {
    if (!selectedMember) return;
    editMutation.mutate({ id: selectedMember.id, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando membros...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Membros</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de membros da IPE - Total: {members.length}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member">
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha todos os dados do membro. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                Formulário de cadastro de membro será implementado aqui
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-members"
              />
            </div>
            <Button variant="outline" data-testid="button-filter">
              Filtros
            </Button>
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
                  <TableHead>Cargo</TableHead>
                  <TableHead>Comunhão</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum membro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50" data-testid={`row-member-${member.id}`}>
                      <TableCell className="font-medium" data-testid={`text-name-${member.id}`}>{member.fullName}</TableCell>
                      <TableCell data-testid={`text-email-${member.id}`}>{member.email || "-"}</TableCell>
                      <TableCell data-testid={`text-phone-${member.id}`}>{member.primaryPhone || "-"}</TableCell>
                      <TableCell data-testid={`text-role-${member.id}`}>{member.ecclesiasticalRole}</TableCell>
                      <TableCell>
                        <Badge 
                          className={communionColors[member.communionStatus] || ""}
                          variant="secondary"
                          data-testid={`badge-communion-${member.id}`}
                        >
                          {member.communionStatus === "comungante" ? "Comungante" : "Não Comungante"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[member.memberStatus] || ""}
                          variant="secondary"
                          data-testid={`badge-status-${member.id}`}
                        >
                          {member.memberStatus === "ativo" ? "Ativo" : member.memberStatus === "inativo" ? "Inativo" : member.memberStatus === "transferido" ? "Transferido" : "Em Disciplina"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(member)}
                            data-testid={`button-edit-${member.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteMutation.mutate(member.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredMembers.length} de {members.length} membros
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize os dados do membro {selectedMember?.fullName}
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
                      <Input {...field} value={field.value || ""} data-testid="input-edit-fullname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ""} data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="primaryPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-edit-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="communionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação (Comunhão)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-communion-status">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="comungante">Comungante</SelectItem>
                          <SelectItem value="nao_comungante">Não Comungante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="memberStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Administrativo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-member-status">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="transferido">Transferido</SelectItem>
                          <SelectItem value="em_disciplina">Em Disciplina</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="pastoralNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Pastorais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Anotações do pastor sobre o membro"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-pastoral-notes"
                        className="resize-none"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
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
                  disabled={editMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {editMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
