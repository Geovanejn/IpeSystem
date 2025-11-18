# Design Guidelines - Sistema Integrado IPE

## Design Approach: Administrative Design System

**Selected Framework:** Material Design for Web Applications adapted for ecclesiastical management
**Rationale:** Utility-focused productivity tool requiring clear information hierarchy, multi-panel navigation, and enterprise-grade data management with accessibility for varied user technical literacy.

---

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements, navigation)
- Secondary: System UI (body text, data tables, forms)

**Type Scale:**
- Page Titles: text-3xl font-bold (36px)
- Section Headers: text-xl font-semibold (24px)
- Card Titles: text-lg font-medium (20px)
- Body Text: text-base (16px)
- Helper Text: text-sm (14px)
- Table Data: text-sm (14px)

---

## Layout & Spacing System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16
- Component padding: p-6
- Section spacing: py-8, py-12
- Card spacing: p-6
- Form field gaps: gap-4, gap-6
- Page margins: px-8

**Grid System:**
- Dashboard metrics: 3-column grid (grid-cols-3)
- Forms: 2-column layout (grid-cols-2) for desktop, single column mobile
- Data tables: Full width with horizontal scroll
- Cards: Responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

---

## Application Structure

**Master Layout:**
```
[Fixed Sidebar - 280px] [Main Content Area - flex-1]
```

**Sidebar Components:**
- IPE Logo (top, 200px width, centered)
- Navigation menu (vertical list)
- Role indicator badge
- User profile section (bottom)
- Logout button

**Main Content Structure:**
- Page header with breadcrumb
- Action bar (search, filters, primary CTA)
- Content area (tables, cards, forms)
- Pagination/load more

---

## Core Components

### Navigation
- **Sidebar Navigation:** Fixed left sidebar, 280px width, vertical menu items with icons (Heroicons)
- **Active State:** Filled background, medium weight text
- **Menu Items:** py-3 px-4, rounded corners (rounded-lg), icon + text layout
- **Role Badge:** Prominent display showing current panel (Pastor/Tesoureiro/Diácono/LGPD)

### Data Tables
- **Header:** Sticky, font-semibold, text-sm uppercase tracking-wide
- **Rows:** Alternating subtle background, hover state, py-4 px-6
- **Actions Column:** Right-aligned icon buttons
- **Pagination:** Bottom center, showing "X-Y of Z results"
- **Row Height:** py-4 for comfortable scanning

### Forms
- **Layout:** Two-column grid on desktop (grid-cols-2 gap-6), single column mobile
- **Labels:** text-sm font-medium, mb-2
- **Inputs:** Full width, p-3, rounded-lg border, focus ring
- **Required Fields:** Asterisk marker in label
- **Help Text:** text-sm below input
- **Submit Section:** Full width, pt-8, right-aligned button group

### Cards
- **Container:** Rounded-xl, shadow-sm, p-6
- **Header:** Flex justify-between, mb-4
- **Content:** Organized sections with mb-6 spacing
- **Actions:** Footer section with button group

### Buttons
- **Primary:** px-6 py-3, rounded-lg, font-medium
- **Secondary:** Border style, same padding
- **Icon Buttons:** p-2, rounded-lg, icon only
- **Button Groups:** gap-3, flex layout

### Status Badges
- **Pill Shape:** px-3 py-1, rounded-full, text-xs font-medium
- **States:** Ativo, Inativo, Em Disciplina, Apto, Concluído
- **Position:** Inline with relevant data

### Dashboard Metrics
- **Stat Cards:** Grid layout, each card showing number + label + trend
- **Card Structure:** p-6, icon top-left, large number (text-3xl), label below
- **Grouping:** 3-column grid (grid-cols-3 gap-6)

### Modal Dialogs
- **Overlay:** Semi-transparent backdrop
- **Container:** max-w-2xl, rounded-xl, p-8
- **Header:** text-xl font-semibold, mb-6
- **Footer:** Button group right-aligned, pt-6 border-t

### Upload Components
- **Drag & Drop Zone:** Border-2 dashed, p-8, rounded-lg, center-aligned
- **File Preview:** Thumbnail + filename + remove button
- **Required Indicator:** Clear visual marker for mandatory uploads

---

## Panel-Specific Layouts

### Painel do Pastor
- **Dashboard:** Metric cards for Membros, Seminaristas, Catecúmenos, Visitantes
- **Member Management:** Comprehensive form with collapsible sections (Identificação, Contatos, Situação Espiritual, etc.)
- **Tables:** Sortable columns for all listings

### Painel do Tesoureiro
- **Financial Dashboard:** Charts (bar/line), total entries/exits, period selector
- **Transaction Forms:** Category dropdowns, amount inputs, date pickers, file upload
- **Reports Section:** Date range filters, export buttons (PDF/Excel/CSV)

### Painel do Diácono
- **Visitor Management:** Add visitor form, visit history timeline
- **Boletim Builder:** Drag-drop section ordering, preview pane
- **Patrimônio:** Inventory table with filters, add asset modal

### Portal LGPD
- **User Profile View:** Read-only data display with edit button
- **Edit Mode:** Inline editing with save/cancel actions
- **Data Export:** Download button for personal data package
- **Delete Account:** Confirmation modal with warning

---

## Responsive Behavior

- **Desktop (lg:):** Full sidebar, multi-column layouts
- **Tablet (md:):** Collapsible sidebar, 2-column forms
- **Mobile (base):** Hidden sidebar with hamburger menu, single column, stacked navigation

---

## Accessibility

- All form inputs with proper labels and ARIA attributes
- Focus indicators on all interactive elements (ring-2 ring-offset-2)
- Keyboard navigation support throughout
- Screen reader announcements for dynamic content
- Minimum touch target 44px for mobile
- Sufficient contrast ratios for all text

---

## Icons

**Library:** Heroicons (outline for navigation, solid for actions)
**Common Icons:**
- User management: UserIcon, UserGroupIcon
- Financial: CurrencyDollarIcon, DocumentTextIcon
- Actions: PencilIcon, TrashIcon, EyeIcon, DownloadIcon
- Navigation: ChevronRightIcon, HomeIcon, ChartBarIcon