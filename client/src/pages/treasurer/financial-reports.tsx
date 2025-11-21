import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

interface FinancialData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export default function TreasurerFinancialReportsPage() {
  const { data: tithes, isLoading: tithesLoading } = useQuery({
    queryKey: ["/api/tithes"],
  });

  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["/api/offerings"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const isLoading = tithesLoading || offeringsLoading || expensesLoading;

  // Calcular totais
  const totalTithes = (tithes as any[])?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const totalOfferings = (offerings as any[])?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
  const totalIncome = totalTithes + totalOfferings;
  const totalExpenses = (expenses as any[])?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const balance = totalIncome - totalExpenses;

  // Dados para gráficos
  const incomeByCategory = [
    { name: "Dízimos", value: totalTithes, color: "#3b82f6" },
    { name: "Ofertas", value: totalOfferings, color: "#8b5cf6" },
  ];

  const expensesByCategory = [
    { name: "Aluguel", value: (expenses as any[])?.filter(e => e.category === "aluguel").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#ef4444" },
    { name: "Eletricidade", value: (expenses as any[])?.filter(e => e.category === "luz").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#f59e0b" },
    { name: "Água", value: (expenses as any[])?.filter(e => e.category === "agua").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#06b6d4" },
    { name: "Manutenção", value: (expenses as any[])?.filter(e => e.category === "manutencao").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#f97316" },
    { name: "Salários", value: (expenses as any[])?.filter(e => e.category === "salarios").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#a855f7" },
    { name: "Outros", value: (expenses as any[])?.filter(e => e.category === "outros" || e.category === "suprimentos").reduce((sum, e) => sum + (e.amount || 0), 0) || 0, color: "#6b7280" },
  ].filter(item => item.value > 0);

  // Gráfico temporal (últimos 12 meses)
  const monthlyData: FinancialData[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthStr = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    
    // Simular dados - em produção viriam de uma API
    const monthTithes = totalTithes / 12;
    const monthOfferings = totalOfferings / 12;
    const monthExpenses = totalExpenses / 12;
    
    return {
      date: monthStr,
      income: monthTithes + monthOfferings,
      expenses: monthExpenses,
      balance: (monthTithes + monthOfferings) - monthExpenses,
    };
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground mt-1">Análise de receitas e despesas</p>
        </div>
        <Button className="gap-2" data-testid="button-export-pdf">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="stat-total-income">
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Dízimos + Ofertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600" data-testid="stat-total-expenses">
              R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Todas as saídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="stat-balance">
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Receita - Despesa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Cobertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600" data-testid="stat-coverage">
              {totalExpenses > 0 ? ((totalIncome / totalExpenses) * 100).toFixed(1) : "∞"}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Receita / Despesa</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="temporal" className="w-full">
        <TabsList>
          <TabsTrigger value="temporal">Evolução Mensal</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - Receita vs Despesa</CardTitle>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="Receita" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Despesa" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Saldo" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Composição de Receita</CardTitle>
                <CardDescription>Dízimos vs Ofertas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={incomeByCategory} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita Detalhada</CardTitle>
                <CardDescription>Por fonte de renda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeByCategory.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold">R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Composição de Despesas</CardTitle>
                <CardDescription>Por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas Detalhadas</CardTitle>
                <CardDescription>Por categoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expensesByCategory.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold">R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
