# 🔐 CREDENCIAIS DO SISTEMA - IPE

## ✅ TODAS AS CREDENCIAIS FUNCIONANDO

O banco de dados foi configurado com sucesso e as credenciais estão **permanentemente ativas** para desenvolvimento.

---

## 👥 CREDENCIAIS DE ACESSO

### 🔵 PAINEL DO PASTOR

```
URL: http://localhost:5000
Username: pastor
Password: senha123
Redireciona para: /pastor
```

**Membro vinculado:** Pastor João Silva
**Email:** pastor@ipe.com
**Telefone:** (11) 98765-4321

**Acesso a:**
- ✅ Dashboard pastoral
- ✅ Gestão de membros (CRUD completo)
- ✅ Gestão de usuários (CRUD completo)
- ✅ Seminaristas
- ✅ Catecúmenos
- ✅ Visitantes (leitura)
- ✅ Aniversariantes
- ✅ Relatórios pastorais

---

### 🟣 PAINEL DO TESOUREIRO

```
URL: http://localhost:5000
Username: tesoureiro
Password: senha123
Redireciona para: /treasurer
```

**Membro vinculado:** Maria Santos
**Email:** tesoureiro@ipe.com
**Telefone:** (11) 98765-1234

**Acesso a:**
- ✅ Dashboard financeiro
- ✅ Gestão de dízimos
- ✅ Gestão de ofertas
- ✅ Livraria
- ✅ Empréstimos
- ✅ Saídas
- ✅ Relatórios financeiros

---

### 🟢 PAINEL DO DIÁCONO

```
URL: http://localhost:5000
Username: diacono
Password: senha123
Redireciona para: /deacon
```

**Membro vinculado:** Pedro Oliveira
**Email:** diacono@ipe.com
**Telefone:** (11) 98765-5678

**Acesso a:**
- ✅ Dashboard diaconal
- ✅ Cadastro de visitantes
- ✅ Ajuda diaconal
- ✅ Boletim dominical

---

## 🚀 COMO USAR

### Opção 1: Interface Web (Recomendado)

1. Abra o navegador no preview do Replit
2. Ou acesse: `http://localhost:5000`
3. Digite username e senha
4. Clique em "Entrar"
5. Será redirecionado para o painel correspondente

### Opção 2: API Direta (Para Testes)

```bash
# Login do Pastor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pastor","password":"senha123"}'

# Login do Tesoureiro
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tesoureiro","password":"senha123"}'

# Login do Diácono
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"diacono","password":"senha123"}'
```

---

## ✅ STATUS DE VALIDAÇÃO

Todos os usuários foram testados e validados:

- [x] **Pastor**: Login ✅ | Sessão ✅ | Redirecionamento ✅
- [x] **Tesoureiro**: Login ✅ | Sessão ✅ | Redirecionamento ✅
- [x] **Diácono**: Login ✅ | Sessão ✅ | Redirecionamento ✅

---

## 🔒 SEGURANÇA

### Hash de Senhas

As senhas estão armazenadas com **bcrypt (10 rounds)**:

```
Senha digitada:    senha123
Hash no banco:     $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl...
```

### Sessões

Após login bem-sucedido, o sistema cria uma sessão única:

```json
{
  "sessionId": "session_1763563172860_cl0pv5pciqd",
  "userId": "06f370fe-1068-4999-a0e5-704d5ae06d85",
  "username": "pastor",
  "role": "pastor",
  "memberId": "6490920c-73c5-4a67-9c8d-976d1aec0fff"
}
```

Essa sessão é armazenada no `localStorage` do navegador e enviada em todas as requisições via header:

```
Authorization: Bearer session_1763563172860_cl0pv5pciqd
```

---

## 📊 RASTREAMENTO TOTAL

### Audit Logs

Todas as ações são rastreadas via `audit_logs`:

```sql
SELECT 
  al.action,
  al.created_at,
  u.username as usuario,
  m.full_name as membro
FROM audit_logs al
JOIN users u ON al.user_id = u.id
LEFT JOIN members m ON u.member_id = m.id
ORDER BY al.created_at DESC;
```

**Exemplo de log:**
```
action | created_at          | usuario | membro
-------|---------------------|---------|------------------
CREATE | 2025-11-19 14:30:00 | pastor  | Pastor João Silva
```

---

## 🎓 TESTANDO O SISTEMA

### Teste 1: Login e Dashboard

```
1. Acesse: http://localhost:5000
2. Login: pastor / senha123
3. ✅ Deve aparecer Dashboard do Pastor
4. ✅ Menu lateral com todas as opções
```

### Teste 2: Gestão de Usuários

```
1. Login como pastor
2. Menu lateral → "Usuários do Sistema"
3. ✅ Deve mostrar 3 usuários (pastor, tesoureiro, diacono)
4. ✅ Clique em "Novo Usuário"
5. ✅ Preencha formulário e crie
```

### Teste 3: Alternância de Painéis

```
1. Login: pastor / senha123 → Vai para /pastor
2. Logout
3. Login: tesoureiro / senha123 → Vai para /treasurer
4. Logout
5. Login: diacono / senha123 → Vai para /deacon
```

---

## 🔄 RECRIAR CREDENCIAIS (Se Necessário)

Se por algum motivo precisar recriar os usuários:

```bash
# ATENÇÃO: Isso apagará todos os dados do banco!

# 1. Forçar recriação das tabelas
npm run db:push --force

# 2. Executar seed novamente
npx tsx server/seed.ts

# 3. Reiniciar servidor (usar botão no Replit)
```

---

## 📝 CRIAR NOVO USUÁRIO (Via Interface)

### Passo a passo:

1. **Login como Pastor** (`pastor` / `senha123`)
2. **Menu Lateral** → "Usuários do Sistema"
3. **Botão** → "Novo Usuário"
4. **Preencher:**
   - Membro: (selecionar da lista)
   - Username: (exemplo: `joao.silva`)
   - Senha: (exemplo: `minhasenha123`)
   - Painel: (Pastor / Tesoureiro / Diácono)
5. **Criar**
6. ✅ Novo usuário criado!

### Via API:

```bash
# 1. Fazer login e pegar sessionId
SESSION_ID=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pastor","password":"senha123"}' | \
  jq -r '.sessionId')

# 2. Criar novo usuário
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_ID" \
  -d '{
    "memberId": "ID_DO_MEMBRO",
    "username": "novo.usuario",
    "password": "senha123",
    "role": "deacon"
  }'
```

---

## 🎯 PRÓXIMOS PASSOS

Agora que as credenciais estão funcionando, você pode:

1. ✅ **Explorar o sistema** com cada role
2. ✅ **Criar novos usuários** via interface
3. ✅ **Desenvolver novos módulos** (seminaristas, catecúmenos, etc)
4. ✅ **Testar funcionalidades** de cada painel

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `DOCUMENTACAO_SISTEMA_USUARIOS.md` - Documentação completa do sistema de usuários
- `CONFIGURACAO_BANCO_DADOS.md` - Como o banco foi configurado
- `RESUMO_EXECUTIVO.md` - Visão geral do projeto
- `IMPLEMENTACAO_GESTAO_USUARIOS.md` - Detalhes técnicos

---

**Status:** ✅ Todas as credenciais funcionando  
**Data:** 19/11/2025  
**Validade:** Permanente durante desenvolvimento  
**Banco:** PostgreSQL (Neon-backed)

---

## 🆘 SUPORTE

Se tiver qualquer problema com login:

1. Verifique se o servidor está rodando (`npm run dev`)
2. Verifique se o banco está conectado (logs do servidor)
3. Tente fazer login via API (curl) para testar
4. Verifique o console do navegador (F12) para erros
5. Se necessário, execute o seed novamente (`npx tsx server/seed.ts`)

**Todos os 3 usuários foram validados e estão funcionando! ✅**
