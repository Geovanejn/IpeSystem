import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Cache do token CSRF em memória
let csrfToken: string | null = null;

// Função para buscar token CSRF do backend
// IMPORTANTE: Deve ser chamada APÓS login para garantir que Authorization header está presente
export async function fetchCsrfToken(): Promise<string> {
  try {
    const headers: Record<string, string> = {};
    
    // Incluir sessionId no header Authorization para vincular token à sessão
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      headers["Authorization"] = `Bearer ${sessionId}`;
    }
    
    const response = await fetch("/api/csrf-token", {
      credentials: "include",
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    
    const data = await response.json();
    csrfToken = data.token;
    return data.token;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}

// Limpar token CSRF (usado ao fazer logout)
export function clearCsrfToken() {
  csrfToken = null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Incluir sessionId no header Authorization se disponível
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  // Incluir token CSRF para requisições mutativas (POST, PUT, PATCH, DELETE)
  const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  if (isMutatingMethod) {
    // Se não temos token, buscar antes de fazer a requisição
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Se receber erro 403 (CSRF inválido), renovar token e tentar novamente
  if (res.status === 403 && isMutatingMethod) {
    try {
      // Renovar token CSRF
      await fetchCsrfToken();
      
      // Atualizar header com novo token
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      
      // Tentar requisição novamente
      const retryRes = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(retryRes);
      return retryRes;
    } catch (error) {
      console.error("Failed to retry request after CSRF refresh:", error);
      await throwIfResNotOk(res); // Lançar erro original
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Incluir sessionId no header Authorization se disponível
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      headers["Authorization"] = `Bearer ${sessionId}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
