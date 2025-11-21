import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Download, Users, BookOpen, UserPlus, AlertCircle } from "lucide-react";
import type { Member, Seminarian, Catechumen } from "@shared/schema";

type ReportTab = "members" | "seminarians" | "catechumens" | "visitors";

export default function PastorReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("members");

  // Buscar dados
  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: seminarians, isLoading: seminariansLoading } = useQuery<Seminarian[]>({
    queryKey: ["/api/seminarians"],
  });

  const { data: catechumens, isLoading: catechumensLoading } = useQuery<Catechumen[]>({
    queryKey: ["/api/catechumens"],
  });

  const { data: visitors, isLoading: visitorsLoading } = useQuery<any[]>({
    queryKey: ["/api/visitors"],
  });

  // Calcular estatísticas de Membros
  const memberStats = {
    total: members?.length || 0,
    active: members?.filter(m => m.memberStatus === "ativo").length || 0,
    inactive: members?.filter(m => m.memberStatus === "inativo").length || 0,
    transferred: members?.filter(m => m.memberStatus === "transferido").length || 0,
    disciplined: members?.filter(m => m.memberStatus === "em_disciplina").length || 0,
    pastors: members?.filter(m => m.ecclesiasticalRole === "pastor").length || 0,
    presbyters: members?.filter(m => m.ecclesiasticalRole === "presbitero").length || 0,
    deacons: members?.filter(m => m.ecclesiasticalRole === "diacono").length || 0,
    communing: members?.filter(m => m.communionStatus === "comungante").length || 0,
    nonCommuning: members?.filter(m => m.communionStatus === "nao_comungante").length || 0,
  };

  const memberStatusData = [
    { name: "Ativo", value: memberStats.active },
    { name: "Inativo", value: memberStats.inactive },
    { name: "Transferido", value: memberStats.transferred },
    { name: "Disciplina", value: memberStats.disciplined },
  ];

  const memberRoleData = [
    { name: "Membro", value: members?.filter(m => m.ecclesiasticalRole === "membro").length || 0 },
    { name: "Presbítero", value: memberStats.presbyters },
    { name: "Diácono", value: memberStats.deacons },
    { name: "Pastor", value: memberStats.pastors },
  ];

  const communionData = [
    { name: "Comungante", value: memberStats.communing },
    { name: "Não Comungante", value: memberStats.nonCommuning },
  ];

  // Estatísticas de Seminaristas
  const seminarianStats = {
    total: seminarians?.length || 0,
    active: seminarians?.filter(s => s.status === "ativo").length || 0,
    internship: seminarians?.filter(s => s.status === "em_estagio").length || 0,
    concluded: seminarians?.filter(s => s.status === "concluido").length || 0,
  };

  const seminarianStatusData = [
    { name: "Ativo", value: seminarianStats.active },
    { name: "Em Estágio", value: seminarianStats.internship },
    { name: "Concluído", value: seminarianStats.concluded },
  ];

  // Estatísticas de Catecúmenos
  const catechumenStats = {
    total: catechumens?.length || 0,
    ongoing: catechumens?.filter(c => c.stage === "em_andamento").length || 0,
    ready: catechumens?.filter(c => c.stage === "apto").length || 0,
    concluded: catechumens?.filter(c => c.stage === "concluido").length || 0,
  };

  const catechumenStageData = [
    { name: "Em Andamento", value: catechumenStats.ongoing },
    { name: "Apto", value: catechumenStats.ready },
    { name: "Concluído", value: catechumenStats.concluded },
  ];

  // Cores para gráficos
  const COLORS = ["#1E5F74", "#F39C12", "#10B981", "#EF4444", "#8B5CF6"];

  // Exportar para CSV
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(";"),
      ...data.map(row => headers.map(h => {
        const value = row[h.toLowerCase().replace(/\s+/g, '_')];
        return `"${value || ''}"`;
      }).join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMembers = () => {
    const data = members?.map(m => ({
      Nome: m.fullName,
      Email: m.email,
      Status: m.memberStatus,
      Cargo: m.ecclesiasticalRole,
      Comunhão: m.communionStatus,
      Estado_Civil: m.maritalStatus,
    })) || [];
    exportToCSV(data, "relatorio_membros", ["Nome", "Email", "Status", "Cargo", "Comunhão", "Estado_Civil"]);
  };

  const handleExportSeminarians = () => {
    const data = seminarians?.map(s => ({
      Nome: s.fullName,
      Email: s.email,
      Instituição: s.institution,
      Ano: s.enrollmentYear,
      Status: s.status,
    })) || [];
    exportToCSV(data, "relatorio_seminaristas", ["Nome", "Email", "Instituição", "Ano", "Status"]);
  };

  const handleExportCatechumens = () => {
    const data = catechumens?.map(c => ({
      Nome: c.fullName,
      Etapa: c.stage,
      Data_Inicio: c.startDate,
      Data_Profissão: c.expectedProfessionDate,
      Professor: c.professorId,
    })) || [];
    exportToCSV(data, "relatorio_catecumenos", ["Nome", "Etapa", "Data_Inicio", "Data_Profissão", "Professor"]);
  };

  const isLoading = membersLoading || seminariansLoading || catechumensLoading || visitorsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Relatórios Pastorais</h1>
        <p className="text-muted-foreground mt-1">
          Análise completa da situação pastoral da Igreja Presbiteriana Emaús
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" data-testid="tab-members">
            <Users className="h-4 w-4 mr-2" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="seminarians" data-testid="tab-seminarians">
            <BookOpen className="h-4 w-4 mr-2" />
            Seminaristas
          </TabsTrigger>
          <TabsTrigger value="catechumens" data-testid="tab-catechumens">
            <UserPlus className="h-4 w-4 mr-2" />
            Catecúmenos
          </TabsTrigger>
          <TabsTrigger value="visitors" data-testid="tab-visitors">
            <Users className="h-4 w-4 mr-2" />
            Visitantes
          </TabsTrigger>
        </TabsList>

        {/* MEMBROS */}
        <TabsContent value="members" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-members">{memberStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-active-members">{memberStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Comungantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-communing">{memberStats.communing}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Presbíteros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-presbyters">{memberStats.presbyters}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Diáconos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="stat-deacons">{memberStats.deacons}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Status */}
            <Card>
              <CardHeader>
                <CardTitle>Membros por Status</CardTitle>
                <CardDescription>Distribuição do status administrativo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1E5F74" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Cargo */}
            <Card>
              <CardHeader>
                <CardTitle>Membros por Cargo</CardTitle>
                <CardDescription>Distribuição de cargos eclesiásticos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={memberRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {memberRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Botão Exportar */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportMembers}
                className="gap-2"
                data-testid="button-export-members"
              >
                <Download className="h-4 w-4" />
                Exportar Membros (CSV)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEMINARISTAS */}
        <TabsContent value="seminarians" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-seminarians">{seminarianStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-active-seminarians">{seminarianStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Em Estágio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-internship">{seminarianStats.internship}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-concluded-seminarians">{seminarianStats.concluded}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Seminaristas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seminarianStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F39C12" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Exportar */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleExportSeminarians}
                className="gap-2"
                data-testid="button-export-seminarians"
              >
                <Download className="h-4 w-4" />
                Exportar Seminaristas (CSV)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATECÚMENOS */}
        <TabsContent value="catechumens" className="space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-catechumens">{catechumenStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-ongoing">{catechumenStats.ongoing}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Apto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-ready">{catechumenStats.ready}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Concluído</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-concluded-catechumens">{catechumenStats.concluded}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Catecúmenos por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={catechumenStageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {catechumenStageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Exportar */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleExportCatechumens}
                className="gap-2"
                data-testid="button-export-catechumens"
              >
                <Download className="h-4 w-4" />
                Exportar Catecúmenos (CSV)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISITANTES */}
        <TabsContent value="visitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Visitantes</CardTitle>
              <CardDescription>Total de visitantes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Total de Visitantes</p>
                  <p className="text-3xl font-bold" data-testid="stat-total-visitors">{visitors?.length || 0}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Com Igreja</p>
                  <p className="text-3xl font-bold text-green-600">{visitors?.filter(v => v.hasChurch).length || 0}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Sem Igreja</p>
                  <p className="text-3xl font-bold text-orange-600">{visitors?.filter(v => !v.hasChurch).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para gerenciar visitantes, acesse a página de <strong>Visitantes</strong> na sidebar.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
