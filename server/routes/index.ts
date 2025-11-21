import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes, { doubleCsrfProtection } from "./auth.routes";
import pastoralRoutes from "./pastoral.routes";
import financeRoutes from "./finance.routes";
import deaconRoutes from "./deacon.routes";
import lgpdRoutes from "./lgpd.routes";

/**
 * Agrupa todas as rotas modulares
 * Aplica CSRF protection globalmente em rotas mutativas
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Rotas isentas de validação CSRF
  const csrfExemptRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/session',
    '/api/csrf-token',
  ];
  
  // Middleware condicional: aplica CSRF apenas em rotas mutativas não isentas
  app.use((req, res, next) => {
    const isExempt = csrfExemptRoutes.includes(req.path);
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    
    if (isExempt || !isMutatingMethod) {
      return next();
    }
    
    doubleCsrfProtection(req, res, next);
  });

  // Registrar todas as rotas modulares
  app.use("/api/auth", authRoutes);
  app.use("/api", pastoralRoutes);
  app.use("/api", financeRoutes);
  app.use("/api", deaconRoutes);
  app.use("/api", lgpdRoutes);

  // Criar HTTP server
  return createServer(app);
}
