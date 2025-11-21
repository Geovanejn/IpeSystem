import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest, fetchCsrfToken, clearCsrfToken } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  role: string;
  memberId?: string | null;
  visitorId?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const checkSession = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      const response = await apiRequest("GET", "/api/auth/session");
      
      if (!response.ok) {
        localStorage.removeItem("sessionId");
        localStorage.removeItem("user");
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { session } = await response.json();
      
      const userData: User = {
        id: session.userId,
        username: session.username,
        role: session.role,
        memberId: session.memberId,
        visitorId: session.visitorId,
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Session check failed:", error);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Credenciais inválidas");
      }

      const { user: userData, sessionId } = await response.json();
      
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // CRÍTICO: Renovar token CSRF após login com novo sessionId
      await fetchCsrfToken().catch(console.error);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      
      if (sessionId) {
        await apiRequest("POST", "/api/auth/logout", { sessionId });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Limpar token CSRF ao fazer logout
      clearCsrfToken();
      localStorage.removeItem("sessionId");
      localStorage.removeItem("user");
      setUser(null);
      setLocation("/login");
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
