import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ConsentType {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isConsented: boolean;
  consentedAt?: string;
}

interface ConsentsData {
  consents: ConsentType[];
  lastUpdated: string;
}

export default function LGPDConsentsPage() {
  const { toast } = useToast();
  const [selectedConsents, setSelectedConsents] = useState<Record<string, boolean>>({});

  const { data: consents, isLoading: consentsLoading } = useQuery<ConsentsData>({
    queryKey: ["/api/lgpd-consents"],
  });

  const updateMutation = useMutation({
    mutationFn: async (consentUpdates: Record<string, boolean>) => {
      return await fetch("/api/lgpd-consents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consents: consentUpdates }),
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({
        title: "Consentimentos atualizados",
        description: "Suas preferências de consentimento foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lgpd-consents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar consentimentos",
        variant: "destructive",
      });
    },
  });

  const handleConsentChange = (consentId: string, value: boolean) => {
    setSelectedConsents(prev => ({
      ...prev,
      [consentId]: value,
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(selectedConsents);
  };

  if (consentsLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  const consentList = consents?.consents || [];
  const hasChanges = Object.keys(selectedConsents).length > 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Consentimentos</h1>
        <p className="text-muted-foreground mt-1">Controle suas preferências de tratamento de dados</p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Sobre Consentimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-200">
          Você pode revogar seu consentimento a qualquer momento. Consentimentos obrigatórios (marcados com *) não podem ser revogados
          pois são necessários para o funcionamento essencial da aplicação.
        </CardContent>
      </Card>

      {/* Consentimentos */}
      <div className="space-y-4">
        {consentList.map((consent) => (
          <Card key={consent.id} data-testid={`card-consent-${consent.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={consent.id}
                  checked={selectedConsents[consent.id] ?? consent.isConsented}
                  onCheckedChange={(checked) =>
                    handleConsentChange(consent.id, checked as boolean)
                  }
                  disabled={consent.isRequired}
                  data-testid={`checkbox-${consent.id}`}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={consent.id} className="font-medium cursor-pointer flex items-center gap-2">
                    {consent.name}
                    {consent.isRequired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Obrigatório
                      </span>
                    )}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">{consent.description}</p>
                  {consent.isConsented && consent.consentedAt && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Consentido em {new Date(consent.consentedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {!consent.isConsented && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Consentimento não fornecido
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setSelectedConsents({})}
          disabled={!hasChanges || updateMutation.isPending}
          data-testid="button-cancel"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          data-testid="button-save"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Last Updated */}
      {consents?.lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Última atualização: {new Date(consents.lastUpdated).toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
