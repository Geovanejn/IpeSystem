import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
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
import TreasurerBookstore from "@/pages/treasurer/bookstore";
import TreasurerLoans from "@/pages/treasurer/loans";
import TreasurerExpenses from "@/pages/treasurer/expenses";
import TreasurerFinancialReports from "@/pages/treasurer/financial-reports";

// Deacon Pages
import DeaconDashboard from "@/pages/deacon/dashboard";
import DeaconVisitors from "@/pages/deacon/visitors-crud";
import DeaconHelp from "@/pages/deacon/help";
import DeaconBulletin from "@/pages/deacon/bulletin";

// LGPD Pages
import LGPDDashboard from "@/pages/lgpd/dashboard";
import LGPDMyData from "@/pages/lgpd/my-data";
import LGPDExport from "@/pages/lgpd/export";
import LGPDRequests from "@/pages/lgpd/requests";
import LGPDConsents from "@/pages/lgpd/consents";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />

      {/* Pastor Routes - Protected */}
      <Route path="/pastor">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorDashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/members">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorMembers />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/seminarians">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorSeminarians />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/catechumens">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorCatechumens />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/visitors">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorVisitors />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/users">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorUsers />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/birthdays">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorBirthdays />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/pastor/reports">
        {() => (
          <ProtectedRoute allowedRoles={["pastor"]}>
            <AppLayout role="pastor">
              <PastorReports />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Treasurer Routes - Protected */}
      <Route path="/treasurer">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerDashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/tithes">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerTithes />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/offerings">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerOfferings />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/bookstore">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerBookstore />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/loans">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerLoans />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/expenses">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerExpenses />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/treasurer/reports">
        {() => (
          <ProtectedRoute allowedRoles={["treasurer"]}>
            <AppLayout role="treasurer">
              <TreasurerFinancialReports />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Deacon Routes - Protected */}
      <Route path="/deacon">
        {() => (
          <ProtectedRoute allowedRoles={["deacon"]}>
            <AppLayout role="deacon">
              <DeaconDashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/deacon/visitors">
        {() => (
          <ProtectedRoute allowedRoles={["deacon"]}>
            <AppLayout role="deacon">
              <DeaconVisitors />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/deacon/help">
        {() => (
          <ProtectedRoute allowedRoles={["deacon"]}>
            <AppLayout role="deacon">
              <DeaconHelp />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/deacon/bulletin">
        {() => (
          <ProtectedRoute allowedRoles={["deacon"]}>
            <AppLayout role="deacon">
              <DeaconBulletin />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* LGPD Routes - Protected (members and visitors) */}
      <Route path="/lgpd">
        {() => (
          <ProtectedRoute allowedRoles={["member", "visitor"]}>
            <AppLayout role="member">
              <LGPDDashboard />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/lgpd/my-data">
        {() => (
          <ProtectedRoute allowedRoles={["member", "visitor"]}>
            <AppLayout role="member">
              <LGPDMyData />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/lgpd/export">
        {() => (
          <ProtectedRoute allowedRoles={["member", "visitor"]}>
            <AppLayout role="member">
              <LGPDExport />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/lgpd/requests">
        {() => (
          <ProtectedRoute allowedRoles={["member", "visitor"]}>
            <AppLayout role="member">
              <LGPDRequests />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/lgpd/consents">
        {() => (
          <ProtectedRoute allowedRoles={["member", "visitor"]}>
            <AppLayout role="member">
              <LGPDConsents />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ipe-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
