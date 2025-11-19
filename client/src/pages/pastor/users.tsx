import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import type { User, Member } from "@shared/schema";

type SafeUser = Omit<User, "password">;

const createUserSchema = z.object({
  memberId: z.string().min(1, "Selecione um membro"),
  username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["pastor", "treasurer", "deacon"], {
    required_error: "Selecione um painel",
  }),
});

const updateUserSchema = z.object({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  role: z.enum(["pastor", "treasurer", "deacon"], {
    required_error: "Selecione um painel",
  }).optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const roleLabels: Record<string, string> = {
  pastor: "Pastor",
  treasurer: "Tesoureiro",
  deacon: "Diácono",
};

const roleColors: Record<string, string> = {
  pastor: "bg-primary text-primary-foreground",
  treasurer: "bg-accent text-accent-foreground",
  deacon: "bg-green-600 text-white dark:bg-green-700",
};

export default function UsersPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/users"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      memberId: "",
      username: "",
      password: "",
      role: undefined,
    },
  });

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      password: "",
      role: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserFormValues }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
      setEditDialogOpen(false);
      editForm.reset();
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário deletado",
        description: "O usuário foi deletado com sucesso.",
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message || "Ocorreu um erro ao deletar o usuário.",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: CreateUserFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: UpdateUserFormValues) => {
    if (!selectedUser) return;
    
    // Remove campos vazios
    const cleanData: UpdateUserFormValues = {};
    if (data.password) cleanData.password = data.password;
    if (data.role) cleanData.role = data.role;
    
    updateMutation.mutate({ id: selectedUser.id, data: cleanData });
  };

  const handleEdit = (user: SafeUser) => {
    setSelectedUser(user);
    editForm.reset({
      password: "",
      role: user.role as "pastor" | "treasurer" | "deacon",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: SafeUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId || !members) return "-";
    const member = members.find((m) => m.id === memberId);
    return member?.fullName || "-";
  };

  const getAvailableMembers = () => {
    if (!members || !users) return [];
    
    // Membros que já têm usuário
    const usedMemberIds = users.map(u => u.memberId).filter(Boolean);
    
    // Retornar membros que não têm usuário ainda
    return members.filter(m => !usedMemberIds.includes(m.id));
  };

  if (usersLoading || membersLoading) {
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
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie acessos aos painéis do sistema
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-user">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Selecione um membro e defina as credenciais de acesso
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-member">
                            <SelectValue placeholder="Selecione um membro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableMembers().map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Apenas membros sem usuário aparecem na lista
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome de usuário"
                          {...field}
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Digite a senha"
                          {...field}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Painel de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Selecione o painel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pastor">Pastor</SelectItem>
                          <SelectItem value="treasurer">Tesoureiro</SelectItem>
                          <SelectItem value="deacon">Diácono</SelectItem>
                        </SelectContent>
                      </Select>
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
                    {createMutation.isPending ? "Criando..." : "Criar Usuário"}
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
            <UserCog className="w-5 h-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários com acesso aos painéis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Painel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{getMemberName(user.memberId)}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o painel de acesso ou redefina a senha
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="py-2">
                <p className="text-sm text-muted-foreground">
                  Usuário: <span className="font-medium text-foreground">{selectedUser?.username}</span>
                </p>
              </div>

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Painel de Acesso</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-role">
                          <SelectValue placeholder="Manter painel atual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pastor">Pastor</SelectItem>
                        <SelectItem value="treasurer">Tesoureiro</SelectItem>
                        <SelectItem value="deacon">Diácono</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite a nova senha"
                        {...field}
                        data-testid="input-edit-password"
                      />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para manter a senha atual
                    </FormDescription>
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
              Tem certeza que deseja deletar o usuário <strong>{selectedUser?.username}</strong>?
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
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
