import { UserCheck, Heart, Book, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function DeaconDashboard() {
  // TODO: Implementar lógica de busca de dados com React Query
  const isLoading = false;

  const stats = [
    {
      title: "Visitantes Este Mês",
      value: "24",
      icon: UserCheck,
      description: "8 novos visitantes",
      color: "text-primary",
    },
    {
      title: "Ajudas Concedidas",
      value: "12",
      icon: Heart,
      description: "R$ 3.450,00 em auxílios",
      color: "text-green-600",
    },
    {
      title: "Boletins Publicados",
      value: "48",
      icon: Book,
      description: "Este ano",
      color: "text-accent",
    },
    {
      title: "Próximo Culto",
      value: "Domingo",
      icon: Calendar,
      description: "18h00 - Culto Solene",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Diácono</h1>
        <p className="text-muted-foreground">
          Gestão de visitantes, ajuda diaconal e boletim dominical
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Boletim Dominical</CardTitle>
            <Button variant="default" size="sm" data-testid="button-create-bulletin">
              Novo Boletim
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Boletim - 03/11/2024</p>
                  <p className="text-xs text-muted-foreground">Edição #45</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg opacity-60">
                <div>
                  <p className="font-medium text-sm">Boletim - 27/10/2024</p>
                  <p className="text-xs text-muted-foreground">Edição #44 - Publicado</p>
                </div>
                <Button variant="ghost" size="sm">Ver</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visitantes Recentes</CardTitle>
            <Button variant="default" size="sm" data-testid="button-add-visitor">
              Novo Visitante
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Carregando visitantes recentes...
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajudas Diaconais Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Nenhuma ajuda registrada recentemente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
