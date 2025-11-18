import { useState } from "react";
import { Plus, Search, DollarSign } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const mockTithes = [
  { 
    id: "1", 
    member: "João Silva", 
    amount: "R$ 500,00", 
    date: "01/11/2024",
    paymentMethod: "PIX"
  },
  { 
    id: "2", 
    member: "Maria Santos", 
    amount: "R$ 300,00", 
    date: "03/11/2024",
    paymentMethod: "Transferência"
  },
  { 
    id: "3", 
    member: "Pedro Oliveira", 
    amount: "R$ 450,00", 
    date: "05/11/2024",
    paymentMethod: "Dinheiro"
  },
];

export default function TreasurerTithes() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTithes = mockTithes.filter(tithe =>
    tithe.member.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dízimos</h1>
          <p className="text-muted-foreground">
            Registro e acompanhamento de dízimos dos membros
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tithe">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Dízimo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Dízimo</DialogTitle>
              <DialogDescription>
                Informe os dados do dízimo recebido
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="member">Membro *</Label>
                  <Select>
                    <SelectTrigger id="member">
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
                  <Label htmlFor="amount">Valor *</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0,00" 
                    step="0.01"
                    data-testid="input-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    data-testid="input-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Forma de Pagamento *</Label>
                  <Select>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input 
                  id="notes" 
                  placeholder="Observações adicionais (opcional)"
                  data-testid="input-notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Comprovante (opcional)</Label>
                <Input 
                  id="receipt" 
                  type="file" 
                  accept="image/*,application/pdf"
                  data-testid="input-receipt"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button data-testid="button-save-tithe">Salvar Dízimo</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dízimos Registrados</CardTitle>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">R$ 1.250,00</span>
              <span className="text-sm text-muted-foreground">este mês</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por membro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-tithes"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTithes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum dízimo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTithes.map((tithe) => (
                    <TableRow key={tithe.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{tithe.member}</TableCell>
                      <TableCell className="font-semibold text-accent">
                        {tithe.amount}
                      </TableCell>
                      <TableCell>{tithe.date}</TableCell>
                      <TableCell>{tithe.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-${tithe.id}`}
                        >
                          Ver Detalhes
                        </Button>
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
