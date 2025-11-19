# 📋 DOCUMENTAÇÃO COMPLETA - SISTEMA DE USUÁRIOS DO PAINEL DO PASTOR

## 🎯 OBJETIVO

Permitir que o Pastor crie e gerencie usuários do sistema, vinculando **membros cadastrados** aos **painéis de acesso** (Pastor, Tesoureiro, Diácono), com **rastreamento completo** de todas as ações através do sistema de logs.

---

## ✅ STATUS DE IMPLEMENTAÇÃO

### 🟢 **IMPLEMENTADO E FUNCIONAL**

#### 1. **Backend - Autenticação e Segurança**

**Arquivo:** `server/auth.ts`

✅ **Hash de senhas com bcrypt (10 rounds)**
- Função: `hashPassword(password: string)`
- Segurança: As senhas NUNCA são armazenadas em texto puro

✅ **Comparação segura de senhas**
- Função: `comparePassword(password: string, hash: string)`
- Usado no login para validar credenciais

✅ **Autenticação de usuários**
- Função: `authenticateUser(username: string, password: string)`
- Retorna o usuário completo ou null se inválido

✅ **Sistema de sessões**
- `createSession(user: User)` - Cria sessão após login
- `getSession(sessionId: string)` - Valida sessão ativa
- `deleteSession(sessionId: string)` - Remove sessão no logout

#### 2. **Backend - API de Usuários**

**Arquivo:** `server/routes.ts`

✅ **GET `/api/users`**
- Lista todos os usuários
- Remove senhas hasheadas da resposta (segurança)
- Retorna: username, role, memberId, id, timestamps

✅ **POST `/api/users`** 
- Cria novo usuário
- **Validações:**
  - Username: mínimo 3 caracteres
  - Senha: mínimo 6 caracteres
  - Role: apenas "pastor", "treasurer" ou "deacon"
  - MemberId: opcional
- **Segurança:**
  - Requer autenticação (sessão válida)
  - Hash automático da senha
- **Auditoria:**
  - Cria log automático com ação "CREATE"
  - Registra userId de quem criou
  - Salva dados no changesAfter

✅ **PUT `/api/users/:id`**
- Atualiza usuário existente
- Permite alterar:
  - Senha (re-hash automático se fornecida)
  - Role (painel de acesso)
  - MemberId (vinculação)
- **Auditoria:**
  - Busca dados antigos (changesBefore)
  - Salva dados novos (changesAfter)
  - Ação: "UPDATE"

✅ **DELETE `/api/users/:id`**
- Remove usuário do sistema
- **Auditoria:**
  - Registra dados do usuário deletado
  - Ação: "DELETE"

#### 3. **Frontend - Painel do Pastor**

**Arquivo:** `client/src/pages/pastor/users.tsx`

✅ **Interface Completa de Gestão**

**a) Listagem de Usuários:**
- Tabela com colunas:
  - Nome de usuário
  - Membro vinculado (busca automática pelo memberId)
  - Painel (badge colorido por role)
  - Ações (editar/deletar)
- Loading state durante carregamento
- Mensagem quando não há usuários

**b) Criação de Usuário (Dialog):**
- **Campo: Membro**
  - Select com lista de membros disponíveis
  - **Filtro inteligente:** Só mostra membros SEM usuário
  - Descrição: "Apenas membros sem usuário aparecem na lista"
  
- **Campo: Nome de Usuário**
  - Input text
  - Validação: mínimo 3 caracteres
  
- **Campo: Senha**
  - Input password
  - Validação: mínimo 6 caracteres
  
- **Campo: Painel de Acesso**
  - Select com 3 opções:
    - 🔵 Pastor
    - 🟣 Tesoureiro  
    - 🟢 Diácono
  
- **Botões:**
  - Cancelar (fecha dialog)
  - Criar Usuário (submit com loading state)

**c) Edição de Usuário (Dialog):**
- Mostra username (não editável)
- Permite alterar:
  - **Painel de Acesso** (select)
  - **Nova Senha** (opcional)
- Descrição: "Deixe em branco para manter a senha atual"
- Loading state durante salvamento

**d) Exclusão de Usuário (Alert Dialog):**
- Confirmação com nome do usuário
- Aviso: "Esta ação não pode ser desfeita"
- Botões: Cancelar / Deletar (vermelho)

**e) Validação e Feedback:**
- ✅ Validação com Zod em todos os formulários
- ✅ Toast de sucesso em todas as operações
- ✅ Toast de erro com mensagens descritivas
- ✅ Invalidação automática do cache (React Query)
- ✅ Reset automático dos formulários após sucesso

**f) Data-testids para Testes:**
- `button-create-user` - Botão criar novo
- `select-member` - Seleção de membro
- `input-username` - Campo username
- `input-password` - Campo senha
- `select-role` - Seleção de painel
- `button-submit-create` - Enviar criação
- `button-edit-{id}` - Botão editar por ID
- `button-delete-{id}` - Botão deletar por ID
- `row-user-{id}` - Linha da tabela por ID

#### 4. **Database Schema**

**Arquivo:** `shared/schema.ts`

✅ **Tabela: users**
```typescript
{
  id: varchar (UUID gerado automaticamente)
  username: text (unique, not null)
  password: text (hash bcrypt, not null)
  role: roleEnum (pastor/treasurer/deacon/member/visitor)
  memberId: varchar (FK para members, cascade delete)
  visitorId: varchar (FK para visitors, cascade delete)
  createdAt: timestamp
  updatedAt: timestamp
}
```

✅ **Tabela: members**
- Todos os campos de identificação, contatos, situação espiritual
- Campo: `fullName` usado na listagem de usuários

✅ **Enums:**
- `roleEnum`: "pastor", "treasurer", "deacon", "member", "visitor"

#### 5. **Sistema de Audit Logs**

**Arquivo:** `shared/schema.ts` e `server/routes.ts`

✅ **Tabela: audit_logs**
```typescript
{
  id: serial (auto-incremento)
  userId: varchar (quem fez a ação)
  action: text (CREATE/UPDATE/DELETE)
  tableName: text (users)
  recordId: varchar (id do registro afetado)
  changesBefore: jsonb (dados antes)
  changesAfter: jsonb (dados depois)
  createdAt: timestamp
}
```

✅ **Rastreamento Automático:**
- **CREATE user:** Registra quem criou, dados criados
- **UPDATE user:** Registra quem alterou, antes/depois
- **DELETE user:** Registra quem deletou, dados deletados

---

## 📊 FLUXO COMPLETO DE CRIAÇÃO DE USUÁRIO

### 1️⃣ **Pastor acessa** `/pastor/users`

### 2️⃣ **Clica em "Novo Usuário"**
- Dialog abre

### 3️⃣ **Seleciona um Membro**
- Lista mostra APENAS membros sem usuário
- Exemplo: "João da Silva"

### 4️⃣ **Define Username**
- Exemplo: "joao.silva"

### 5️⃣ **Cria Senha**
- Exemplo: "senha123" (mínimo 6 caracteres)

### 6️⃣ **Escolhe o Painel**
- Exemplo: "Tesoureiro"

### 7️⃣ **Clica em "Criar Usuário"**

### 8️⃣ **Backend Processa:**
a) Valida dados com Zod
b) Faz hash da senha com bcrypt
c) Cria registro em `users`
d) Cria audit_log:
```json
{
  "userId": "id-do-pastor",
  "action": "CREATE",
  "tableName": "users",
  "recordId": "novo-id-gerado",
  "changesAfter": {
    "username": "joao.silva",
    "role": "treasurer",
    "memberId": "id-do-joao"
  }
}
```

### 9️⃣ **Frontend Responde:**
- Toast: "Usuário criado com sucesso"
- Atualiza lista automaticamente
- Fecha dialog
- Limpa formulário

### 🔟 **João agora pode fazer login:**
- Username: `joao.silva`
- Senha: `senha123`
- Acessa: `/treasurer` (Painel do Tesoureiro)

---

## 🔗 VÍNCULO TOTAL NO RASTREAMENTO

### Como funciona o rastreamento completo:

1. **Membro → User → Actions**
   - Cada usuário está vinculado a um `memberId`
   - Toda ação registra o `userId` em audit_logs
   - Podemos rastrear:
     - Quem fez (userId → memberId → fullName)
     - O quê (action + tableName)
     - Quando (createdAt)
     - Dados antes/depois (changesBefore/changesAfter)

2. **Exemplo de Rastreamento:**

**Cenário:** Pastor João cria usuário para Maria (tesoureiro)

**Registro em audit_logs:**
```json
{
  "id": 1,
  "userId": "uuid-do-pastor-joao",  // ← Quem criou
  "action": "CREATE",
  "tableName": "users",
  "recordId": "uuid-do-user-maria",  // ← Usuário criado
  "changesBefore": null,
  "changesAfter": {
    "username": "maria.santos",
    "role": "treasurer",
    "memberId": "uuid-da-maria"     // ← Vinculo com membro
  },
  "createdAt": "2025-11-19T14:30:00Z"
}
```

**Com esse log sabemos:**
- **Quem:** Pastor João (userId → busca em users → memberId → busca fullName)
- **Fez o quê:** Criou um usuário
- **Para quem:** Maria Santos (memberId nos changesAfter)
- **Com qual acesso:** Tesoureiro (role)
- **Quando:** 19/11/2025 às 14:30

3. **Histórico Completo:**
- Todos os CREATE/UPDATE/DELETE de usuários ficam registrados
- Impossível perder histórico de quem tinha acesso
- Auditoria completa para conformidade LGPD

---

## 🎨 CORES DOS BADGES POR PAINEL

```typescript
Pastor:     bg-primary (azul)
Tesoureiro: bg-accent (roxo/cinza)
Diácono:    bg-green-600 (verde)
```

---

## 🔒 SEGURANÇA IMPLEMENTADA

✅ **Senhas:**
- NUNCA armazenadas em texto puro
- Hash bcrypt com 10 rounds
- Senhas não retornadas nas APIs

✅ **Autenticação:**
- Todas as rotas de usuários exigem sessão válida
- Header: `Authorization: Bearer {sessionId}`

✅ **Validação:**
- Zod no backend E frontend
- Mensagens de erro descritivas

✅ **Auditoria:**
- Impossível alterar usuários sem registro
- Histórico permanente

---

## 📱 ROTAS DO SISTEMA

### Autenticação:
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Validar sessão

### Usuários (requer autenticação):
- `GET /api/users` - Listar todos
- `POST /api/users` - Criar novo
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Deletar

### Membros:
- `GET /api/members` - Listar (usado no select)

---

## 🧪 CREDENCIAIS DE TESTE

Usuários criados no seed inicial:

**Pastor:**
- Username: `pastor`
- Password: `senha123`
- Acesso: `/pastor`

**Tesoureiro:**
- Username: `tesoureiro`
- Password: `senha123`
- Acesso: `/treasurer`

**Diácono:**
- Username: `diacono`
- Password: `senha123`
- Acesso: `/deacon`

---

## ❌ O QUE FALTA IMPLEMENTAR

### 🔴 Funcionalidades Pendentes:

1. **Paginação da Lista de Usuários**
   - Atualmente mostra todos
   - Necessário para muitos usuários

2. **Filtros e Busca**
   - Buscar por username
   - Filtrar por role (painel)
   - Filtrar por membro

3. **Validação de Username Único**
   - Backend valida, mas frontend não mostra erro claro
   - Melhorar feedback visual

4. **Exportação de Relatório de Usuários**
   - PDF com lista de acessos
   - Excel para auditoria

5. **Histórico de Alterações por Usuário**
   - Ver todos os audit_logs de um usuário específico
   - Interface de visualização de logs

6. **Notificação por Email**
   - Enviar credenciais para o novo usuário
   - Email ao alterar senha

7. **Senha Temporária / Primeiro Acesso**
   - Forçar troca de senha no primeiro login
   - Senha temporária gerada automaticamente

8. **Desativação de Usuário (Soft Delete)**
   - Ao invés de deletar, desativar
   - Manter histórico mas bloquear login

9. **Permissões Granulares**
   - Atualmente só 3 roles (pastor/treasurer/deacon)
   - Futuro: permissões específicas por funcionalidade

10. **Logs de Login/Logout**
    - Registrar tentativas de login
    - Rastrear IPs e dispositivos
    - Alertas de segurança

11. **Autenticação de Dois Fatores (2FA)**
    - Código via email ou SMS
    - Maior segurança para pastores

12. **Sessão com Timeout**
    - Atualmente sessões nunca expiram
    - Implementar expiração automática

---

## 📂 ESTRUTURA DE ARQUIVOS

```
server/
├── auth.ts                 # ✅ Sistema de autenticação
├── routes.ts              # ✅ APIs de usuários
├── storage.ts             # ✅ Interface de storage
└── seed.ts                # ✅ Dados iniciais

client/src/
├── pages/
│   ├── login.tsx          # ✅ Página de login
│   └── pastor/
│       └── users.tsx      # ✅ Gestão de usuários
└── App.tsx               # ✅ Rotas configuradas

shared/
└── schema.ts             # ✅ Schema DB com users, members, audit_logs
```

---

## 🚀 COMO USAR

### 1. **Acessar Painel do Pastor**
```
URL: http://localhost:5000/pastor/users
Login: pastor / senha123
```

### 2. **Criar Novo Usuário**
- Clicar em "Novo Usuário"
- Selecionar membro da lista
- Preencher username e senha
- Escolher painel (pastor/treasurer/deacon)
- Confirmar

### 3. **Editar Usuário**
- Clicar no ícone de lápis na linha do usuário
- Alterar painel ou senha
- Salvar alterações

### 4. **Deletar Usuário**
- Clicar no ícone de lixeira
- Confirmar exclusão

---

## 🔍 CONSULTAS ÚTEIS

### Ver todos os logs de criação de usuários:
```sql
SELECT * FROM audit_logs 
WHERE table_name = 'users' 
AND action = 'CREATE' 
ORDER BY created_at DESC;
```

### Ver quem criou um usuário específico:
```sql
SELECT 
  al.*,
  u.username as created_by,
  m.full_name as member_name
FROM audit_logs al
JOIN users u ON al.user_id = u.id
JOIN members m ON u.member_id = m.id
WHERE al.table_name = 'users' 
AND al.record_id = 'ID_DO_USUARIO';
```

### Ver histórico completo de um membro:
```sql
SELECT * FROM audit_logs 
WHERE changes_after::text LIKE '%MEMBER_ID%'
ORDER BY created_at DESC;
```

---

## 📝 CONCLUSÃO

O **Sistema de Gestão de Usuários** está **100% funcional** para as operações básicas de CRUD. O pastor pode:

✅ Criar usuários vinculados a membros
✅ Definir painel de acesso (role)
✅ Criar senhas seguras (com hash)
✅ Editar permissões e senhas
✅ Deletar usuários
✅ Ter rastreamento completo via audit_logs

**Próximos passos:** Implementar as funcionalidades avançadas listadas na seção "O QUE FALTA IMPLEMENTAR" conforme a prioridade do projeto.

---

**Data da Documentação:** 19 de Novembro de 2025
**Versão do Sistema:** 1.0
**Status:** ✅ Operacional
