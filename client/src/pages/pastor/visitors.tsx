import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, MapPin, Church, Calendar, User, FileText, Info } from "lucide-react";
import type { Visitor } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

type VisitorWithInviter = Visitor & {
  invitedByMemberName?: string;
};

export default function PastorVisitorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChurchFilter, setHasChurchFilter] = useState<string>("all");

  // Buscar visitantes
  const { data: visitors, isLoading: visitorsLoading } = useQuery<VisitorWithInviter[]>({
    queryKey: ["/api/visitors"],
  });

  // Buscar membros para mostrar quem convidou
  const { data: members, isLoading: membersLoading } = useQuery<any[]>({
    queryKey: ["/api/members"],
  });

  // Enriquecer visitantes com nome do membro que convidou
  const enrichedVisitors = visitors?.map(visitor => ({
    ...visitor,
    invitedByMemberName: visitor.invitedByMemberId 
      ? members?.find(m => m.id === visitor.invitedByMemberId)?.fullName 
      : undefined
  })) || [];

  // Filtros
  const filteredVisitors = enrichedVisitors.filter((visitor) => {
    const matchesSearch = 
      visitor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visitor.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (visitor.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesChurch = 
      hasChurchFilter === "all" || 
      (hasChurchFilter === "has_church" && visitor.hasChurch) ||
      (hasChurchFilter === "no_church" && !visitor.hasChurch);
    
    return matchesSearch && matchesChurch;
  });

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  if (visitorsLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Visitantes</h1>
        <p className="text-muted-foreground mt-1">
          Visualização dos visitantes cadastrados (somente leitura)
        </p>
      </div>

      {/* Alert informativo */}
      <Alert data-testid="alert-readonly">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Visualização Somente Leitura:</strong> Esta página permite visualizar os visitantes cadastrados pelo diácono. 
          Para adicionar, editar ou remover visitantes, acesse o Painel do Diácono.
        </AlertDescription>
      </Alert>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre os visitantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  data-testid="input-search"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro por Igreja */}
            <div className="w-[200px]">
              <Select 
                value={hasChurchFilter} 
                onValueChange={setHasChurchFilter}
              >
                <SelectTrigger data-testid="select-church-filter">
                  <SelectValue placeholder="Filtrar por igreja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="has_church">Tem igreja</SelectItem>
                  <SelectItem value="no_church">Sem igreja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Visitantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Lista de Visitantes</CardTitle>
              <CardDescription>
                {filteredVisitors.length} visitante{filteredVisitors.length !== 1 ? 's' : ''} encontrado{filteredVisitors.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVisitors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum visitante encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contatos</TableHead>
                    <TableHead>Igreja</TableHead>
                    <TableHead>Convidado Por</TableHead>
                    <TableHead>1ª Visita</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id} data-testid={`row-visitor-${visitor.id}`}>
                      {/* Nome */}
                      <TableCell className="font-medium" data-testid={`cell-name-${visitor.id}`}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-name-${visitor.id}`}>{visitor.fullName}</span>
                        </div>
                      </TableCell>

                      {/* Contatos */}
                      <TableCell data-testid={`cell-contacts-${visitor.id}`}>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span data-testid={`text-phone-${visitor.id}`}>{visitor.phone}</span>
                          </div>
                          {visitor.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{visitor.email}</span>
                            </div>
                          )}
                          {visitor.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {visitor.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Igreja */}
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={visitor.hasChurch ? "default" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-church-${visitor.id}`}
                          >
                            <Church className="h-3 w-3 mr-1" />
                            {visitor.hasChurch ? "Tem igreja" : "Sem igreja"}
                          </Badge>
                          {visitor.hasChurch && visitor.churchOrigin && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {visitor.churchOrigin}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Convidado Por */}
                      <TableCell data-testid={`cell-inviter-${visitor.id}`}>
                        {visitor.invitedByMemberName ? (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span data-testid={`text-inviter-${visitor.id}`}>{visitor.invitedByMemberName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* 1ª Visita */}
                      <TableCell data-testid={`cell-visit-date-${visitor.id}`}>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span data-testid={`text-visit-date-${visitor.id}`}>{formatDate(visitor.firstVisitDate)}</span>
                        </div>
                      </TableCell>

                      {/* Observações */}
                      <TableCell>
                        {visitor.notes ? (
                          <div className="flex items-start gap-1 max-w-[200px]">
                            <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {visitor.notes}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
