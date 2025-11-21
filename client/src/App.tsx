import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/app-layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

// Pastor Pages
import PastorDashboard from "@/pages/pastor/dashboard";
import PastorMembers from "@/pages/pastor/members";
import PastorUsers from "@/pages/pastor/users";
import PastorSeminarians from "@/pages/pastor/seminarians";
import PastorCatechumens from "@/pages/pastor/catechumens";
import PastorVisitors from "@/pages/pastor/visitors";
import PastorBirthdays from "@/pages/pastor/birthdays";
import PastorReports from "@/pages/pastor/reports";

// Treasurer Pages
import TreasurerDashboard from "@/pages/treasurer/dashboard";
import TreasurerTithes from "@/pages/treasurer/tithes";
import TreasurerOfferings from "@/pages/treasurer/offerings";

// Deacon Pages
import DeaconDashboard from "@/pages/deacon/dashboard";
import DeaconVisitors from "@/pages/deacon/visitors-crud";

// LGPD Pages
import LGPDDashboard from "@/pages/lgpd/dashboard";
import LGPDExport from "@/pages/lgpd/export";

// TODO: Implementar autenticação real
const mockAuth = {
  isAuthenticated: true,
  role: "pastor" as const, // Simular role para desenvolvimento
  userName: "Pastor João Silva",
};

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />

      {/* Pastor Routes */}
      <Route path="/pastor">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorDashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/members">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorMembers />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/seminarians">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorSeminarians />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/catechumens">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorCatechumens />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/visitors">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorVisitors />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/users">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorUsers />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/birthdays">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorBirthdays />
          </AppLayout>
        )}
      </Route>
      <Route path="/pastor/reports">
        {() => (
          <AppLayout role="pastor" userName={mockAuth.userName}>
            <PastorReports />
          </AppLayout>
        )}
      </Route>

      {/* Treasurer Routes */}
      <Route path="/treasurer">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <TreasurerDashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/tithes">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <TreasurerTithes />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/offerings">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <PlaceholderPage title="Ofertas" />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/bookstore">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <PlaceholderPage title="Livraria" />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/loans">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <PlaceholderPage title="Empréstimos" />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/expenses">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <PlaceholderPage title="Saídas / Despesas" />
          </AppLayout>
        )}
      </Route>
      <Route path="/treasurer/reports">
        {() => (
          <AppLayout role="treasurer" userName="Tesoureiro Maria Santos">
            <PlaceholderPage title="Relatórios Financeiros" />
          </AppLayout>
        )}
      </Route>

      {/* Deacon Routes */}
      <Route path="/deacon">
        {() => (
          <AppLayout role="deacon" userName="Diácono Pedro Oliveira">
            <DeaconDashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/deacon/visitors">
        {() => (
          <AppLayout role="deacon" userName="Diácono Pedro Oliveira">
            <DeaconVisitors />
          </AppLayout>
        )}
      </Route>
      <Route path="/deacon/help">
        {() => (
          <AppLayout role="deacon" userName="Diácono Pedro Oliveira">
            <PlaceholderPage title="Ajuda Diaconal" />
          </AppLayout>
        )}
      </Route>
      <Route path="/deacon/bulletin">
        {() => (
          <AppLayout role="deacon" userName="Diácono Pedro Oliveira">
            <PlaceholderPage title="Boletim Dominical" />
          </AppLayout>
        )}
      </Route>

      {/* LGPD Routes */}
      <Route path="/lgpd">
        {() => (
          <AppLayout role="member" userName="Membro Carlos Costa">
            <LGPDDashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/lgpd/export">
        {() => (
          <AppLayout role="member" userName="Membro Carlos Costa">
            <LGPDExport />
          </AppLayout>
        )}
      </Route>
      <Route path="/lgpd/requests">
        {() => (
          <AppLayout role="member" userName="Membro Carlos Costa">
            <PlaceholderPage title="Minhas Solicitações LGPD" />
          </AppLayout>
        )}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">Esta página está em desenvolvimento.</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ipe-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
