import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TreasurerDashboard() {
  // TODO: Implementar lógica de busca de dados com React Query
  const isLoading = false;

  const stats = [
    {
      title: "Saldo Atual",
      value: "R$ 45.320,50",
      icon: Wallet,
      description: "Atualizado hoje",
      color: "text-green-600",
      trend: "+12.5%",
    },
    {
      title: "Entradas do Mês",
      value: "R$ 18.450,00",
      icon: TrendingUp,
      description: "Dízimos, ofertas e livraria",
      color: "text-primary",
      trend: "+8.2%",
    },
    {
      title: "Saídas do Mês",
      value: "R$ 12.130,00",
      icon: TrendingDown,
      description: "Despesas operacionais",
      color: "text-destructive",
      trend: "-3.1%",
    },
    {
      title: "Resultado do Mês",
      value: "R$ 6.320,00",
      icon: DollarSign,
      description: "Superávit",
      color: "text-accent",
      trend: "+15.3%",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Tesoureiro</h1>
        <p className="text-muted-foreground">
          Gestão financeira completa da IPE
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
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
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
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                  <span className={`text-xs font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ofertas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Social", amount: "R$ 3.450,00", percentage: 30 },
                { type: "Geral", amount: "R$ 5.200,00", percentage: 45 },
                { type: "Obra", amount: "R$ 2.100,00", percentage: 18 },
                { type: "Missões", amount: "R$ 800,00", percentage: 7 },
              ].map((offering) => (
                <div key={offering.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{offering.type}</span>
                    <span className="text-muted-foreground">{offering.amount}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: `${offering.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Nenhuma parcela de empréstimo próxima do vencimento
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Gráfico de evolução financeira será exibido aqui
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
