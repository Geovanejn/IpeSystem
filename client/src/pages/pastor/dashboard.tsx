import { Users, BookOpen, UserPlus, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PastorDashboard() {
  // TODO: Implementar lógica de busca de dados com React Query
  const isLoading = false;

  const stats = [
    {
      title: "Membros Ativos",
      value: "142",
      icon: Users,
      description: "12 novos este ano",
      color: "text-primary",
    },
    {
      title: "Seminaristas",
      value: "3",
      icon: BookOpen,
      description: "2 em estágio",
      color: "text-accent",
    },
    {
      title: "Catecúmenos",
      value: "8",
      icon: UserPlus,
      description: "5 aptos para profissão",
      color: "text-green-600",
    },
    {
      title: "Visitantes",
      value: "24",
      icon: UserCheck,
      description: "Este mês",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Pastor</h1>
        <p className="text-muted-foreground">
          Visão geral da gestão pastoral e membros da IPE
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Carregando aniversariantes...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catecúmenos - Próximas Profissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Carregando catecúmenos aptos...
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Nenhuma atividade recente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
