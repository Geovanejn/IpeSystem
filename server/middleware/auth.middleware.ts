import type { Request, Response, NextFunction } from "express";
import { getSession } from "../auth";

/**
 * Middleware de autorização baseado em roles
 * 
 * Verifica se o usuário está autenticado e se possui uma das roles permitidas.
 * 
 * @param allowedRoles - Lista de roles permitidas para acessar a rota
 * @returns Middleware Express que valida autenticação e autorização
 * 
 * @example
 * // Apenas pastor pode acessar
 * app.get("/api/members", requireRole("pastor"), async (req, res) => {...})
 * 
 * // Pastor ou tesoureiro podem acessar
 * app.get("/api/tithes", requireRole("pastor", "treasurer"), async (req, res) => {...})
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extrair sessionId do header Authorization
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      
      if (!sessionId) {
        return res.status(401).json({ 
          error: "Autenticação necessária. Faça login para acessar este recurso." 
        });
      }
      
      // 2. Verificar se sessão existe e é válida
      const session = getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ 
          error: "Sessão inválida ou expirada. Faça login novamente." 
        });
      }
      
      // 3. Verificar se role do usuário está na lista de roles permitidos
      if (!allowedRoles.includes(session.role)) {
        return res.status(403).json({ 
          error: `Acesso negado. Esta funcionalidade é restrita a: ${allowedRoles.join(", ")}.` 
        });
      }
      
      // 4. Autorizado - adiciona session ao request para uso posterior
      (req as any).session = session;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  };
}
