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