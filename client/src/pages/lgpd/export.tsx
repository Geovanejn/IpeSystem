import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, FileText, File, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const exportFormSchema = z.object({
  identifier: z.string().min(1, "Informe seu CPF ou email"),
  format: z.enum(["json", "csv", "pdf"], {
    required_error: "Selecione o formato de exportação",
  }),
});

type ExportFormData = z.infer<typeof exportFormSchema>;

export default function LGPDExport() {
  const { toast } = useToast();
  const [exportHistory] = useState<Array<{ format: string; date: string; status: string }>>([
    { format: "PDF", date: "15 de outubro de 2024, 14:35", status: "Concluída" },
    { format: "Excel", date: "03 de setembro de 2024, 09:12", status: "Concluída" },
  ]);

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      identifier: "",
      format: "json",
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (data: ExportFormData) => {
      const response = await apiRequest("POST", "/api/lgpd/export", {
        identifier: data.identifier,
        format: data.format,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Exportação iniciada",
        description: `Seus dados serão exportados no formato ${variables.format.toUpperCase()}.`,
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: variables.format === "json" ? "application/json" : "text/csv" 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dados_ipe.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na exportação",
        description: error.message || "Não foi possível exportar seus dados.",
        variant: "destructive",
      });
    },
  });

  const handleExport = (format: "json" | "csv" | "pdf") => {
    form.setValue("format", format);
    const identifier = form.getValues("identifier");
    if (!identifier) {
      toast({
        title: "Identificação necessária",
        description: "Por favor, informe seu CPF ou email antes de exportar.",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate({ identifier, format });
  };

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

      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>
            Informe seu CPF ou email para solicitar a exportação dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF ou Email *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite seu CPF ou email" 
                      data-testid="input-identifier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

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
            <Button 
              className="w-full" 
              data-testid="button-export-pdf"
              onClick={() => handleExport("pdf")}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending && form.getValues("format") === "pdf" ? "Exportando..." : "Baixar PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader>
            <File className="h-10 w-10 text-green-600 mb-3" />
            <CardTitle>Formato CSV</CardTitle>
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
            <Button 
              className="w-full" 
              variant="outline" 
              data-testid="button-export-csv"
              onClick={() => handleExport("csv")}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending && form.getValues("format") === "csv" ? "Exportando..." : "Baixar CSV"}
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
            <Button 
              className="w-full" 
              variant="outline" 
              data-testid="button-export-json"
              onClick={() => handleExport("json")}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending && form.getValues("format") === "json" ? "Exportando..." : "Baixar JSON"}
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

      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Exportações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                  data-testid={`history-item-${index}`}
                >
                  <div>
                    <p className="font-medium text-sm">Exportação {item.format}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
