# Sistema Integrado IPE - Igreja Presbiteriana Emaús

## Overview

This is a comprehensive church management system for Igreja Presbiteriana Emaús (IPE). The system provides four completely independent panels with role-based access control:

1. **Pastor Panel** - Manages members, seminarians, catechumens, visitors, system users, and pastoral reports
2. **Treasurer Panel** - Handles financial operations including tithes, offerings, bookstore sales, loans, and expenses
3. **Deacon Panel** - Manages visitors, diaconal help, and weekly bulletin creation
4. **LGPD Portal** - Self-service portal for members and visitors to view, export, correct, or request deletion of their personal data

The application is a full-stack TypeScript application using React on the frontend and Express on the backend, with PostgreSQL as the database managed through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**Routing**: Wouter (lightweight client-side routing)

**State Management**: 
- TanStack Query (React Query) for server state management
- React Hook Form with Zod for form state and validation

**UI Components**: 
- Radix UI primitives for accessible component foundations
- shadcn/ui component library (customized with IPE branding)
- Tailwind CSS for styling with custom design tokens

**Design System**:
- Primary colors: IPE Orange (#F39C12) and IPE Petrol Blue (#1E5F74)
- Custom CSS variables for theming (light/dark mode support)
- Consistent spacing, typography, and component patterns defined in design_guidelines.md

**Component Structure**:
- `AppLayout` - Main layout wrapper with sidebar and theme toggle
- `AppSidebar` - Role-based navigation sidebar
- Page components organized by role (`/pastor/*`, `/treasurer/*`, `/deacon/*`, `/lgpd/*`)
- Reusable UI components in `/components/ui/`

### Backend Architecture

**Framework**: Express.js with TypeScript

**Authentication & Authorization**:
- Session-based authentication using in-memory session storage
- Bcrypt for password hashing (10 rounds)
- Role-based access control (pastor, treasurer, deacon, member, visitor)
- Session management functions in `server/auth.ts`

**API Design**:
- RESTful endpoints organized in `server/routes.ts`
- CRUD operations for all entity types
- Validation using Zod schemas from shared schema definitions
- Audit logging for all data modifications

**Business Logic Layer**:
- Storage abstraction in `server/storage.ts` provides interface for all data operations
- Separation of concerns: auth logic, route handlers, and data access are cleanly separated

### Data Storage

**Database**: PostgreSQL (provisioned via Replit's database service)

**ORM**: Drizzle ORM for type-safe database operations

**Schema Design** (defined in `shared/schema.ts`):

Key tables:
- `users` - System user accounts with role-based access
- `members` - Church members with full personal and ecclesiastical data
- `seminarians` - Seminarians with education and assignment tracking
- `catechumens` - Catechumens with learning progress tracking
- `visitors` - Visitor records with contact history
- `tithes` - Tithe records linked to members
- `offerings` - Offering records by type (social, general, missions, etc.)
- `bookstore_sales` - Bookstore transaction records
- `loans` - Loan tracking with payment schedules
- `expenses` - Church expense records by category
- `diaconal_help` - Diaconal assistance records
- `bulletins` - Weekly bulletin content
- `lgpd_consents` - LGPD consent tracking
- `lgpd_requests` - LGPD data subject requests
- `audit_logs` - Complete audit trail for all data changes

**Data Relationships**:
- Users can be linked to either members or visitors
- Members can have associated tithes, offerings, and audit logs
- Comprehensive foreign key relationships with cascade deletion where appropriate

**Migration Strategy**:
- Drizzle Kit for schema migrations
- Schema defined in TypeScript for type safety
- Push-based deployment (`npm run db:push`)

### Authentication & Authorization

**Authentication Flow**:
1. User submits credentials via login form
2. Backend validates credentials using bcrypt comparison
3. Session created and stored in-memory with unique session ID
4. Session ID returned to client and stored in localStorage
5. Subsequent requests include session ID for authentication

**Authorization**:
- Role-based access control enforced at route level
- Each panel accessible only to authorized roles
- User roles: pastor, treasurer, deacon, member, visitor
- Role determines which sidebar menu items and pages are accessible

**Security Measures**:
- Passwords never stored in plain text (bcrypt hashing)
- Session validation on protected routes
- Credential validation before session creation
- Audit logging of all user actions

### External Dependencies

**Third-Party Services**: None currently integrated (all functionality is self-contained)

**NPM Packages**:

Frontend:
- `react`, `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `wouter` - Client-side routing
- `@radix-ui/*` - Accessible UI primitives (15+ component packages)
- `tailwindcss` - Utility-first CSS framework
- `clsx`, `tailwind-merge` - Conditional styling utilities
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library
- `date-fns` - Date manipulation

Backend:
- `express` - Web framework
- `bcryptjs` - Password hashing
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - PostgreSQL driver for Neon/serverless environments
- `connect-pg-simple` - PostgreSQL session store (declared but not currently used)

Development:
- `vite` - Build tool and dev server
- `typescript` - Type system
- `tsx` - TypeScript execution
- `drizzle-kit` - Database migration tool
- `@vitejs/plugin-react` - React support for Vite

**Database**: 
- PostgreSQL provisioned through Replit's database service
- Connection string stored in `DATABASE_URL` environment variable
- Additional PostgreSQL connection variables auto-configured by Replit

**Build & Deployment**:
- Development: `npm run dev` starts Vite dev server with HMR
- Production: `npm run build` creates optimized bundles
- Database: `npm run db:push` applies schema changes

**Current Implementation Status**:

**Pastor Panel:**
- ✅ Authentication and session management
- ✅ User management (CRUD for system users with audit logging)
- ✅ Member management (CRUD complete with LGPD consent)
- ✅ Seminarian management (CRUD complete with education tracking)
- ✅ Catechumen management (CRUD complete with automatic member creation upon conclusion)
- ✅ Visitor tracking (read-only view for pastor)
- ✅ Pastoral reports (comprehensive statistics, charts, CSV export)
- ✅ Birthday/Anniversary tracking (automated weekly lists)

**Treasurer Panel:**
- ✅ Tithes management (CRUD complete with member linking, payment methods, monthly totals)
- ✅ Offerings management (CRUD complete with type categorization, statistics by type)
- ✅ Bookstore sales (CRUD complete with product tracking, revenue statistics)
- 🚧 Loans management (UI complete, pending automatic installment expense generation)
- 🚧 Expenses management (basic CRUD, needs update/edit functionality)
- 🚧 Financial reports (pending implementation with charts and PDF export)

**Deacon Panel:**
- ✅ Visitor CRUD (complete management with contact history)
- 🚧 Diaconal help (UI exists, pending automatic expense generation)
- 🚧 Bulletin creation (basic structure, needs full editor with sections)

**LGPD Portal:**
- 🚧 Data export (UI exists, needs real PDF/Excel/JSON generation)
- 🚧 Requests management (UI exists, needs backend processing)
- 🚧 Consents management (UI exists, needs persistence layer)

**Infrastructure:**
- ✅ All database schemas defined
- ✅ Complete UI component library (shadcn/ui)
- ✅ Role-based routing and layouts
- ✅ Complete backend API structure
- ✅ In-memory storage implementation