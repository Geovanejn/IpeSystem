import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Public Pages - Loaded immediately
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

// Pastor Pages - Lazy loaded
const PastorDashboard = lazy(() => import("@/pages/pastor/dashboard"));
const PastorMembers = lazy(() => import("@/pages/pastor/members"));
const PastorUsers = lazy(() => import("@/pages/pastor/users"));
const PastorSeminarians = lazy(() => import("@/pages/pastor/seminarians"));
const PastorCatechumens = lazy(() => import("@/pages/pastor/catechumens"));
const PastorVisitors = lazy(() => import("@/pages/pastor/visitors"));
const PastorBirthdays = lazy(() => import("@/pages/pastor/birthdays"));
const PastorReports = lazy(() => import("@/pages/pastor/reports"));

// Treasurer Pages - Lazy loaded
const TreasurerDashboard = lazy(() => import("@/pages/treasurer/dashboard"));
const TreasurerTithes = lazy(() => import("@/pages/treasurer/tithes"));
const TreasurerOfferings = lazy(() => import("@/pages/treasurer/offerings"));
const TreasurerBookstore = lazy(() => import("@/pages/treasurer/bookstore"));
const TreasurerLoans = lazy(() => import("@/pages/treasurer/loans"));
const TreasurerExpenses = lazy(() => import("@/pages/treasurer/expenses"));
const TreasurerFinancialReports = lazy(() => import("@/pages/treasurer/financial-reports"));

// Deacon Pages - Lazy loaded
const DeaconDashboard = lazy(() => import("@/pages/deacon/dashboard"));
const DeaconVisitors = lazy(() => import("@/pages/deacon/visitors-crud"));
const DeaconHelp = lazy(() => import("@/pages/deacon/help"));
const DeaconBulletin = lazy(() => import("@/pages/deacon/bulletin"));

// LGPD Pages - Lazy loaded
const LGPDDashboard = lazy(() => import("@/pages/lgpd/dashboard"));
const LGPDMyData = lazy(() => import("@/pages/lgpd/my-data"));
const LGPDExport = lazy(() => import("@/pages/lgpd/export"));
const LGPDRequests = lazy(() => import("@/pages/lgpd/requests"));
const LGPDConsents = lazy(() => import("@/pages/lgpd/consents"));

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
            <Suspense fallback={<PageLoader />}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
