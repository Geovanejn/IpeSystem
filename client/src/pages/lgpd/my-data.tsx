import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Church, 
  CreditCard,
  Shield,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface UserData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    address?: string;
    birthDate?: string;
    maritalStatus?: string;
  };
  churchInfo: {
    membershipType: string;
    admissionDate?: string;
    communionStatus: string;
    officePosition?: string;
    departments?: string[];
  };
  financialInfo: {
    totalTithes: number;
    totalOfferings: number;
    lastTitheDate?: string;
    lastOfferingDate?: string;
  };
  lgpdInfo: {
    consentDate: string;
    consentUrl?: string;
    activeConsents: number;
    totalRequests: number;
  };
}

export default function LGPDMyDataPage() {
  const [, navigate] = useLocation();
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const { data: userData, isLoading, isError, error } = useQuery<UserData>({
    queryKey: ["/api/lgpd/my-data"],
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Erro ao Carregar Dados</h1>
          <p className="text-muted-foreground mt-1">
            Não foi possível carregar suas informações pessoais
          </p>
        </div>
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Erro desconhecido ao buscar dados"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/lgpd")} data-testid="button-back">
          Voltar ao Portal LGPD
        </Button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dados Não Encontrados</h1>
          <p className="text-muted-foreground mt-1">
            Nenhum dado pessoal foi encontrado
          </p>
        </div>
        <Button onClick={() => navigate("/lgpd")} data-testid="button-back">
          Voltar ao Portal LGPD
        </Button>
      </div>
    );
  }

  const maskCPF = (cpf?: string) => {
    if (!cpf || !showSensitiveData) return "***.***.***-**";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const maskPhone = (phone?: string) => {
    if (!phone || !showSensitiveData) return "(***) *****-****";
    return phone;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Dados Pessoais</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todas as informações que a igreja armazena sobre você
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSensitiveData(!showSensitiveData)}
          data-testid="button-toggle-sensitive"
          className="gap-2"
        >
          {showSensitiveData ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ocultar Dados Sensíveis
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Mostrar Dados Sensíveis
            </>
          )}
        </Button>
      </div>

      {/* Alert LGPD */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você pode solicitar correção ou exclusão destes dados a qualquer momento através do menu de Solicitações LGPD.
        </AlertDescription>
      </Alert>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>Seus dados cadastrais básicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</p>
              <p className="text-sm font-semibold" data-testid="text-name">
                {userData?.personalInfo.name || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">CPF</p>
              <p className="text-sm font-semibold flex items-center gap-2" data-testid="text-cpf">
                {maskCPF(userData?.personalInfo.cpf)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </p>
              <p className="text-sm" data-testid="text-email">
                {userData?.personalInfo.email || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </p>
              <p className="text-sm" data-testid="text-phone">
                {maskPhone(userData?.personalInfo.phone) || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data de Nascimento
              </p>
              <p className="text-sm" data-testid="text-birthdate">
                {userData?.personalInfo.birthDate 
                  ? new Date(userData.personalInfo.birthDate).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Estado Civil
              </p>
              <p className="text-sm" data-testid="text-marital-status">
                {userData?.personalInfo.maritalStatus || "Não informado"}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Endereço Completo
            </p>
            <p className="text-sm" data-testid="text-address">
              {userData?.personalInfo.address || "Não informado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Eclesiásticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="h-5 w-5 text-accent" />
              Situação Eclesiástica
            </CardTitle>
            <CardDescription>Informações sobre sua participação na igreja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Membro</p>
              <Badge variant="secondary" data-testid="badge-membership">
                {userData?.churchInfo.membershipType || "Não definido"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status de Comunhão</p>
              <Badge 
                variant={userData?.churchInfo.communionStatus === "Plena" ? "default" : "secondary"}
                data-testid="badge-communion"
              >
                {userData?.churchInfo.communionStatus || "Não informado"}
              </Badge>
            </div>
            {userData?.churchInfo.officePosition && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cargo Eclesiástico</p>
                <p className="text-sm font-semibold" data-testid="text-office">
                  {userData.churchInfo.officePosition}
                </p>
              </div>
            )}
            {userData?.churchInfo.admissionDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Data de Admissão</p>
                <p className="text-sm" data-testid="text-admission">
                  {new Date(userData.churchInfo.admissionDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
            {userData?.churchInfo.departments && userData.churchInfo.departments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Departamentos</p>
                <div className="flex flex-wrap gap-1">
                  {userData.churchInfo.departments.map((dept, idx) => (
                    <Badge key={idx} variant="outline" data-testid={`badge-dept-${idx}`}>
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Informações Financeiras
            </CardTitle>
            <CardDescription>Histórico de contribuições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Dízimos</p>
              <p className="text-lg font-bold text-green-600" data-testid="text-total-tithes">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(userData?.financialInfo.totalTithes || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Ofertas</p>
              <p className="text-lg font-bold text-green-600" data-testid="text-total-offerings">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(userData?.financialInfo.totalOfferings || 0)}
              </p>
            </div>
            {userData?.financialInfo.lastTitheDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Último Dízimo</p>
                <p className="text-sm" data-testid="text-last-tithe">
                  {new Date(userData.financialInfo.lastTitheDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
            {userData?.financialInfo.lastOfferingDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Última Oferta</p>
                <p className="text-sm" data-testid="text-last-offering">
                  {new Date(userData.financialInfo.lastOfferingDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações LGPD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informações sobre Privacidade (LGPD)
          </CardTitle>
          <CardDescription>Seus consentimentos e solicitações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Consentimento Assinado em</p>
              <p className="text-sm font-semibold" data-testid="text-consent-date">
                {userData?.lgpdInfo.consentDate 
                  ? new Date(userData.lgpdInfo.consentDate).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Consentimentos Ativos</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-active-consents">
                {userData?.lgpdInfo.activeConsents || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Solicitações LGPD</p>
              <p className="text-2xl font-bold text-blue-600" data-testid="text-total-requests">
                {userData?.lgpdInfo.totalRequests || 0}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/lgpd/consents")}
              data-testid="button-manage-consents"
            >
              Gerenciar Consentimentos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/lgpd/requests")}
              data-testid="button-view-requests"
            >
              Ver Solicitações
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/lgpd/export")}
              data-testid="button-export-data"
            >
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="text-yellow-900 dark:text-yellow-200">
            Precisa atualizar seus dados?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-300">
          <p className="mb-4">
            Se alguma informação estiver incorreta ou desatualizada, você pode solicitar a correção
            através do menu de Solicitações LGPD.
          </p>
          <Button
            onClick={() => navigate("/lgpd/requests")}
            variant="outline"
            className="border-yellow-600 text-yellow-900 dark:text-yellow-200"
            data-testid="button-request-correction"
          >
            Solicitar Correção de Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
