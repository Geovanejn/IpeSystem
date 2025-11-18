import { Download, FileText, File, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function LGPDExport() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Exportar Meus Dados</h1>
        <p className="text-muted-foreground">
          Baixe todos os seus dados pessoais armazenados no sistema IPE
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          De acordo com a LGPD, você tem o direito de receber uma cópia de todos os seus dados pessoais em formato legível e portável.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="hover-elevate transition-all">
          <CardHeader>
            <FileText className="h-10 w-10 text-destructive mb-3" />
            <CardTitle>Formato PDF</CardTitle>
            <CardDescription>
              Documento formatado e pronto para impressão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>✓ Dados pessoais completos</li>
              <li>✓ Histórico de participações</li>
              <li>✓ Informações financeiras</li>
              <li>✓ Termos de consentimento</li>
            </ul>
            <Button className="w-full" data-testid="button-export-pdf">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader>
            <File className="h-10 w-10 text-green-600 mb-3" />
            <CardTitle>Formato Excel</CardTitle>
            <CardDescription>
              Planilha editável para análise de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>✓ Dados estruturados em tabelas</li>
              <li>✓ Fácil análise e comparação</li>
              <li>✓ Compatível com Excel/Sheets</li>
              <li>✓ Histórico completo de atividades</li>
            </ul>
            <Button className="w-full" variant="outline" data-testid="button-export-excel">
              <Download className="h-4 w-4 mr-2" />
              Baixar Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader>
            <Code className="h-10 w-10 text-accent mb-3" />
            <CardTitle>Formato JSON</CardTitle>
            <CardDescription>
              Dados em formato técnico portável
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>✓ Formato padrão de dados</li>
              <li>✓ Fácil importação em sistemas</li>
              <li>✓ Estrutura hierárquica</li>
              <li>✓ Ideal para portabilidade</li>
            </ul>
            <Button className="w-full" variant="outline" data-testid="button-export-json">
              <Download className="h-4 w-4 mr-2" />
              Baixar JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>O que está incluído na exportação?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="secondary">Dados Pessoais</Badge>
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Nome completo e informações de identificação</li>
                <li>• Contatos (email, telefone, endereço)</li>
                <li>• Data de nascimento e estado civil</li>
                <li>• Informações de admissão na igreja</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="secondary">Situação Espiritual</Badge>
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Status de comunhão</li>
                <li>• Cargo eclesiástico</li>
                <li>• Participação em departamentos</li>
                <li>• Histórico de presença</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="secondary">Dados Financeiros</Badge>
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Histórico de dízimos</li>
                <li>• Ofertas realizadas</li>
                <li>• Compras na livraria</li>
                <li>• Ajuda diaconal recebida (se aplicável)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="secondary">Documentos LGPD</Badge>
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Termos de consentimento assinados</li>
                <li>• Histórico de autorizações</li>
                <li>• Solicitações de correção/exclusão</li>
                <li>• Logs de acesso aos dados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exportações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Exportação PDF</p>
                <p className="text-xs text-muted-foreground">15 de outubro de 2024, 14:35</p>
              </div>
              <Badge variant="secondary">Concluída</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Exportação Excel</p>
                <p className="text-xs text-muted-foreground">03 de setembro de 2024, 09:12</p>
              </div>
              <Badge variant="secondary">Concluída</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
