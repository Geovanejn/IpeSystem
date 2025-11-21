import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { noCache } from "./middleware/cache.middleware";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      
      // Aplicar no-cache para HTML (sempre buscar nova versão)
      noCache(res);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Servir assets estáticos com cache configurado
  app.use(express.static(distPath, {
    maxAge: 0,           // Sem cache por padrão (setHeaders vai configurar caso a caso)
    immutable: false,
    setHeaders: (res, filePath) => {
      // Normalizar path para verificações
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      // Todos os arquivos HTML: sempre buscar nova versão
      if (normalizedPath.endsWith('.html')) {
        noCache(res);
      }
      // Assets do Vite em /assets/ com hash: cache longo (1 ano)
      // Vite coloca todos os bundles em /assets/ com hash único
      // Exemplo: /assets/main-abc123.js, /assets/style-xyz789.css
      else if (normalizedPath.includes('/assets/') && 
               normalizedPath.match(/[-_][a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Outros assets: cache curto (1 hora) para permitir updates
      // Exemplo: favicon.ico, robots.txt, etc
      else if (normalizedPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|txt|xml)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    // Aplicar no-cache para HTML (sempre buscar nova versão)
    noCache(res);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
