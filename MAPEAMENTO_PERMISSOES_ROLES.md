# 🔐 MAPEAMENTO DE PERMISSÕES POR ROLE - SISTEMA IPE

**Data:** 21/11/2025  
**Status:** Implementação em andamento  
**Correção:** #5 - Autorização por Role

---

## 📋 ROLES DEFINIDOS

```typescript
export const roleEnum = pgEnum("role", ["pastor", "treasurer", "deacon", "member", "visitor"]);
```

1. **pastor** - Pastor (acesso total ao painel pastoral)
2. **treasurer** - Tesoureiro (acesso ao painel financeiro)
3. **deacon** - Diácono (acesso ao painel diaconal)
4. **member** - Membro (acesso apenas ao portal LGPD)
5. **visitor** - Visitante (acesso apenas ao portal LGPD)

---

## 🔵 PAINEL DO PASTOR

### Gestão de Usuários
- **GET** `/api/users` → `requireRole("pastor")`
- **POST** `/api/users` → `requireRole("pastor")`
- **PUT** `/api/users/:id` → `requireRole("pastor")`
- **DELETE** `/api/users/:id` → `requireRole("pastor")`

### Gestão de Membros
- **GET** `/api/members` → `requireRole("pastor")`
- **POST** `/api/members` → `requireRole("pastor")`
- **PUT** `/api/members/:id` → `requireRole("pastor")`
- **DELETE** `/api/members/:id` → `requireRole("pastor")`

### Gestão de Seminaristas
- **GET** `/api/seminarians` → `requireRole("pastor")`
- **POST** `/api/seminarians` → `requireRole("pastor")`
- **PUT** `/api/seminarians/:id` → `requireRole("pastor")`
- **DELETE** `/api/seminarians/:id` → `requireRole("pastor")`

### Gestão de Catecúmenos
- **GET** `/api/catechumens` → `requireRole("pastor")`
- **POST** `/api/catechumens` → `requireRole("pastor")`
- **PUT** `/api/catechumens/:id` → `requireRole("pastor")`
- **DELETE** `/api/catechumens/:id` → `requireRole("pastor")`

### Visitantes (Somente Leitura)
- **GET** `/api/visitors` → `requireRole("pastor", "deacon")` *(pastor: read-only, deacon: full CRUD)*

---

## 🟣 PAINEL DO TESOUREIRO

### Dízimos
- **GET** `/api/tithes` → `requireRole("pastor", "treasurer")`
- **POST** `/api/tithes` → `requireRole("pastor", "treasurer")`
- **PUT** `/api/tithes/:id` → `requireRole("pastor", "treasurer")`
- **DELETE** `/api/tithes/:id` → `requireRole("pastor", "treasurer")`

### Ofertas
- **GET** `/api/offerings` → `requireRole("pastor", "treasurer")`
- **POST** `/api/offerings` → `requireRole("pastor", "treasurer")`
- **PUT** `/api/offerings/:id` → `requireRole("pastor", "treasurer")`
- **DELETE** `/api/offerings/:id` → `requireRole("pastor", "treasurer")`

### Livraria
- **GET** `/api/bookstore` → `requireRole("pastor", "treasurer")`
- **POST** `/api/bookstore` → `requireRole("pastor", "treasurer")`
- **PUT** `/api/bookstore/:id` → `requireRole("pastor", "treasurer")`
- **DELETE** `/api/bookstore/:id` → `requireRole("pastor", "treasurer")`

### Empréstimos
- **GET** `/api/loans` → `requireRole("pastor", "treasurer")`
- **POST** `/api/loans` → `requireRole("pastor", "treasurer")`
- **PUT** `/api/loans/:id` → `requireRole("pastor", "treasurer")`
- **DELETE** `/api/loans/:id` → `requireRole("pastor", "treasurer")`

### Despesas/Saídas
- **GET** `/api/expenses` → `requireRole("pastor", "treasurer")`
- **POST** `/api/expenses` → `requireRole("pastor", "treasurer")`
- **PUT** `/api/expenses/:id` → `requireRole("pastor", "treasurer")`
- **DELETE** `/api/expenses/:id` → `requireRole("pastor", "treasurer")`

---

## 🟢 PAINEL DO DIÁCONO

### Visitantes (CRUD Completo)
- **GET** `/api/visitors` → `requireRole("pastor", "deacon")`
- **POST** `/api/visitors` → `requireRole("deacon")` *(apenas diácono pode criar)*
- **PUT** `/api/visitors/:id` → `requireRole("deacon")` *(apenas diácono pode editar)*
- **DELETE** `/api/visitors/:id` → `requireRole("deacon")` *(apenas diácono pode deletar)*

### Ajuda Diaconal
- **GET** `/api/diaconal-help` → `requireRole("pastor", "deacon")`
- **POST** `/api/diaconal-help` → `requireRole("deacon")`
- **PUT** `/api/diaconal-help/:id` → `requireRole("deacon")`
- **DELETE** `/api/diaconal-help/:id` → `requireRole("deacon")`

### Boletim Dominical
- **GET** `/api/bulletins` → `requireRole("pastor", "deacon")`
- **POST** `/api/bulletins` → `requireRole("deacon")`
- **PUT** `/api/bulletins/:id` → `requireRole("deacon")`
- **DELETE** `/api/bulletins/:id` → `requireRole("deacon")`

---

## 🟤 PORTAL LGPD (Todos Autenticados)

### Consentimentos LGPD
- **GET** `/api/lgpd/consents` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`
- **POST** `/api/lgpd/consents` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`
- **PUT** `/api/lgpd/consents/:id` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`

### Solicitações LGPD
- **GET** `/api/lgpd/requests` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`
- **POST** `/api/lgpd/requests` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`
- **PUT** `/api/lgpd/requests/:id` → `requireRole("pastor")` *(apenas pastor pode aprovar/rejeitar)*

### Exportação de Dados
- **GET** `/api/lgpd/export` → `requireRole("pastor", "treasurer", "deacon", "member", "visitor")`

---

## 🔐 AUDIT LOGS (Apenas Pastor)

- **GET** `/api/audit-logs` → `requireRole("pastor")`

---

## 🔓 ROTAS PÚBLICAS (SEM AUTORIZAÇÃO)

- **POST** `/api/auth/login` → Público (com rate limiting)
- **POST** `/api/auth/logout` → Público
- **GET** `/api/auth/session` → Apenas autenticação (sem verificação de role)
- **GET** `/api/csrf-token` → Público

---

## 📊 RESUMO DE PERMISSÕES POR ROLE

| Módulo | Pastor | Tesoureiro | Diácono | Membro | Visitante |
|--------|--------|------------|---------|--------|-----------|
| **Usuários** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Membros** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Seminaristas** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Catecúmenos** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Visitantes** | 👁️ Read-only | ❌ | ✅ Full CRUD | ❌ | ❌ |
| **Dízimos** | ✅ Full CRUD | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Ofertas** | ✅ Full CRUD | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Livraria** | ✅ Full CRUD | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Empréstimos** | ✅ Full CRUD | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Despesas** | ✅ Full CRUD | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Ajuda Diaconal** | 👁️ Read-only | ❌ | ✅ Full CRUD | ❌ | ❌ |
| **Boletim** | 👁️ Read-only | ❌ | ✅ Full CRUD | ❌ | ❌ |
| **Portal LGPD** | ✅ Full | ✅ Full | ✅ Full | ✅ Limited | ✅ Limited |
| **Audit Logs** | ✅ Read-only | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### Fase 1: Módulos Exclusivos do Pastor (✅ Tarefa #3, #4, #5)
1. Aplicar `requireRole("pastor")` em:
   - `/api/users/*`
   - `/api/members/*`
   - `/api/seminarians/*`
   - `/api/catechumens/*`

### Fase 2: Módulos Compartilhados Pastor + Tesoureiro (✅ Tarefa #6)
2. Aplicar `requireRole("pastor", "treasurer")` em:
   - `/api/tithes/*`
   - `/api/offerings/*`
   - `/api/bookstore/*`
   - `/api/loans/*`
   - `/api/expenses/*`

### Fase 3: Módulos Compartilhados Pastor + Diácono (✅ Tarefa #7)
3. Aplicar permissões diferenciadas em:
   - `/api/visitors` GET → `requireRole("pastor", "deacon")`
   - `/api/visitors` POST/PUT/DELETE → `requireRole("deacon")`
   - `/api/diaconal-help/*` → `requireRole("pastor", "deacon")`
   - `/api/bulletins/*` → `requireRole("pastor", "deacon")`

### Fase 4: Portal LGPD (✅ Tarefa #8)
4. Aplicar `requireRole("pastor", "treasurer", "deacon", "member", "visitor")` em:
   - `/api/lgpd/consents/*`
   - `/api/lgpd/requests` GET/POST
   - `/api/lgpd/export`
5. Aplicar `requireRole("pastor")` em:
   - `/api/lgpd/requests/:id` PUT (aprovação)

### Fase 5: Audit Logs
6. Aplicar `requireRole("pastor")` em:
   - `/api/audit-logs`

---

## ✅ VALIDAÇÃO APÓS IMPLEMENTAÇÃO

### Testes de Autorização

**Como Pastor (`pastor` / `senha123`):**
- ✅ Deve acessar TODOS os módulos
- ✅ Deve ter CRUD completo em: usuários, membros, seminaristas, catecúmenos
- ✅ Deve ter CRUD completo em: dízimos, ofertas, livraria, empréstimos, despesas
- ✅ Deve ter READ-ONLY em: visitantes, ajuda diaconal, boletins
- ✅ Deve ter acesso completo ao Portal LGPD

**Como Tesoureiro (`tesoureiro` / `senha123`):**
- ❌ NÃO deve acessar: usuários, membros, seminaristas, catecúmenos
- ✅ Deve ter CRUD completo em: dízimos, ofertas, livraria, empréstimos, despesas
- ❌ NÃO deve acessar: visitantes, ajuda diaconal, boletins
- ✅ Deve ter acesso completo ao Portal LGPD

**Como Diácono (`diacono` / `senha123`):**
- ❌ NÃO deve acessar: usuários, membros, seminaristas, catecúmenos
- ❌ NÃO deve acessar: dízimos, ofertas, livraria, empréstimos, despesas
- ✅ Deve ter CRUD completo em: visitantes, ajuda diaconal, boletins
- ✅ Deve ter acesso completo ao Portal LGPD

**Como Membro (`membro` / `senha123`):**
- ❌ NÃO deve acessar NENHUM painel administrativo
- ✅ Deve ter acesso limitado ao Portal LGPD (apenas seus dados)

**Como Visitante (`visitante` / `senha123`):**
- ❌ NÃO deve acessar NENHUM painel administrativo
- ✅ Deve ter acesso limitado ao Portal LGPD (apenas seus dados)

---

**Última atualização:** 21/11/2025 - 19:10  
**Próximo passo:** Implementar Tarefa #3 - Aplicar middleware em rotas de Membros
