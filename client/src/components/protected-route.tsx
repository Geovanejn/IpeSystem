import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        // Redirecionar para a rota apropriada baseado no role
        switch (user.role) {
          case "pastor":
            setLocation("/pastor");
            break;
          case "treasurer":
            setLocation("/treasurer");
            break;
          case "deacon":
            setLocation("/deacon");
            break;
          case "member":
          case "visitor":
            setLocation("/lgpd");
            break;
          default:
            setLocation("/login");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
