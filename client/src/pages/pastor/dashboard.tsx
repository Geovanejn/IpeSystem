import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, BookOpen, UserPlus, UserCheck, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Member, Seminarian, Catechumen } from "@shared/schema";

export default function PastorDashboard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Buscar dados em tempo real
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

  // Calcular aniversariantes da semana
  const birthdaysThisWeek = useMemo(() => {
    if (!members) return [];
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return members
      .filter(m => m.birthDate && m.memberStatus === "ativo")
      .filter(m => {
        const [, month, day] = m.birthDate.split('-').map(Number);
        for (let i = 0; i <= 6; i++) {
          const checkDate = new Date(startOfWeek);
          checkDate.setDate(startOfWeek.getDate() + i);
          if (checkDate.getMonth() + 1 === month && checkDate.getDate() === day) {
            return true;
          }
        }
        return false;
      })
      .slice(0, 3);
  }, [members]);

  // Catecúmenos aptos
  const aptCatechumens = useMemo(() => {
    return catechumens?.filter(c => c.stage === "apto").slice(0, 3) || [];
  }, [catechumens]);

  // Estatísticas principais
  const stats = useMemo(() => {
    const activeMembers = members?.filter(m => m.memberStatus === "ativo").length || 0;
    const activeSeminarians = seminarians?.filter(s => s.status === "ativo").length || 0;
    const ongoingCatechumens = catechumens?.filter(c => c.stage === "em_andamento").length || 0;
    const monthVisitors = visitors?.length || 0;

    return [
      {
        title: "Membros Ativos",
        value: activeMembers.toString(),
        icon: Users,
        description: `${(members?.length || 0) - activeMembers} inativos`,
        color: "text-primary",
        testid: "stat-active-members",
        link: "/pastor/members"
      },
      {
        title: "Seminaristas",
        value: activeSeminarians.toString(),
        icon: BookOpen,
        description: `${seminarians?.length || 0} total`,
        color: "text-accent",
        testid: "stat-seminarians",
        link: "/pastor/seminarians"
      },
      {
        title: "Catecúmenos",
        value: ongoingCatechumens.toString(),
        icon: UserPlus,
        description: `${aptCatechumens.length} aptos`,
        color: "text-green-600",
        testid: "stat-catechumens",
        link: "/pastor/catechumens"
      },
      {
        title: "Visitantes",
        value: monthVisitors.toString(),
        icon: UserCheck,
        description: "Este período",
        color: "text-blue-600",
        testid: "stat-visitors",
        link: "/pastor/visitors"
      },
    ];
  }, [members, seminarians, catechumens, visitors]);

  const isLoading = membersLoading || seminariansLoading || catechumensLoading || visitorsLoading;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Pastor</h1>
        <p className="text-muted-foreground">
          Visão geral da gestão pastoral e membros da IPE
        </p>
      </div>

      {/* Alert de Status */}
      {isLoading && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Carregando dados em tempo real...
          </AlertDescription>
        </Alert>
      )}

      {/* Cards Principais */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card 
              className="hover-elevate transition-all cursor-pointer"
              onClick={() => setSelectedCard(stat.title)}
              data-testid={stat.testid}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-12 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Seção Principal */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Aniversariantes da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aniversariantes da Semana
            </CardTitle>
            <CardDescription>
              Membros que fazem aniversário em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : birthdaysThisWeek.length > 0 ? (
              <div className="space-y-2">
                {birthdaysThisWeek.map((member) => {
                  const [, month, day] = member.birthDate.split('-').map(Number);
                  const date = new Date(new Date().getFullYear(), month - 1, day);
                  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                  return (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded hover-elevate">
                      <div>
                        <p className="font-medium text-sm" data-testid={`birthday-name-${member.id}`}>{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                      </div>
                      <Badge variant="secondary">{formattedDate.split(' ')[0]}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum aniversariante esta semana</p>
            )}
            <Link href="/pastor/birthdays">
              <Button variant="ghost" className="w-full mt-4" data-testid="button-view-birthdays">
                Ver mais aniversariantes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Catecúmenos Aptos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Próximas Profissões de Fé
            </CardTitle>
            <CardDescription>
              Catecúmenos prontos para batismo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : aptCatechumens.length > 0 ? (
              <div className="space-y-2">
                {aptCatechumens.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded hover-elevate">
                    <div>
                      <p className="font-medium text-sm" data-testid={`catechumen-name-${cat.id}`}>{cat.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        Data esperada: {new Date(cat.expectedProfessionDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Apto</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum catecúmeno apto no momento</p>
            )}
            <Link href="/pastor/catechumens">
              <Button variant="ghost" className="w-full mt-4" data-testid="button-view-catechumens">
                Gerenciar catecúmenos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membros por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ativos</span>
                <span className="font-semibold text-green-600" data-testid="stat-status-active">
                  {members?.filter(m => m.memberStatus === "ativo").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inativos</span>
                <span className="font-semibold text-gray-600">
                  {members?.filter(m => m.memberStatus === "inativo").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transferidos</span>
                <span className="font-semibold text-blue-600">
                  {members?.filter(m => m.memberStatus === "transferido").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Em Disciplina</span>
                <span className="font-semibold text-red-600">
                  {members?.filter(m => m.memberStatus === "em_disciplina").length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comunhão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comungantes</span>
                <span className="font-semibold text-primary" data-testid="stat-communing">
                  {members?.filter(m => m.communionStatus === "comungante").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Não Comungantes</span>
                <span className="font-semibold text-muted-foreground">
                  {members?.filter(m => m.communionStatus === "nao_comungante").length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cargo Eclesiástico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Presbíteros</span>
                <span className="font-semibold text-purple-600">
                  {members?.filter(m => m.ecclesiasticalRole === "presbitero").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Diáconos</span>
                <span className="font-semibold text-orange-600">
                  {members?.filter(m => m.ecclesiasticalRole === "diacono").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Seminaristas</span>
                <span className="font-semibold text-accent">
                  {seminarians?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse as funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/pastor/members">
            <Button variant="outline" data-testid="quick-action-members">Novo Membro</Button>
          </Link>
          <Link href="/pastor/catechumens">
            <Button variant="outline" data-testid="quick-action-catechumen">Novo Catecúmeno</Button>
          </Link>
          <Link href="/pastor/seminarians">
            <Button variant="outline" data-testid="quick-action-seminarian">Novo Seminarista</Button>
          </Link>
          <Link href="/pastor/reports">
            <Button variant="outline" data-testid="quick-action-reports">Gerar Relatório</Button>
          </Link>
          <Link href="/pastor/birthdays">
            <Button variant="outline" data-testid="quick-action-birthdays">Aniversariantes</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
