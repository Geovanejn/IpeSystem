import { Request, Response, NextFunction } from "express";

/**
 * Middleware de Cache Headers
 * 
 * Aplica headers de cache apropriados baseado no tipo de recurso:
 * - APIs: no-cache (dados sempre frescos)
 * - HTML: no-cache (sempre pegar nova versão)
 * - Assets: cache longo (apenas para assets com hash, configurado via express.static)
 */
export function cacheHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Interceptar resposta para detectar Content-Type
  const originalSend = res.send;
  const originalJson = res.json;
  
  // APIs: NUNCA fazer cache (dados dinâmicos)
  if (path.startsWith('/api/')) {
    noCache(res);
  }
  
  // Interceptar res.send() e res.json() para detectar HTML
  res.send = function(body) {
    const contentType = res.getHeader('Content-Type');
    if (contentType && String(contentType).includes('text/html')) {
      noCache(res);
    }
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    return originalJson.call(this, body);
  };
  
  next();
}

/**
 * Aplica headers de no-cache para HTML
 * Usado tanto em desenvolvimento (Vite) quanto produção (express.static fallback)
 */
export function noCache(res: Response) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}
