# Sistema Integrado IPE - Igreja Presbiteriana Emaús

## Overview
The Sistema Integrado IPE is a comprehensive church management system designed for Igreja Presbiteriana Emaús (IPE). It provides robust, role-based management panels for pastoral, financial, diaconal, and LGPD (General Data Protection Law) compliance. Built with a modern tech stack including React, TypeScript, Express, and PostgreSQL, the system aims to streamline church operations, enhance member engagement, and ensure data privacy compliance. All core modules are fully implemented, authenticated, and tested, making it ready for production.

## User Preferences
**Communication Style**: Simple, everyday Portuguese
**Design Theme**: IPE branding colors (Orange #F39C12, Petrol Blue #1E5F74)
**Development Approach**: Clean code, proper separation of concerns, full CRUD operations

## System Architecture
The system is built with a clear separation of concerns, employing a modern full-stack architecture.

### UI/UX Decisions
The user interface prioritizes the IPE brand identity with a specific color scheme (Orange #F39C12, Petrol Blue #1E5F74). It utilizes Tailwind CSS and shadcn/ui for consistent and accessible components, built on Radix UI primitives. Dark mode support is integrated throughout the application.

### Technical Implementations
- **Role-Based Panels**: Four independent panels for Pastor, Treasurer, Deacon, and LGPD, each with specific functionalities.
- **Authentication**: Session-based authentication using Bcrypt for password hashing and role-based access control. In-memory session storage is used for development, with a recommendation for PostgreSQL persistence in production.
- **Data Management**: Extensive CRUD operations across all modules, supported by robust validation and audit logging for all data changes.
- **Reporting**: Integrated reporting features with statistics, charts, and export capabilities (CSV, PDF, Excel).
- **LGPD Portal**: A self-service portal allowing members to export data, request corrections, manage consents, and submit deletion requests.

### Feature Specifications
- **Pastor Panel**: Members, Seminarians, Catechumens, Visitors, Users Management, Pastoral Reports, Birthdays/Anniversaries.
  - **Conversão Automática de Catecúmenos**: Quando um catecúmeno é marcado como "concluído", o sistema automaticamente cria um novo membro com status "comungante" e dados básicos, incluindo notas pastorais indicando que precisa completar as informações pessoais.
- **Treasurer Panel**: Tithes, Offerings, Bookstore Sales, Loans, Expenses Management, Financial Reports.
- **Deacon Panel**: Visitors Management, Diaconal Help, Bulletin Creation.
- **LGPD Portal**: Data Export, Data Correction Requests, Consents Management, Deletion Requests.

### System Design Choices
- **Frontend**: React 18 + TypeScript, Vite, Wouter for routing, React Query for server state, React Hook Form + Zod for form validation.
- **Backend**: Express.js + TypeScript, PostgreSQL, Drizzle ORM for type-safe database operations.
- **Database**: PostgreSQL with a normalized schema across 15+ tables, including audit logging and proper relationships.
- **Project Structure**: Organized into `client/`, `server/`, and `shared/` directories for maintainability and clear responsibility.

## External Dependencies
- **PostgreSQL**: Primary database for all application data, including user profiles, financial records, ministry data, and audit logs.
- **Drizzle ORM**: Used for type-safe interaction with the PostgreSQL database.
- **Bcryptjs**: Utilized for secure password hashing.
- **React Query**: Manages server-side state in the frontend.
- **React Hook Form + Zod**: Handles form validation and schema definition.
- **Tailwind CSS + shadcn/ui + Radix UI**: Frontend styling and UI component library.

## Test Data & Credentials

O sistema foi populado com dados realistas e completos para teste efetivo de todas as funcionalidades.

### Como Popular o Banco de Dados

**Dados completos (recomendado):**
```bash
npx tsx server/seed.ts
```

**Dados de teste rápido (apenas para validação):**
```bash
npx tsx server/seed-test.ts
```
Cria: 1 pastor, 4 membros, 3 catecúmenos para testar conversão automática.

### Credenciais de Acesso

| Role | Username | Password | Painel |
|------|----------|----------|--------|
| 🔵 Pastor | `pastor` | `senha123` | `/pastor` |
| 🟣 Tesoureiro | `tesoureiro` | `senha123` | `/treasurer` |
| 🟢 Diácono | `diacono` | `senha123` | `/deacon` |
| 🟠 Membro | `membro` | `senha123` | `/lgpd` |
| 🔴 Visitante | `visitante` | `senha123` | `/lgpd` |

### Dados Criados pelo Seed

**Módulo Pastoral (Painel do Pastor):**
- ✅ 10 membros (pastor, presbítero, diácono, membros regulares)
- ✅ 3 seminaristas (CPAJ, FTSA, Mackenzie)
- ✅ 3 catecúmenos em diferentes estágios
- ✅ 5 visitantes com diversos perfis
- ✅ 2 boletins completos

**Módulo Financeiro (Painel do Tesoureiro):**
- ✅ 47 dízimos (3 meses de histórico)
- ✅ 24 ofertas (geral, missões, obra, social)
- ✅ 5 vendas da livraria
- ✅ 2 empréstimos ativos
- ✅ 27 despesas (contas, salários, parcelas)

**Módulo Diaconal (Painel do Diácono):**
- ✅ 5 ajudas diaconais (cestas, remédios, aluguel)
- ✅ 5 visitantes para gestão

**Portal LGPD:**
- ✅ 15 consentimentos LGPD
- ✅ 4 solicitações LGPD (pendentes e resolvidas)
- ✅ Dados completos para exportação

**Sistema:**
- ✅ 5 usuários (todos os roles)
- ✅ 6 logs de auditoria
- ✅ Relacionamentos completos entre entidades

### Cenários de Teste

**Como Pastor (`pastor` / `senha123`):**
- Visualize e gerencie todos os 10 membros
- Consulte seminaristas e catecúmenos
- Acesse visitantes (read-only)
- Visualize relatórios e estatísticas

**Como Tesoureiro (`tesoureiro` / `senha123`):**
- Consulte 47 dízimos registrados
- Visualize ofertas e vendas da livraria
- Gerencie empréstimos e despesas
- Gere relatórios financeiros

**Como Diácono (`diacono` / `senha123`):**
- Gerencie 5 visitantes
- Registre ajudas diaconais
- Crie e publique boletins

**Como Membro (`membro` / `senha123`):**
- Acesse Portal LGPD
- Visualize seus dados pessoais
- Exporte dados em PDF
- Solicite correções

**Como Visitante (`visitante` / `senha123`):**
- Acesse Portal LGPD
- Consulte seus dados
- Gerencie consentimentos

## Recent Changes

### 21/11/2025 - Correções LSP e Validação de Conversão de Catecúmenos
- ✅ Corrigidos 20 erros LSP no `server/routes.ts` relacionados a campos renomeados no schema
- ✅ Atualizado mapeamento de campos em offerings, bookstore sales, visitors e LGPD consents
- ✅ Testada e validada funcionalidade de conversão automática de catecúmeno para membro
- ✅ Criado `server/seed-test.ts` para testes rápidos de conversão
- ✅ Verificação end-to-end confirmou que marcar catecúmeno como "concluído" cria membro automaticamente com dados placeholder e notas pastorais