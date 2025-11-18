import { Shield, FileText, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LGPDDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Portal LGPD</h1>
        <p className="text-muted-foreground">
          Gerencie seus dados pessoais de acordo com a Lei Geral de Proteção de Dados
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Seus dados estão protegidos</AlertTitle>
        <AlertDescription>
          A Igreja Presbiteriana Emaús está comprometida com a proteção e privacidade dos seus dados pessoais.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="hover-elevate transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              Meus Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize e edite suas informações pessoais armazenadas no sistema
            </p>
            <Button variant="outline" className="w-full" data-testid="button-view-data">
              Ver Meus Dados
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Download className="h-5 w-5 text-accent" />
              Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe todos os seus dados em formato PDF, Excel ou JSON
            </p>
            <Button variant="outline" className="w-full" data-testid="button-export-data">
              Exportar Dados
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Solicite correção ou exclusão dos seus dados pessoais
            </p>
            <Button variant="outline" className="w-full" data-testid="button-requests">
              Minhas Solicitações
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações sobre seus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Dados Cadastrais</p>
              <p className="text-sm">Nome, email, telefone, endereço</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Situação Espiritual</p>
              <p className="text-sm">Informações sobre participação na igreja</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Dados Financeiros</p>
              <p className="text-sm">Histórico de dízimos e ofertas (se aplicável)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Termo de Consentimento</p>
              <p className="text-sm">Documento assinado em: 15/01/2024</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-medium mb-2">Seus direitos LGPD:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os seus dados armazenados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimizar, bloquear ou eliminar dados desnecessários</li>
              <li>Revogar o consentimento para o tratamento de dados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
