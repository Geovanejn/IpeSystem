import { useState } from "react";
import { Plus, Search, Edit, Trash2, Church } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const mockVisitors = [
  { 
    id: "1", 
    name: "Carlos Mendes", 
    phone: "(11) 98765-9999", 
    email: "carlos@email.com",
    hasChurch: true,
    churchOrigin: "Igreja Batista Central",
    firstVisit: "01/11/2024",
    invitedBy: "João Silva"
  },
  { 
    id: "2", 
    name: "Ana Costa", 
    phone: "(11) 98765-8888", 
    email: "ana@email.com",
    hasChurch: false,
    churchOrigin: null,
    firstVisit: "03/11/2024",
    invitedBy: "Maria Santos"
  },
];

export default function DeaconVisitors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChurch, setHasChurch] = useState(false);

  const filteredVisitors = mockVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.phone.includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Visitantes</h1>
          <p className="text-muted-foreground">
            Cadastro e acompanhamento de visitantes da IPE
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-add-visitor">
              <Plus className="h-4 w-4 mr-2" />
              Novo Visitante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Visitante</DialogTitle>
              <DialogDescription>
                Registre as informações do visitante. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input 
                    id="name" 
                    placeholder="Nome completo do visitante"
                    data-testid="input-visitor-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="(11) 98765-4321"
                    data-testid="input-visitor-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="email@exemplo.com"
                    data-testid="input-visitor-email"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    placeholder="Rua, número, complemento, bairro, CEP"
                    data-testid="input-visitor-address"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-church">É de alguma igreja?</Label>
                    <Switch 
                      id="has-church"
                      checked={hasChurch}
                      onCheckedChange={setHasChurch}
                      data-testid="switch-has-church"
                    />
                  </div>
                </div>
                {hasChurch && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="church-origin">Qual igreja?</Label>
                    <Input 
                      id="church-origin" 
                      placeholder="Nome da igreja de origem"
                      data-testid="input-church-origin"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invited-by">Quem convidou?</Label>
                  <Select>
                    <SelectTrigger id="invited-by">
                      <SelectValue placeholder="Selecione o membro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Maria Santos</SelectItem>
                      <SelectItem value="3">Pedro Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first-visit">Primeira Visita *</Label>
                  <Input 
                    id="first-visit" 
                    type="date"
                    data-testid="input-first-visit"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input 
                    id="notes" 
                    placeholder="Observações sobre o visitante"
                    data-testid="input-visitor-notes"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="lgpd-consent">Termo de Consentimento LGPD *</Label>
                  <Input 
                    id="lgpd-consent" 
                    type="file"
                    accept="image/*,application/pdf"
                    data-testid="input-lgpd-consent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload obrigatório do termo de autorização LGPD assinado
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button data-testid="button-save-visitor">Salvar Visitante</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitantes</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-visitors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Igreja de Origem</TableHead>
                  <TableHead>Primeira Visita</TableHead>
                  <TableHead>Convidado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum visitante encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{visitor.name}</TableCell>
                      <TableCell>{visitor.phone}</TableCell>
                      <TableCell>{visitor.email}</TableCell>
                      <TableCell>
                        {visitor.hasChurch ? (
                          <div className="flex items-center gap-1">
                            <Church className="h-3 w-3 text-primary" />
                            <span className="text-sm">{visitor.churchOrigin}</span>
                          </div>
                        ) : (
                          <Badge variant="secondary">Não possui</Badge>
                        )}
                      </TableCell>
                      <TableCell>{visitor.firstVisit}</TableCell>
                      <TableCell>{visitor.invitedBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-edit-${visitor.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-${visitor.id}`}
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
        </CardContent>
      </Card>
    </div>
  );
}
