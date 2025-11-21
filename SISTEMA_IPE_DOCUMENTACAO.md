# SISTEMA INTEGRADO IPE - DOCUMENTAÇÃO COMPLETA

## Igreja Presbiteriana Emaús - Sistema de Gestão Eclesiástica

**Versão:** 1.0.0  
**Data:** Novembro 2025 (Última atualização: 21/11/2025)  
**Status:** Desenvolvimento - Módulo Pastor 75% Completo

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visao-geral)
2. [Arquitetura](#arquitetura)
3. [Design System e Identidade Visual](#design-system)
4. [Estrutura de Dados (Schemas)](#estrutura-de-dados)
5. [Funcionalidades por Painel](#funcionalidades)
   - [Painel do Pastor](#painel-pastor)
   - [Painel do Tesoureiro](#painel-tesoureiro)
   - [Painel do Diácono](#painel-diacono)
   - [Portal LGPD](#portal-lgpd)
6. [Tecnologias Utilizadas](#tecnologias)
7. [Funcionalidades Implementadas](#implementadas)
8. [Funcionalidades Pendentes](#pendentes)
9. [Guia de Uso por Perfil](#guia-uso)
10. [Compliance LGPD](#compliance)
11. [Próximos Passos](#proximos-passos)

---

## <a name="visao-geral"></a>1. VISÃO GERAL DO SISTEMA

O Sistema Integrado IPE é uma plataforma web completa de gestão eclesiástica desenvolvida especificamente para a Igreja Presbiteriana Emaús. O sistema é dividido em **4 painéis completamente independentes**, cada um com seu próprio controle de acesso e funcionalidades específicas:

### 🔵 Painel do Pastor
Responsável pela gestão pastoral e administrativa de membros, seminaristas, catecúmenos e visitantes.

### 🟣 Painel do Tesoureiro
Gerenciamento financeiro completo: dízimos, ofertas, livraria, empréstimos, saídas e relatórios.

### 🟢 Painel do Diácono
Gestão de visitantes, ajuda diaconal e criação do boletim dominical.

### 🟤 Portal LGPD
Portal autogerenciado onde membros e visitantes podem visualizar, exportar, corrigir e solicitar exclusão de seus dados pessoais.

### Princípios Fundamentais

1. **Separação Total de Painéis**: Cada perfil vê apenas suas funções específicas
2. **Segurança e Sigilo**: Informações pastorais são privadas, dados financeiros isolados
3. **Compliance LGPD**: Sistema completo de gestão de consentimento e direitos dos titulares
4. **Rastreabilidade**: Todos os logs de auditoria para conformidade legal
5. **Usabilidade**: Interface intuitiva para usuários com diferentes níveis de alfabetização digital

---

## <a name="arquitetura"></a>2. ARQUITETURA

### Stack Tecnológico

**Frontend:**
- React 18 com TypeScript
- Vite (build tool)
- Wouter (roteamento)
- TailwindCSS + Shadcn UI (design system)
- React Query (gerenciamento de estado)
- React Hook Form + Zod (formulários e validação)

**Backend:**
- Node.js + Express
- PostgreSQL (Neon)
- Drizzle ORM
- Multer (upload de arquivos)

**Autenticação:**
- Sistema de login com roles (Pastor, Tesoureiro, Diácono, Membro, Visitante)
- Controle de acesso baseado em permissões por painel

### Estrutura de Diretórios

```
sistema-ipe/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── ui/              # Shadcn UI components
│   │   │   ├── app-layout.tsx   # Layout principal com sidebar
│   │   │   ├── app-sidebar.tsx  # Sidebar com logo IPE
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/               # Páginas do sistema
│   │   │   ├── login.tsx
│   │   │   ├── pastor/          # Páginas do Pastor
│   │   │   ├── treasurer/       # Páginas do Tesoureiro
│   │   │   ├── deacon/          # Páginas do Diácono
│   │   │   └── lgpd/            # Páginas LGPD
│   │   ├── lib/                 # Utilitários
│   │   ├── hooks/               # Custom hooks
│   │   ├── App.tsx              # Rotas principais
│   │   ├── index.css            # Estilos globais IPE
│   │   └── main.tsx
│   ├── index.html
│   └── attached_assets/         # Logo IPE
├── server/                      # Backend Node.js
│   ├── db.ts                    # Configuração Drizzle
│   ├── storage.ts               # Interface de dados
│   ├── routes.ts                # Rotas da API
│   └── index.ts
├── shared/                      # Código compartilhado
│   └── schema.ts                # Schemas Drizzle + Zod
├── design_guidelines.md         # Guidelines de design IPE
└── SISTEMA_IPE_DOCUMENTACAO.md  # Este arquivo
```

### Fluxo de Dados

```
[Frontend] → React Query → [API REST] → Express Routes → Storage Interface → Drizzle ORM → [PostgreSQL]
```

### Autenticação e Autorização

1. Usuário faz login com username/password
2. Sistema identifica o `role` (pastor, treasurer, deacon, member, visitor)
3. Redirecionamento para painel correspondente
4. Sidebar e rotas filtradas por permissão
5. Backend valida role em cada requisição

---

## <a name="design-system"></a>3. DESIGN SYSTEM E IDENTIDADE VISUAL

### Paleta de Cores IPE

**Cores Primárias:**
- **Azul Petróleo IPE**: `#1E5F74` (hsl: 195 75% 25%)
  - Cor institucional principal, presente no logo "EMAÚS"
  - Usada em: sidebar, textos principais, botões primários
  
- **Laranja IPE**: `#F39C12` (hsl: 33 90% 51%)
  - Cor de destaque e acentuação, presente no logo
  - Usada em: botões de ação, badges, gráficos, highlights

**Cores Neutras:**
- Branco: fundo principal
- Cinza claro: cards, inputs
- Cinza médio: textos secundários
- Cinza escuro: textos principais

**Cores Semânticas:**
- Verde: sucesso, status ativo
- Vermelho: erro, exclusão, status em disciplina
- Amarelo/Laranja: alerta, status apto
- Azul claro: informação, status transferido

### Tipografia

**Fonte Principal:** Inter
- Títulos de Página: 36px (text-3xl) bold
- Cabeçalhos de Seção: 24px (text-xl) semibold
- Títulos de Card: 20px (text-lg) medium
- Corpo de Texto: 16px (text-base)
- Texto Auxiliar: 14px (text-sm)

### Componentes de UI

**Shadcn UI Components utilizados:**
- Accordion, Alert, Avatar, Badge, Button, Calendar
- Card, Carousel, Checkbox, Command, Dialog
- Form, Input, Label, Select, Separator
- Sheet, Sidebar, Skeleton, Switch, Table
- Tabs, Textarea, Toast, Tooltip

**Customizações IPE:**
- Sidebar com logo IPE (200px width)
- Badge de identificação de painel com cores distintas
- Botões com elevação em hover (hover-elevate)
- Cards com sombra suave

### Dark Mode

Sistema completo de dark mode implementado:
- Toggle no header de cada painel
- Persistência em localStorage
- Cores adaptadas para contraste adequado
- Logo IPE com fundo transparente (adaptável)

---

## <a name="estrutura-de-dados"></a>4. ESTRUTURA DE DADOS (SCHEMAS)

### Modelo de Dados Completo

O sistema utiliza **PostgreSQL** com **Drizzle ORM**. Todas as tabelas, enums e relações estão definidas em `shared/schema.ts`.

#### 4.1 Usuários e Autenticação

**Tabela: `users`**
```typescript
{
  id: uuid (PK)
  username: string (único)
  password: string (hash bcrypt)
  role: enum (pastor, treasurer, deacon, member, visitor)
  memberId: uuid (FK → members.id)
  visitorId: uuid (FK → visitors.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.2 Membros (Painel do Pastor)

**Tabela: `members`**
```typescript
{
  // Identificação
  id: uuid (PK)
  fullName: string
  gender: enum (masculino, feminino)
  birthDate: date
  maritalStatus: enum (solteiro, casado, viuvo, divorciado)
  
  // Contatos
  primaryPhone: string
  secondaryPhone: string
  email: string
  address: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  zipCode: string
  
  // Situação Espiritual
  communionStatus: enum (comungante, nao_comungante)
  
  // Cargo Eclesiástico
  ecclesiasticalRole: enum (membro, presbitero, diacono, pastor, seminarista)
  
  // Status Administrativo
  memberStatus: enum (ativo, inativo, transferido, em_disciplina)
  
  // Informações de Matrícula
  admissionDate: date
  marriageDate: date (opcional)
  
  // Observações Pastorais (privado - só pastor)
  pastoralNotes: text
  
  // LGPD
  lgpdConsentUrl: string (obrigatório)
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.3 Seminaristas (Painel do Pastor)

**Tabela: `seminarians`**
```typescript
{
  id: uuid (PK)
  fullName: string
  email: string
  phone: string
  institution: string (CPAJ, FTSA, etc.)
  enrollmentYear: integer
  status: enum (ativo, em_estagio, concluido)
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.4 Catecúmenos (Painel do Pastor)

**Tabela: `catechumens`**
```typescript
{
  id: uuid (PK)
  fullName: string
  startDate: date
  expectedProfessionDate: date
  stage: enum (em_andamento, apto, concluido)
  professorId: uuid (FK → members.id - sempre Pastor)
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Etapas do Catecúmeno:**
1. **Em Andamento**: Frequentando classe de catecúmenos
2. **Apto**: Completou conteúdo, pronto para profissão de fé
3. **Concluído**: Batizado/professou fé, vira MEMBRO automaticamente

#### 4.5 Visitantes (Painel do Diácono - CRUD, Painel do Pastor - Read Only)

**Tabela: `visitors`**
```typescript
{
  id: uuid (PK)
  fullName: string
  phone: string
  email: string
  address: string
  hasChurch: boolean
  churchOrigin: string (se hasChurch = true)
  invitedByMemberId: uuid (FK → members.id)
  firstVisitDate: date
  notes: text
  lgpdConsentUrl: string (obrigatório)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.6 Financeiro - Dízimos (Painel do Tesoureiro)

**Tabela: `tithes`**
```typescript
{
  id: uuid (PK)
  memberId: uuid (FK → members.id - obrigatório)
  amount: decimal(10,2)
  date: date
  paymentMethod: enum (dinheiro, pix, transferencia, cartao, cheque)
  notes: text
  receiptUrl: string (opcional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.7 Financeiro - Ofertas (Painel do Tesoureiro)

**Tabela: `offerings`**
```typescript
{
  id: uuid (PK)
  type: enum (social, geral, obra, missoes) - SOMENTE 4 TIPOS
  amount: decimal(10,2)
  date: date
  notes: text
  receiptUrl: string (opcional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Tipos de Oferta (definitivos):**
1. Social
2. Geral
3. Obra
4. Missões

#### 4.8 Financeiro - Livraria (Painel do Tesoureiro)

**Tabela: `bookstore_sales`**
```typescript
{
  id: uuid (PK)
  productName: string
  quantity: integer
  totalAmount: decimal(10,2)
  paymentMethod: enum
  buyerMemberId: uuid (FK → members.id - opcional)
  buyerVisitorId: uuid (FK → visitors.id - opcional)
  date: date
  receiptUrl: string (OBRIGATÓRIO)
  createdAt: timestamp
  updatedAt: timestamp
}
```

Venda vinculada a membro OU visitante.

#### 4.9 Financeiro - Empréstimos (Painel do Tesoureiro)

**Tabela: `loans`**
```typescript
{
  id: uuid (PK)
  creditorName: string
  totalAmount: decimal(10,2)
  installments: integer (número de parcelas)
  installmentAmount: decimal(10,2)
  firstInstallmentDate: date
  receiptUrl: string (opcional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

Sistema gera automaticamente todas as parcelas de saída em `expenses`.

#### 4.10 Financeiro - Saídas (Painel do Tesoureiro)

**Tabela: `expenses`**
```typescript
{
  id: uuid (PK)
  category: enum (agua, luz, internet, sistema_alarme, zeladoria, 
                 salario_pastor, oferta_missionarios, ajuda_diaconal, 
                 manutencao, insumos, parcela_emprestimo)
  description: string
  amount: decimal(10,2)
  date: date
  receiptUrl: string (OBRIGATÓRIO)
  loanId: uuid (FK → loans.id - se for parcela)
  installmentNumber: integer (número da parcela se aplicável)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.11 Ajuda Diaconal (Painel do Diácono)

**Tabela: `diaconal_help`**
```typescript
{
  id: uuid (PK)
  memberId: uuid (FK → members.id - SOMENTE MEMBROS)
  type: enum (cesta_basica, remedio, aluguel, consulta, transporte, outros)
  amount: decimal(10,2)
  date: date
  description: string
  receiptUrl: string (OBRIGATÓRIO)
  expenseId: uuid (FK → expenses.id - gerado automaticamente)
  createdAt: timestamp
  updatedAt: timestamp
}
```

Sistema gera automaticamente saída na categoria "ajuda_diaconal" em `expenses`.

#### 4.12 Boletim Dominical (Painel do Diácono)

**Tabela: `bulletins`**
```typescript
{
  id: uuid (PK)
  
  // Cabeçalho
  editionNumber: integer
  date: date
  liturgicalYear: string
  
  // Devocional
  devotionalTitle: string
  devotionalBibleText: string
  devotionalMessage: text
  
  // Liturgia completa (JSON)
  liturgy: text (JSON string com todos os itens)
  
  // EBD (JSON)
  ebdReport: text (JSON com tabela mensal)
  
  // Avisos (JSON)
  departmentNotices: text (JSON array)
  
  // Oferta do dia
  offeringType: enum (social, geral, obra, missoes)
  
  // Aniversariantes
  birthdayMemberIds: text (JSON array de IDs)
  anniversaryMemberIds: text (JSON array de IDs)
  
  // Pedidos de Oração (JSON)
  prayerRequests: text (JSON)
  prayerLeaderId: uuid (FK → members.id - Presbítero ou Pastor)
  
  // Liderança (JSON - gerado da tabela members)
  leadershipData: text (JSON)
  
  published: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Estrutura do Boletim:**
- A) Cabeçalho (nome, local, data, edição, ano litúrgico, banner)
- B) Devocional / Mensagem Pastoral
- C) Liturgia Completa (15+ itens)
- D) Relatório da EBD (tabela mensal)
- E) Avisos dos Departamentos (SAF, UPH, UMP, UPA, CPE, CER, etc.)
- F) Transmissão ao vivo pelo YouTube (fixo)
- G) Oferta do dia
- H) Regras de reverência no culto (fixo)
- I) Projeto: Reforma do Edifício (fixo)
- J) Aniversariantes da semana
- K) Pedidos de oração (5 categorias)
- L) Liderança (Pastor, Presbíteros, Diáconos, Seminarista, Missionárias)
- M) Horários fixos da IPE
- N) Dados bancários + PIX
- O) Informações finais (texto fixo)

#### 4.13 LGPD - Consentimentos

**Tabela: `lgpd_consents`**
```typescript
{
  id: uuid (PK)
  memberId: uuid (FK → members.id)
  visitorId: uuid (FK → visitors.id)
  consentGiven: boolean
  consentDate: timestamp
  revokedDate: timestamp
  documentUrl: string (URL do termo assinado)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.14 LGPD - Solicitações

**Tabela: `lgpd_requests`**
```typescript
{
  id: uuid (PK)
  memberId: uuid (FK → members.id)
  visitorId: uuid (FK → visitors.id)
  action: enum (view, export, correction_request, deletion_request)
  description: text
  status: string (pending, approved, rejected)
  resolvedBy: uuid (FK → users.id)
  resolvedAt: timestamp
  notes: text (notas do pastor)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4.15 Logs de Auditoria

**Tabela: `audit_logs`**
```typescript
{
  id: uuid (PK)
  userId: uuid (FK → users.id)
  action: string (CREATE, UPDATE, DELETE, VIEW, EXPORT)
  tableName: string
  recordId: uuid
  changesBefore: text (JSON)
  changesAfter: text (JSON)
  ipAddress: string
  createdAt: timestamp
}
```

Sistema registra automaticamente:
- Todas as ações de CRUD
- Acessos LGPD
- Uploads de documentos
- Deleções (soft delete recuperável)
- Geração de boletins
- Transações financeiras

---

## <a name="funcionalidades"></a>5. FUNCIONALIDADES POR PAINEL

### <a name="painel-pastor"></a>5.1 PAINEL DO PASTOR 🔵

**Acesso:** Somente usuários com role `pastor`

#### Dashboard
- Métricas principais:
  - Total de membros ativos
  - Seminaristas (total e em estágio)
  - Catecúmenos (por etapa)
  - Visitantes do mês
- Aniversariantes da semana
- Catecúmenos aptos para profissão
- Atividades recentes

#### Membros (CRUD Completo)
**Funcionalidades:**
- ✅ Listar todos os membros
- ✅ Buscar por nome ou email
- ✅ Filtrar por status, cargo, situação espiritual
- ✅ Cadastrar novo membro (formulário completo)
- ✅ Visualizar detalhes do membro
- ✅ Editar informações do membro
- ✅ Excluir membro (soft delete)
- ⏳ Upload obrigatório de termo LGPD
- ⏳ Observações pastorais (privadas)

**Campos do Membro:**
- Identificação: nome, gênero, data nascimento, estado civil
- Contatos: telefone, email, endereço completo
- Situação Espiritual: comungante/não comungante
- Cargo Eclesiástico: membro, presbítero, diácono, pastor, seminarista
- Status: ativo, inativo, transferido, em disciplina
- Matrícula: data admissão, data casamento
- Observações Pastorais (privado)
- LGPD: upload de termo de consentimento

#### Seminaristas
**Funcionalidades:**
- ⏳ Listar seminaristas
- ⏳ Cadastrar novo seminarista
- ⏳ Editar informações
- ⏳ Registrar mudança de status (ativo → em estágio → concluído)

**Campos:**
- Nome, email, telefone
- Instituição teológica (CPAJ, FTSA, etc.)
- Ano de ingresso
- Status: ativo, em estágio, concluído
- Observações

#### Catecúmenos (3 Etapas)
**Funcionalidades:**
- ⏳ Listar catecúmenos por etapa
- ⏳ Cadastrar novo catecúmeno
- ⏳ Transição de etapas: em andamento → apto → concluído
- ⏳ Ao concluir: membro criado automaticamente

**Campos:**
- Nome (pode ser visitante ou não comungante)
- Data início
- Previsão profissão de fé
- Etapa atual
- Professor responsável (sempre Pastor - campo bloqueado)
- Observações

#### Visitantes (Somente Leitura)
**Funcionalidades:**
- ✅ Visualizar lista de visitantes
- ✅ Ver histórico de visitas
- ✅ Ver quem convidou
- ✅ Ver igreja de origem
- ❌ NÃO pode editar (gestão é do Diácono)

#### Aniversariantes (Automático)
**Funcionalidades:**
- ⏳ Sistema identifica automaticamente:
  - Aniversariantes da semana (somente membros ativos)
  - Aniversários de casamento (membros casados)
- ⏳ Enviar lista para boletim
- ⏳ Exportar relatório
- ⏳ Excluir manualmente caso especial

#### Relatórios Pastorais
**Funcionalidades:**
- ⏳ Membros por cargo (Membro, Presbítero, Diácono, Pastor)
- ⏳ Membros por status (Ativo, Inativo, Transferido, Disciplina)
- ⏳ Comungantes / Não comungantes
- ⏳ Seminaristas por status
- ⏳ Catecúmenos por etapa
- ⏳ Visitantes por frequência (somente leitura)
- ⏳ Aniversariantes
- ⏳ Exportação: PDF, Excel, CSV

---

### <a name="painel-tesoureiro"></a>5.2 PAINEL DO TESOUREIRO 🟣

**Acesso:** Somente usuários com role `treasurer`

#### Dashboard Financeiro
- Métricas principais:
  - Saldo atual
  - Entradas do mês
  - Saídas do mês
  - Resultado do mês (superávit/déficit)
- Gráfico de ofertas por tipo
- Próximos vencimentos de empréstimos
- Evolução financeira (6 meses)

#### Dízimos
**Funcionalidades:**
- ✅ Listar todos os dízimos
- ✅ Buscar por membro
- ✅ Registrar novo dízimo
- ⏳ Filtrar por período
- ⏳ Upload opcional de comprovante

**Campos:**
- Membro (obrigatório - vinculado)
- Valor
- Data
- Forma de pagamento
- Observações
- Upload comprovante (opcional)

#### Ofertas
**Funcionalidades:**
- ⏳ Listar ofertas
- ⏳ Filtrar por tipo (Social, Geral, Obra, Missões)
- ⏳ Registrar nova oferta
- ⏳ Gráfico de ofertas por tipo

**Campos:**
- Tipo (SOMENTE 4: social, geral, obra, missões)
- Valor
- Data
- Observações
- Upload comprovante (opcional)

#### Livraria
**Funcionalidades:**
- ⏳ Listar vendas
- ⏳ Registrar nova venda
- ⏳ Vincular comprador (membro ou visitante)
- ⏳ Upload OBRIGATÓRIO de comprovante

**Campos:**
- Produto/livro
- Quantidade
- Valor total
- Forma de pagamento
- Comprador: membro OU visitante
- Upload comprovante (obrigatório)

#### Empréstimos Recebidos
**Funcionalidades:**
- ⏳ Listar empréstimos
- ⏳ Registrar novo empréstimo
- ⏳ Sistema gera automaticamente parcelas em Saídas
- ⏳ Acompanhar parcelas pagas/vencidas/futuras

**Campos:**
- Credor
- Valor total
- Número de parcelas
- Valor por parcela
- Data primeira parcela
- Upload comprovante (opcional)

**Lógica:**
Sistema gera automaticamente N saídas na categoria "parcela_emprestimo" com valores e datas calculadas.

#### Saídas / Despesas
**Funcionalidades:**
- ⏳ Listar todas as saídas
- ⏳ Filtrar por categoria
- ⏳ Registrar nova saída
- ⏳ Upload OBRIGATÓRIO de comprovante

**Categorias:**
- Água, Luz, Internet, Sistema de Alarme
- Zeladoria, Salário Pastor
- Oferta a Missionários, Ajuda Diaconal (gerado automaticamente)
- Manutenção, Insumos
- Parcelas de Empréstimos (gerado automaticamente)

**Campos:**
- Categoria
- Descrição
- Valor
- Data
- Upload comprovante (obrigatório)

#### Relatórios Financeiros
**Funcionalidades:**
- ⏳ Ofertas por tipo
- ⏳ Dízimos por membro (valores acumulados, média mensal, gráfico)
- ⏳ Saídas por categoria
- ⏳ Livraria por comprador
- ⏳ Empréstimos (parcelas pagas/vencidas/futuras)
- ⏳ Relatório anual consolidado
- ⏳ Exportação: PDF, Excel, CSV

---

### <a name="painel-diacono"></a>5.3 PAINEL DO DIÁCONO 🟢

**Acesso:** Somente usuários com role `deacon`

#### Dashboard
- Métricas principais:
  - Visitantes este mês
  - Ajudas concedidas (quantidade e valor)
  - Boletins publicados
  - Próximo culto
- Boletim dominical atual
- Visitantes recentes
- Ajudas diaconais recentes

#### Visitantes (CRUD Completo - Exclusivo do Diácono)
**Funcionalidades:**
- ✅ Listar todos os visitantes
- ✅ Buscar por nome ou telefone
- ✅ Cadastrar novo visitante
- ✅ Editar informações
- ✅ Excluir visitante
- ⏳ Upload OBRIGATÓRIO de termo LGPD

**Campos:**
- Nome completo
- Telefone, Email
- Endereço
- É de alguma igreja? (sim/não)
- Se sim, qual igreja?
- Quem convidou (membro)
- Primeira visita
- Observações
- Upload termo LGPD (obrigatório)

**Nota:** Pastor pode VISUALIZAR visitantes, mas NÃO pode editar.

#### Ajuda Diaconal
**Funcionalidades:**
- ⏳ Listar ajudas concedidas
- ⏳ Registrar nova ajuda (somente para MEMBROS)
- ⏳ Sistema gera automaticamente saída em despesas
- ⏳ Upload OBRIGATÓRIO de comprovante

**Tipos de Ajuda:**
- Cesta básica
- Remédio
- Aluguel
- Consulta
- Transporte
- Outros

**Campos:**
- Membro beneficiado (somente membros)
- Tipo de ajuda
- Valor
- Data
- Descrição
- Upload comprovante (obrigatório)

**Lógica:**
Sistema cria automaticamente saída em `expenses` com categoria "ajuda_diaconal".

#### Boletim Dominical (Complexo)
**Funcionalidades:**
- ⏳ Sistema abre boletim NOVO toda semana (sem copiar anterior)
- ⏳ Editar todos os blocos do boletim
- ⏳ Preview antes de publicar
- ⏳ Publicar boletim
- ⏳ Gerar PDF para impressão
- ⏳ Histórico de boletins publicados

**Blocos do Boletim:**

**A) Cabeçalho:**
- Nome da igreja: "Igreja Presbiteriana Emaús – IPE"
- Local e data: "São Paulo, 02 de novembro de 2025"
- Número da edição
- Ano litúrgico
- Banner/cabeçalho superior (imagem fixa)

**B) Devocional / Mensagem Pastoral:**
- Título
- Texto bíblico base
- Corpo da mensagem

**C) Liturgia Completa:**
Itens com título + texto + referência:
- Prelúdio
- Leitura Bíblica 1, 2, 3
- Hino 1, 2, Final
- Orações: louvor, contrição, gratidão, dedicação, final
- Cântico de consagração
- Mensagem bíblica
- Bênção apostólica
- Pós-lúdio
- Agradecimentos e avisos

Itens especiais (checkbox):
- Batismo infantil
- Ceia do Senhor
- Credo apostólico
- Participações musicais

**D) Relatório da EBD:**
Tabela mensal com colunas:
- Matriculados, Presentes, Ausentes, Visitantes, Bíblias, Total
- Suporta meses com 4 ou 5 domingos

**E) Avisos dos Departamentos:**
Departamentos padrão:
- SAF, UPH, UMP, UPA, CPE, CER
- Semana de oração, Congregação, Eventos gerais

Cada aviso: título, texto, data/hora evento (opcional)

**F) Transmissão ao vivo pelo YouTube** (bloco fixo)

**G) Oferta do dia:** Social, Geral, Obra ou Missões

**H) Regras de reverência no culto** (texto fixo com 5 itens)

**I) Projeto: Reforma do Edifício** (bloco fixo com versículo, objetivo, administração, forma de contribuição)

**J) Aniversariantes da semana:**
- Aniversários pessoais
- Aniversários de casamento
(Somente membros ativos, gerado automaticamente do cadastro)

**K) Pedidos de Oração:**
Categorias fixas:
- Conversão
- Direção divina
- IPE (famílias, evangelização, construção, enlutados)
- Emprego
- Saúde

Responsável pelo quadro: Presbítero ou Pastor (selecionável)

**L) Liderança:**
Gerado automaticamente da tabela `members`:
- Pastor
- Presbíteros (ativos e eméritos)
- Diáconos
- Seminarista
- Missionárias

Inclui telefone e email quando existir.

**M) Horários fixos da IPE:**
- EBD: 9h
- Culto solene: 18h
- Reunião de oração: terça 19h30
- Estudo bíblico: quinta 19h30

**N) Dados bancários + PIX:**
- Agência, Conta, Nome, CNPJ
- Chave PIX, QR Code

**O) Informações finais:**
- Texto fixo sobre envio de informações para o boletim
- Texto sobre QR Code com acesso à história da igreja

---

### <a name="portal-lgpd"></a>5.4 PORTAL LGPD 🟤

**Acesso:** Membros e visitantes (autogerenciado)

#### Fluxo de Acesso

**1️⃣ Verificação de Identidade:**
- Usuário informa: nome completo, data nascimento, email
- Sistema verifica com cadastro

**2️⃣ Envio de Código:**
- Se dados corretos: sistema envia código 6 dígitos por email
- Usuário insere código para acessar portal

**3️⃣ Portal LGPD (Completo):**

#### Visualizar Meus Dados
**Funcionalidades:**
- ✅ Ver todos os dados pessoais
- ⏳ Ver dados financeiros vinculados
- ⏳ Ver boletins em que aparece
- ⏳ Ver registros de ajuda diaconal
- ⏳ Ver histórico de presença como visitante
- ⏳ Ver consentimentos LGPD

#### Exportar Dados
**Formatos disponíveis:**
- ✅ PDF (documento formatado)
- ✅ Excel (planilha estruturada)
- ✅ JSON (formato técnico portável)

**Dados incluídos:**
- Dados pessoais completos
- Dados financeiros (dízimos, ofertas, livraria, ajuda recebida)
- Histórico de participação
- Boletins publicados
- Termos de consentimento
- Logs de acesso

#### Solicitar Correção
**Funcionalidades:**
- ⏳ Enviar ticket ao Pastor
- ⏳ Descrever correção necessária
- ⏳ Pastor analisa e aplica
- ⏳ Usuário recebe notificação

#### Solicitar Exclusão
**Funcionalidades:**
- ⏳ Solicitar exclusão total ou parcial
- ⏳ Sistema registra protocolo
- ⏳ Pastor analisa solicitação
- ⏳ Exclusão física ou lógica (conforme LGPD)
- ⏳ Manter histórico de logs mesmo após exclusão

#### Gerenciar Consentimento
**Funcionalidades:**
- ⏳ Ver consentimentos ativos
- ⏳ Registrar novo consentimento
- ⏳ Revogar consentimento
- ⏳ Histórico mantido no sistema

---

## <a name="tecnologias"></a>6. TECNOLOGIAS UTILIZADAS

### Frontend
- **React 18.3+**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite 5**: Build tool ultra-rápido
- **Wouter**: Roteamento leve
- **TailwindCSS 3**: Utility-first CSS
- **Shadcn UI**: Componentes acessíveis
- **React Query**: Cache e estado do servidor
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Lucide React**: Ícones SVG
- **date-fns**: Manipulação de datas

### Backend
- **Node.js 20+**: Runtime JavaScript
- **Express 4**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **Neon**: PostgreSQL serverless
- **Drizzle ORM**: ORM TypeScript-first
- **Zod**: Validação de dados
- **Multer**: Upload de arquivos
- **Bcrypt**: Hash de senhas

### DevOps e Ferramentas
- **Replit**: Ambiente de desenvolvimento
- **Git**: Controle de versão
- **npm**: Gerenciador de pacotes

---

## <a name="implementadas"></a>7. FUNCIONALIDADES IMPLEMENTADAS ✅

### Design System Completo
- ✅ Paleta de cores IPE (Azul Petróleo #1E5F74 + Laranja #F39C12)
- ✅ Logo IPE integrado em todos os painéis
- ✅ Sidebar com navegação por painel
- ✅ Dark mode completo e funcional
- ✅ Theme toggle no header
- ✅ Componentes Shadcn UI customizados
- ✅ Tipografia Inter (font oficial)
- ✅ Sistema de cores responsivo

### Autenticação e Rotas
- ✅ Página de login com logo IPE
- ✅ Rotas separadas por painel (Pastor, Tesoureiro, Diácono, LGPD)
- ✅ Layout responsivo com sidebar
- ✅ Navegação isolada por perfil
- ⏳ Autenticação JWT (backend pendente)
- ⏳ Proteção de rotas por role

### Painel do Pastor
- ✅ Dashboard com métricas
- ✅ Página de membros com CRUD completo
- ✅ Página de seminaristas com CRUD completo
- ✅ Página de catecúmenos com CRUD completo + conversão automática para membro
- ✅ **Visitantes (Somente Leitura)** - Página completa com 331 linhas
  - Visualização de todos os visitantes cadastrados pelo diácono
  - Busca por nome, telefone, email
  - Filtro por igreja (tem/sem igreja)
  - Exibição do membro que convidou
  - Tabela com todas as informações (contatos, endereço, observações)
  - Alert informativo sobre permissão somente leitura
  - Aprovado pelo Architect após correções (null safety, loading states, data-testids)
- ✅ **Aniversariantes (Geração Automática)** - Página completa com 367 linhas
  - Detecção automática de aniversários da semana atual
  - Detecção automática de aniversários de casamento da semana
  - Cálculo correto de idade e anos de casamento
  - Suporte para virada de ano (dezembro/janeiro)
  - Tabs separadas para aniversários de nascimento e casamento
  - Exportação para CSV com formatação brasileira
  - Cards com contagem total por tipo
  - Aprovado pelo Architect após correções (virada de ano, loading, export)
- ⏳ Relatórios pastorais completos com exportação PDF/Excel/CSV

### Painel do Tesoureiro
- ✅ Dashboard financeiro com métricas
- ✅ Página de dízimos com tabela
- ✅ Modal de registro de dízimo (estrutura)
- ⏳ CRUD completo de dízimos
- ⏳ Upload de comprovantes
- ⏳ Páginas de ofertas, livraria
- ⏳ Empréstimos e geração de parcelas
- ⏳ Saídas/despesas
- ⏳ Dashboard com gráficos
- ⏳ Relatórios financeiros

### Painel do Diácono
- ✅ Dashboard diaconal
- ✅ Página de visitantes com CRUD
- ✅ Modal de cadastro de visitante (estrutura completa)
- ⏳ Upload de termo LGPD
- ⏳ Página de ajuda diaconal
- ⏳ Geração automática de saída
- ⏳ Boletim dominical completo
- ⏳ Editor de boletim com todos os blocos

### Portal LGPD
- ✅ Dashboard LGPD
- ✅ Página de exportação de dados
- ⏳ Verificação por código email
- ⏳ Exportação PDF/Excel/JSON
- ⏳ Solicitação de correção
- ⏳ Solicitação de exclusão
- ⏳ Gerenciamento de consentimento

### Schemas e Banco de Dados
- ✅ Todos os schemas definidos em shared/schema.ts
- ✅ Enums para status, roles, categorias
- ✅ Relações entre tabelas
- ✅ Validação Zod integrada
- ⏳ Migrações de banco de dados
- ⏳ Seeds iniciais

---

## <a name="pendentes"></a>8. FUNCIONALIDADES PENDENTES ⏳

### Backend - Alta Prioridade
- [ ] Configurar database PostgreSQL com Drizzle
- [ ] Criar todas as tabelas (npm run db:push)
- [ ] Implementar API REST completa
- [ ] Endpoints de autenticação (login, logout)
- [ ] Middleware de autenticação JWT
- [ ] Middleware de autorização por role
- [ ] Upload de arquivos (Multer)
- [ ] Validação de requests (Zod)
- [ ] Sistema de logs de auditoria
- [ ] Geração automática de parcelas de empréstimos
- [ ] Geração automática de saídas para ajuda diaconal
- [ ] Cálculo de aniversariantes da semana
- [ ] Sistema de emails (códigos LGPD)

### Frontend - Média Prioridade
- [ ] Conectar todas as páginas ao backend (React Query)
- [ ] Implementar CRUD completo de membros
- [ ] Implementar CRUD completo de seminaristas
- [ ] Implementar CRUD completo de catecúmenos
- [ ] Implementar CRUD completo de visitantes
- [ ] Implementar sistema de upload de arquivos
- [ ] Implementar formulários de transações financeiras
- [ ] Criar editor completo de boletim dominical
- [ ] Implementar sistema de aniversariantes
- [ ] Criar páginas de relatórios com gráficos
- [ ] Implementar exportação PDF/Excel/CSV
- [ ] Adicionar paginação em todas as tabelas
- [ ] Adicionar filtros avançados
- [ ] Estados de loading com skeletons
- [ ] Estados de erro com mensagens
- [ ] Toast notifications para feedback

### Funcionalidades Avançadas - Baixa Prioridade
- [ ] Sistema de notificações por email
- [ ] Notificação de aniversariantes
- [ ] Lembretes de vencimento de empréstimos
- [ ] Dashboard executivo consolidado
- [ ] Relatórios IPB oficiais
- [ ] Módulo "Emaús Vota" (votações/assembleias)
- [ ] Sistema de backup automático
- [ ] Versionamento de boletins
- [ ] Histórico de alterações
- [ ] Impressão otimizada de relatórios
- [ ] Integração com WhatsApp (notificações)

---

## 8.5 PÁGINAS DO PASTOR IMPLEMENTADAS EM DETALHES ✅

### 📄 Página de Visitantes (Somente Leitura)

**Arquivo:** `client/src/pages/pastor/visitors.tsx` (331 linhas)  
**Status:** ✅ Concluída e aprovada pelo Architect  
**Data:** Novembro 2024

#### Funcionalidades:
1. **Visualização Completa de Visitantes**
   - Tabela com todos os visitantes cadastrados pelo diácono
   - Exibição de: nome, contatos (telefone, email, endereço), igreja de origem, data da 1ª visita
   - Mostra nome do membro que convidou o visitante
   - Badge visual diferenciando quem tem/não tem igreja
   - Observações do visitante (se houver)

2. **Busca e Filtros**
   - Campo de busca por: nome, telefone, email
   - Filtro por status de igreja: todos | tem igreja | sem igreja
   - Contador de resultados encontrados

3. **Interface e UX**
   - Alert informativo no topo explicando permissão somente leitura
   - Mensagem instruindo acesso ao Painel do Diácono para edição
   - Ícones lucide-react para melhor visualização (User, Phone, Mail, MapPin, Church, Calendar)
   - Design responsivo com scroll horizontal para tabela em telas pequenas

4. **Detalhes Técnicos**
   - React Query para carregamento de visitantes e membros
   - Loading state enquanto dados são carregados
   - Null safety em campos opcionais (phone, email)
   - Data-testids completos para testes automatizados
   - Formatação de datas no padrão brasileiro (dd/MM/yyyy)

5. **Correções Architect**
   - ✅ Adicionado optional chaining em phone (`.phone?.toLowerCase()`)
   - ✅ Loading state aguarda ambas queries (visitors + members)
   - ✅ Data-testids em todas as células da tabela

#### Fluxo de Uso:
```
Pastor → Sidebar "Visitantes" → Visualiza lista completa
         → Busca por nome/telefone → Filtra por igreja
         → Vê quem convidou cada visitante → Identifica potenciais conversões
```

---

### 🎂 Página de Aniversariantes (Geração Automática)

**Arquivo:** `client/src/pages/pastor/birthdays.tsx` (367 linhas)  
**Status:** ✅ Concluída e aprovada pelo Architect  
**Data:** Novembro 2024

#### Funcionalidades:
1. **Detecção Automática de Aniversários**
   - Calcula automaticamente aniversários da semana atual (domingo a sábado)
   - Identifica aniversários de nascimento de membros ativos
   - Identifica aniversários de casamento de membros casados
   - Cálculo correto de idade (anos completos)
   - Cálculo correto de anos de casamento

2. **Suporte para Virada de Ano**
   - Algoritmo corrigido para semanas que cruzam dezembro/janeiro
   - Itera pelos 7 dias da semana comparando mês e dia
   - Não depende do ano completo para comparação

3. **Tabs Organizadas**
   - Tab "Aniversários de Nascimento": lista de aniversariantes com idade
   - Tab "Aniversários de Casamento": lista de bodas com anos de casamento
   - Cards com contagem total em cada tab
   - Indicação visual de qual tab está ativa

4. **Exibição de Dados**
   - Nome completo do membro
   - Dia da semana do aniversário (Domingo, Segunda, etc.)
   - Data formatada em português (ex: "25 de dezembro")
   - Idade ou anos de casamento
   - Badge com dia da semana
   - Ícones diferenciados (Cake para nascimento, Heart para casamento)

5. **Exportação para CSV**
   - Botão "Exportar CSV" em cada tab
   - Formato brasileiro (ponto-e-vírgula como separador)
   - Cabeçalhos em português
   - Encoding UTF-8 com BOM para compatibilidade Excel
   - Nome do arquivo com data atual (ex: `aniversarios_2024-11-21.csv`)

6. **Detalhes Técnicos**
   - React Query para carregamento de membros
   - useMemo para otimização de cálculos
   - Estados de loading com mensagens apropriadas
   - Mensagem quando não há aniversariantes na semana
   - Data-testids completos para testes

7. **Correções Architect**
   - ✅ Função `isDateInCurrentWeek` reescrita para virada de ano
   - ✅ Itera por cada dia da semana (0 a 6) comparando mês e dia
   - ✅ Loading states funcionando corretamente
   - ✅ Exportação CSV implementada e funcional

#### Algoritmo de Detecção:
```typescript
// Para cada membro ativo com birthDate:
1. Obtém semana atual (domingo a sábado)
2. Para cada dia da semana (i = 0 a 6):
   - Calcula data específica: startOfWeek + i dias
   - Compara mês e dia com birthDate do membro
   - Se coincidir, adiciona à lista
3. Ordena por data (mais próximo primeiro)
4. Calcula idade: currentYear - birthYear (ajusta se ainda não fez aniversário)
```

#### Fluxo de Uso:
```
Pastor → Sidebar "Aniversariantes"
         → Tab "Aniversários de Nascimento"
            → Vê lista da semana com idades
            → Exporta CSV para enviar ao boletim
         → Tab "Aniversários de Casamento"
            → Vê lista de bodas da semana
            → Exporta CSV se necessário
```

#### Casos de Uso:
- **Boletim Dominical**: Exportar lista para incluir no boletim
- **Planejamento Pastoral**: Identificar aniversariantes para contato/visita
- **Celebrações**: Preparar homenagens em cultos
- **Comunicação**: Enviar mensagens de parabéns personalizadas

---

## <a name="guia-uso"></a>9. GUIA DE USO POR PERFIL

### Para o Pastor

**Login:**
1. Acesse o sistema IPE
2. Digite seu usuário e senha
3. Sistema redireciona para Painel do Pastor

**Gerenciar Membros:**
1. Navegue para "Membros" na sidebar
2. Visualize a lista completa de membros
3. Use a busca para encontrar membros específicos
4. Clique em "Novo Membro" para cadastrar
5. Preencha todos os campos obrigatórios (*)
6. Faça upload do termo LGPD assinado
7. Adicione observações pastorais (privadas)
8. Salve o membro

**Gerenciar Catecúmenos:**
1. Navegue para "Catecúmenos"
2. Veja catecúmenos por etapa
3. Cadastre novos catecúmenos
4. Atualize etapas: em andamento → apto → concluído
5. Ao concluir: sistema cria membro automaticamente

**Visualizar Aniversariantes:**
1. Navegue para "Aniversariantes"
2. Sistema mostra automaticamente aniversariantes da semana
3. Envie lista para o boletim
4. Exporte relatório se necessário

**Gerar Relatórios:**
1. Navegue para "Relatórios"
2. Selecione tipo de relatório
3. Defina filtros e período
4. Exporte em PDF, Excel ou CSV

### Para o Tesoureiro

**Login:**
1. Acesse o sistema IPE
2. Digite seu usuário e senha
3. Sistema redireciona para Painel do Tesoureiro

**Registrar Dízimo:**
1. Navegue para "Dízimos"
2. Clique em "Registrar Dízimo"
3. Selecione o membro
4. Informe valor, data e forma de pagamento
5. Faça upload de comprovante (opcional)
6. Salve o registro

**Registrar Oferta:**
1. Navegue para "Ofertas"
2. Clique em "Registrar Oferta"
3. Selecione tipo (Social, Geral, Obra, Missões)
4. Informe valor e data
5. Faça upload de comprovante (opcional)
6. Salve o registro

**Registrar Empréstimo:**
1. Navegue para "Empréstimos"
2. Clique em "Registrar Empréstimo"
3. Informe credor, valor total, número de parcelas
4. Sistema calcula valor por parcela
5. Defina data da primeira parcela
6. Salve: sistema gera automaticamente todas as parcelas em Saídas

**Registrar Saída:**
1. Navegue para "Saídas"
2. Clique em "Registrar Saída"
3. Selecione categoria
4. Informe descrição, valor e data
5. Faça upload de comprovante (OBRIGATÓRIO)
6. Salve o registro

**Visualizar Dashboard:**
1. Dashboard atualiza automaticamente
2. Veja saldo atual, entradas, saídas
3. Analise gráfico de ofertas por tipo
4. Acompanhe vencimentos de empréstimos

### Para o Diácono

**Login:**
1. Acesse o sistema IPE
2. Digite seu usuário e senha
3. Sistema redireciona para Painel do Diácono

**Cadastrar Visitante:**
1. Navegue para "Visitantes"
2. Clique em "Novo Visitante"
3. Preencha nome, telefone, email
4. Informe se é de alguma igreja
5. Selecione membro que convidou
6. Defina data da primeira visita
7. Faça upload do termo LGPD (OBRIGATÓRIO)
8. Salve o visitante

**Registrar Ajuda Diaconal:**
1. Navegue para "Ajuda Diaconal"
2. Clique em "Registrar Ajuda"
3. Selecione membro beneficiado (somente membros)
4. Escolha tipo de ajuda
5. Informe valor, data e descrição
6. Faça upload de comprovante (OBRIGATÓRIO)
7. Salve: sistema cria saída automaticamente

**Criar Boletim Dominical:**
1. Navegue para "Boletim Dominical"
2. Clique em "Novo Boletim"
3. Sistema abre boletim em branco
4. Preencha cabeçalho (data, edição)
5. Adicione devocional/mensagem pastoral
6. Preencha liturgia completa
7. Adicione relatório da EBD
8. Inclua avisos dos departamentos
9. Defina oferta do dia
10. Adicione pedidos de oração
11. Sistema preenche automaticamente:
    - Aniversariantes da semana
    - Liderança
    - Blocos fixos
12. Preview do boletim
13. Publique quando pronto
14. Gere PDF para impressão

### Para Membros/Visitantes (Portal LGPD)

**Acessar Portal:**
1. Na tela de login, clique em "Acessar Portal LGPD"
2. Informe: nome completo, data nascimento, email
3. Sistema envia código por email
4. Digite código de 6 dígitos
5. Acesso liberado ao portal

**Visualizar Meus Dados:**
1. No portal, clique em "Meus Dados"
2. Veja todas as informações armazenadas
3. Revise dados pessoais, financeiros, histórico

**Exportar Dados:**
1. Clique em "Exportar Dados"
2. Escolha formato (PDF, Excel ou JSON)
3. Clique no botão de download
4. Arquivo gerado com todos os seus dados

**Solicitar Correção:**
1. Clique em "Solicitações"
2. Clique em "Nova Solicitação de Correção"
3. Descreva o que precisa ser corrigido
4. Envie solicitação
5. Pastor receberá e analisará
6. Você será notificado da decisão

**Solicitar Exclusão:**
1. Clique em "Solicitações"
2. Clique em "Solicitar Exclusão de Dados"
3. Leia aviso sobre consequências
4. Confirme solicitação
5. Sistema registra protocolo
6. Pastor analisará e entrará em contato

---

## <a name="compliance"></a>10. COMPLIANCE LGPD

### Princípios Implementados

**1. Transparência:**
- Usuário tem acesso completo a todos os seus dados
- Informações claras sobre uso e armazenamento
- Histórico de consentimentos

**2. Finalidade:**
- Dados coletados apenas para fins eclesiásticos
- Uso restrito ao contexto da IPE
- Não compartilhamento com terceiros

**3. Necessidade:**
- Coleta apenas de dados necessários
- Campos opcionais claramente marcados
- Minimização de dados sensíveis

**4. Livre Acesso:**
- Portal LGPD autogerenciado
- Exportação em múltiplos formatos
- Acesso facilitado por código email

**5. Qualidade dos Dados:**
- Solicitação de correção disponível
- Atualização periódica incentivada
- Validação de dados na entrada

**6. Segurança:**
- Senhas com hash bcrypt
- Dados sensíveis criptografados
- Logs de auditoria completos
- Controle de acesso por role

**7. Prevenção:**
- Backup automático
- Soft delete (recuperável)
- Versionamento de alterações

**8. Não Discriminação:**
- Solicitações LGPD não afetam participação
- Direitos garantidos a todos
- Processo transparente e justo

### Direitos dos Titulares

**Confirmação:**
- ✅ Titular pode confirmar existência de tratamento

**Acesso:**
- ✅ Titular pode acessar todos os seus dados

**Correção:**
- ✅ Titular pode solicitar correção de dados

**Anonimização/Bloqueio:**
- ⏳ Titular pode solicitar anonimização

**Eliminação:**
- ✅ Titular pode solicitar exclusão

**Portabilidade:**
- ✅ Exportação em formatos portáveis (PDF, Excel, JSON)

**Revogação:**
- ⏳ Titular pode revogar consentimento

**Informação:**
- ✅ Informação sobre consequências da revogação

### Documentação LGPD

**Termos de Consentimento:**
- Upload obrigatório para membros
- Upload obrigatório para visitantes
- Armazenamento seguro de documentos
- Histórico de consentimentos

**Logs de Auditoria:**
- Registro de todas as ações
- Quem acessou o quê e quando
- IP do acesso
- Antes/depois de alterações

**Solicitações:**
- Protocolo para cada solicitação
- Status: pendente, aprovado, rejeitado
- Notas do responsável
- Histórico de resolução

---

## <a name="proximos-passos"></a>11. PRÓXIMOS PASSOS

### Imediato (Task 2 - Backend)

1. **Configurar Database PostgreSQL**
   - Executar npm run db:push
   - Criar todas as tabelas
   - Verificar constraints e índices

2. **Implementar API REST**
   - Autenticação (login, logout, refresh token)
   - Endpoints de membros (CRUD)
   - Endpoints de seminaristas (CRUD)
   - Endpoints de catecúmenos (CRUD)
   - Endpoints de visitantes (CRUD)
   - Endpoints financeiros (dízimos, ofertas, livraria, empréstimos, saídas)
   - Endpoints de ajuda diaconal
   - Endpoints de boletim
   - Endpoints LGPD (view, export, requests)

3. **Middleware e Segurança**
   - JWT authentication
   - Role-based authorization
   - Validação de requests (Zod)
   - Upload de arquivos (Multer)
   - Rate limiting
   - CORS configurado

4. **Lógica de Negócio**
   - Geração automática de parcelas de empréstimos
   - Geração automática de saídas para ajuda diaconal
   - Cálculo de aniversariantes da semana
   - Sistema de emails para códigos LGPD
   - Logs de auditoria automáticos

### Curto Prazo (Task 3 - Integration)

1. **Conectar Frontend ao Backend**
   - React Query em todas as páginas
   - Cache invalidation adequada
   - Loading states com skeletons
   - Error handling com toasts
   - Optimistic updates

2. **Completar CRUD**
   - Formulários completos de membros
   - Formulários completos de seminaristas
   - Formulários completos de catecúmenos
   - Formulários completos de visitantes
   - Formulários de transações financeiras

3. **Upload de Arquivos**
   - Upload de termos LGPD
   - Upload de comprovantes financeiros
   - Preview de arquivos
   - Validação de tipo e tamanho

4. **Editor de Boletim**
   - Formulário completo com todos os blocos
   - Preview em tempo real
   - Geração de PDF
   - Histórico de boletins

5. **Relatórios**
   - Gráficos com Recharts
   - Exportação PDF (react-pdf)
   - Exportação Excel
   - Exportação CSV
   - Filtros avançados

6. **Testes End-to-End**
   - Fluxo de login
   - CRUD de membros
   - Registro de transações financeiras
   - Criação de boletim
   - Portal LGPD completo

### Médio Prazo (Melhorias)

1. **Notificações**
   - Sistema de emails
   - Notificações de aniversariantes
   - Lembretes de vencimentos
   - Aprovações de solicitações LGPD

2. **Dashboard Avançado**
   - Gráficos interativos
   - Métricas em tempo real
   - Comparativos mensais/anuais
   - Projeções financeiras

3. **Relatórios IPB**
   - Formulários oficiais IPB
   - Estatísticas anuais
   - Relatórios de assembleia
   - Exportação formatada

4. **Melhorias UX**
   - Atalhos de teclado
   - Busca global
   - Favoritos/recentes
   - Tour guiado para novos usuários

### Longo Prazo (Funcionalidades Futuras)

1. **Emaús Vota**
   - Módulo de votações digitais
   - Assembleias online
   - Controle de quórum
   - Votação secreta
   - Atas automáticas

2. **Integração WhatsApp**
   - Envio de lembretes
   - Notificações de eventos
   - Confirmação de presença
   - Grupos por departamento

3. **Mobile App**
   - Versão nativa (React Native)
   - Notificações push
   - Acesso offline
   - Sincronização automática

4. **Analytics**
   - Dashboard de crescimento
   - Métricas de engajamento
   - Análise de frequência
   - Relatórios preditivos

---

## CONCLUSÃO

O Sistema Integrado IPE está sendo desenvolvido com foco em:
- **Usabilidade**: Interface intuitiva e acessível
- **Segurança**: Controle de acesso rigoroso e logs completos
- **Compliance**: Total adequação à LGPD
- **Separação de Responsabilidades**: Cada painel vê apenas suas funções
- **Rastreabilidade**: Auditoria completa de todas as ações

**Status Atual:** Frontend completo com design system IPE implementado. Próximos passos: backend completo e integração.

**Desenvolvido para:** Igreja Presbiteriana Emaús  
**Tecnologia:** React + Node.js + PostgreSQL  
**Documentação:** Versão 1.0 - Novembro 2024

---

## SUPORTE E CONTATO

Para dúvidas, sugestões ou suporte técnico, entre em contato com a equipe de desenvolvimento do Sistema IPE.

**Email:** ipbemaus@gmail.com  
**Sistema:** https://sistema-ipe.replit.app (após publicação)

---

*Este documento foi gerado automaticamente durante o desenvolvimento do Sistema IPE.*
