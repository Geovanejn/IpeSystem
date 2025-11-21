import { Router } from "express";
import rateLimit from "express-rate-limit";
import { doubleCsrf } from "csrf-csrf";
import crypto from "crypto";
import { authenticateUser, createSession, getSession, deleteSession } from "../auth";

// ============================================
// CSRF PROTECTION
// ============================================

// Gerar secret aleatório para CSRF (em produção, usar variável de ambiente)
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

// Configuração do CSRF usando csrf-csrf (Double Submit Cookie Pattern)
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  getSessionIdentifier: (req) => {
    // Extrair apenas o sessionId do header Authorization (sem "Bearer ")
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.replace("Bearer ", "");
    }
    // Fallback para requests sem auth (como primeiro acesso)
    return "anonymous";
  },
  cookieName: "ipe_csrf_token", // Nome simples para desenvolvimento
  cookieOptions: {
    sameSite: "lax",
    secure: false, // Desativar em desenvolvimento para funcionar com HTTP
    httpOnly: true,
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => {
    // Aceita token do header X-CSRF-Token
    return req.headers["x-csrf-token"] as string;
  },
});

// Exportar configuração CSRF para uso em outras rotas
export { doubleCsrfProtection };

// ============================================
// RATE LIMITING
// ============================================

// Rate limiter para login: previne ataques de força bruta
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas por janela
  message: { 
    error: "Muitas tentativas de login. Tente novamente em 15 minutos." 
  },
  standardHeaders: true, // Retorna RateLimit-* headers
  legacyHeaders: false, // Desabilita X-RateLimit-* headers
  skipSuccessfulRequests: false, // Conta todas as requisições, não apenas falhas
  // Usa keyGenerator padrão que lida corretamente com IPv4 e IPv6
});

// ============================================
// AUTH ROUTES
// ============================================

const router = Router();

/**
 * POST /api/auth/login
 * Realiza login e retorna sessionId
 */
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    const user = await authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const sessionId = createSession(user);
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        memberId: user.memberId,
        visitorId: user.visitorId,
      },
      sessionId,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/logout
 * Encerra a sessão do usuário
 */
router.post("/logout", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      deleteSession(sessionId);
    }
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/auth/session
 * Retorna informações da sessão atual
 */
router.get("/session", async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    
    if (!sessionId) {
      return res.status(401).json({ error: "No session" });
    }
    
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    res.json({ session });
  } catch (error) {
    console.error("Session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/csrf-token
 * Retorna token CSRF para proteção contra CSRF attacks
 */
router.get("/csrf-token", async (req, res) => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({ token });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
