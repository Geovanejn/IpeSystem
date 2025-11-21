import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, date, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const roleEnum = pgEnum("role", ["pastor", "treasurer", "deacon", "member", "visitor"]);
export const genderEnum = pgEnum("gender", ["masculino", "feminino"]);
export const maritalStatusEnum = pgEnum("marital_status", ["solteiro", "casado", "viuvo", "divorciado"]);
export const ecclesiasticalRoleEnum = pgEnum("ecclesiastical_role", ["membro", "presbitero", "diacono", "pastor", "seminarista"]);
export const memberStatusEnum = pgEnum("member_status", ["ativo", "inativo", "transferido", "em_disciplina"]);
export const communionStatusEnum = pgEnum("communion_status", ["comungante", "nao_comungante"]);
export const catechumenStageEnum = pgEnum("catechumen_stage", ["em_andamento", "apto", "concluido"]);
export const seminarianStatusEnum = pgEnum("seminarian_status", ["ativo", "em_estagio", "concluido"]);
export const offeringTypeEnum = pgEnum("offering_type", ["social", "geral", "obra", "missoes"]);
export const paymentMethodEnum = pgEnum("payment_method", ["dinheiro", "pix", "transferencia", "cartao", "cheque"]);
export const expenseCategoryEnum = pgEnum("expense_category", [
  "agua", "luz", "internet", "sistema_alarme", "zeladoria", "salario_pastor", 
  "oferta_missionarios", "ajuda_diaconal", "manutencao", "insumos", "parcela_emprestimo"
]);
export const diaconalHelpTypeEnum = pgEnum("diaconal_help_type", [
  "cesta_basica", "remedio", "aluguel", "consulta", "transporte", "outros"
]);
export const prayerCategoryEnum = pgEnum("prayer_category", [
  "conversao", "direcao_divina", "ipe", "emprego", "saude"
]);
export const lgpdActionEnum = pgEnum("lgpd_action", ["view", "export", "correction_request", "deletion_request"]);

// ============================================
// USERS (Authentication & Authorization)
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("member"),
  memberId: varchar("member_id").references(() => members.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id").references(() => visitors.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  roleIdx: index("users_role_idx").on(table.role),
  memberIdIdx: index("users_member_id_idx").on(table.memberId),
  visitorIdIdx: index("users_visitor_id_idx").on(table.visitorId),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// MEMBERS (Painel do Pastor - Central)
// ============================================

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identificação
  fullName: text("full_name").notNull(),
  gender: genderEnum("gender"),
  birthDate: date("birth_date").notNull(),
  maritalStatus: maritalStatusEnum("marital_status").notNull(),
  
  // Contatos
  primaryPhone: text("primary_phone").notNull(),
  secondaryPhone: text("secondary_phone"),
  email: text("email").notNull(),
  address: text("address").notNull(),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  neighborhood: text("neighborhood").notNull(),
  zipCode: text("zip_code").notNull(),
  
  // Situação Espiritual
  communionStatus: communionStatusEnum("communion_status").notNull().default("nao_comungante"),
  
  // Cargo Eclesiástico
  ecclesiasticalRole: ecclesiasticalRoleEnum("ecclesiastical_role").notNull().default("membro"),
  
  // Status Administrativo
  memberStatus: memberStatusEnum("member_status").notNull().default("ativo"),
  
  // Informações de Matrícula
  admissionDate: date("admission_date").notNull(),
  marriageDate: date("marriage_date"),
  
  // Observações Pastorais (privado - só pastor)
  pastoralNotes: text("pastoral_notes"),
  
  // LGPD
  lgpdConsentUrl: text("lgpd_consent_url").notNull(), // URL do documento de consentimento
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  fullNameIdx: index("members_full_name_idx").on(table.fullName),
  emailIdx: index("members_email_idx").on(table.email),
  statusIdx: index("members_status_idx").on(table.memberStatus),
  communionStatusIdx: index("members_communion_status_idx").on(table.communionStatus),
  ecclesiasticalRoleIdx: index("members_ecclesiastical_role_idx").on(table.ecclesiasticalRole),
}));

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Formato de email inválido"),
});

// Schema para atualizações parciais (PATCH) - permite omitir email
export const updateMemberSchema = insertMemberSchema.partial();

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
export type Member = typeof members.$inferSelect;

// ============================================
// SEMINARIANS (Painel do Pastor)
// ============================================

export const seminarians = pgTable("seminarians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  institution: text("institution").notNull(), // CPAJ, FTSA, etc.
  enrollmentYear: integer("enrollment_year").notNull(),
  status: seminarianStatusEnum("status").notNull().default("ativo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("seminarians_status_idx").on(table.status),
  institutionIdx: index("seminarians_institution_idx").on(table.institution),
}));

export const insertSeminarianSchema = createInsertSchema(seminarians).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Formato de email inválido"),
});

// Schema para atualizações parciais (PATCH) - permite omitir email
export const updateSeminarianSchema = insertSeminarianSchema.partial();

export type InsertSeminarian = z.infer<typeof insertSeminarianSchema>;
export type UpdateSeminarian = z.infer<typeof updateSeminarianSchema>;
export type Seminarian = typeof seminarians.$inferSelect;

// ============================================
// CATECHUMENS (Painel do Pastor)
// ============================================

export const catechumens = pgTable("catechumens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  startDate: date("start_date").notNull(),
  expectedProfessionDate: date("expected_profession_date"),
  stage: catechumenStageEnum("stage").notNull().default("em_andamento"),
  professorId: varchar("professor_id").references(() => members.id).notNull(), // Sempre o Pastor
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  professorIdIdx: index("catechumens_professor_id_idx").on(table.professorId),
  stageIdx: index("catechumens_stage_idx").on(table.stage),
}));

export const insertCatechumenSchema = createInsertSchema(catechumens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCatechumen = z.infer<typeof insertCatechumenSchema>;
export type Catechumen = typeof catechumens.$inferSelect;

// ============================================
// VISITORS (Painel do Diácono - CRUD, Painel do Pastor - Read Only)
// ============================================

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  hasChurch: boolean("has_church").notNull().default(false),
  churchOrigin: text("church_origin"),
  invitedByMemberId: varchar("invited_by_member_id").references(() => members.id),
  firstVisitDate: date("first_visit_date").notNull(),
  notes: text("notes"),
  lgpdConsentUrl: text("lgpd_consent_url").notNull(), // Obrigatório
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  invitedByMemberIdIdx: index("visitors_invited_by_member_id_idx").on(table.invitedByMemberId),
  firstVisitDateIdx: index("visitors_first_visit_date_idx").on(table.firstVisitDate),
}));

export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Email opcional, mas se fornecido, deve ser válido
  // Aceita: email válido, string vazia (→ null), null, ou undefined
  // Transform garante que string vazia seja convertida em null para o banco
  email: z.string().email("Formato de email inválido")
    .or(z.literal(""))
    .nullish()
    .transform((val) => val === "" || val === undefined ? null : val),
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

// ============================================
// FINANCIAL - TITHES (Painel do Tesoureiro)
// ============================================

export const tithes = pgTable("tithes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  notes: text("notes"),
  receiptUrl: text("receipt_url"), // Opcional
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  memberIdIdx: index("tithes_member_id_idx").on(table.memberId),
  dateIdx: index("tithes_date_idx").on(table.date),
}));

export const insertTitheSchema = createInsertSchema(tithes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTithe = z.infer<typeof insertTitheSchema>;
export type Tithe = typeof tithes.$inferSelect;

// ============================================
// FINANCIAL - OFFERINGS (Painel do Tesoureiro)
// ============================================

export const offerings = pgTable("offerings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: offeringTypeEnum("type").notNull(), // social, geral, obra, missoes
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  receiptUrl: text("receipt_url"), // Opcional
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("offerings_date_idx").on(table.date),
  typeIdx: index("offerings_type_idx").on(table.type),
}));

export const insertOfferingSchema = createInsertSchema(offerings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOffering = z.infer<typeof insertOfferingSchema>;
export type Offering = typeof offerings.$inferSelect;

// ============================================
// FINANCIAL - BOOKSTORE SALES (Painel do Tesoureiro)
// ============================================

export const bookstoreSales = pgTable("bookstore_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  buyerMemberId: varchar("buyer_member_id").references(() => members.id),
  buyerVisitorId: varchar("buyer_visitor_id").references(() => visitors.id),
  date: date("date").notNull(),
  receiptUrl: text("receipt_url").notNull(), // Obrigatório
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("bookstore_sales_date_idx").on(table.date),
  buyerMemberIdIdx: index("bookstore_sales_buyer_member_id_idx").on(table.buyerMemberId),
  buyerVisitorIdIdx: index("bookstore_sales_buyer_visitor_id_idx").on(table.buyerVisitorId),
}));

export const insertBookstoreSaleSchema = createInsertSchema(bookstoreSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookstoreSale = z.infer<typeof insertBookstoreSaleSchema>;
export type BookstoreSale = typeof bookstoreSales.$inferSelect;

// ============================================
// FINANCIAL - LOANS (Painel do Tesoureiro)
// ============================================

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditorName: text("creditor_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  installments: integer("installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  firstInstallmentDate: date("first_installment_date").notNull(),
  receiptUrl: text("receipt_url"), // Opcional
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

// ============================================
// FINANCIAL - EXPENSES (Painel do Tesoureiro)
// ============================================

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: expenseCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  receiptUrl: text("receipt_url").notNull(), // Obrigatório
  loanId: varchar("loan_id").references(() => loans.id), // Se for parcela de empréstimo
  installmentNumber: integer("installment_number"), // Número da parcela se aplicável
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("expenses_date_idx").on(table.date),
  categoryIdx: index("expenses_category_idx").on(table.category),
  loanIdIdx: index("expenses_loan_id_idx").on(table.loanId),
}));

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// ============================================
// DIACONAL HELP (Painel do Diácono)
// ============================================

export const diaconalHelp = pgTable("diaconal_help", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id).notNull(), // Somente membros
  type: diaconalHelpTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  receiptUrl: text("receipt_url").notNull(), // Obrigatório
  expenseId: varchar("expense_id").references(() => expenses.id), // Gerado automaticamente
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  memberIdIdx: index("diaconal_help_member_id_idx").on(table.memberId),
  dateIdx: index("diaconal_help_date_idx").on(table.date),
  typeIdx: index("diaconal_help_type_idx").on(table.type),
}));

export const insertDiaconalHelpSchema = createInsertSchema(diaconalHelp).omit({
  id: true,
  expenseId: true, // Gerado automaticamente
  createdAt: true,
  updatedAt: true,
});

export type InsertDiaconalHelp = z.infer<typeof insertDiaconalHelpSchema>;
export type DiaconalHelp = typeof diaconalHelp.$inferSelect;

// ============================================
// BULLETINS (Painel do Diácono)
// ============================================

export const bulletins = pgTable("bulletins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Cabeçalho
  editionNumber: integer("edition_number").notNull(),
  date: date("date").notNull(), // "São Paulo, 02 de novembro de 2025"
  liturgicalYear: text("liturgical_year"),
  
  // Devocional / Mensagem Pastoral
  devotionalTitle: text("devotional_title"),
  devotionalBibleText: text("devotional_bible_text"),
  devotionalMessage: text("devotional_message"),
  
  // Liturgia completa (JSON com todos os itens)
  liturgy: text("liturgy").notNull(), // JSON string
  
  // EBD (JSON com tabela mensal)
  ebdReport: text("ebd_report"), // JSON string
  
  // Avisos dos departamentos (JSON array)
  departmentNotices: text("department_notices"), // JSON string
  
  // Oferta do dia
  offeringType: offeringTypeEnum("offering_type"),
  
  // Aniversariantes da semana (IDs dos membros)
  birthdayMemberIds: text("birthday_member_ids"), // JSON array de IDs
  anniversaryMemberIds: text("anniversary_member_ids"), // JSON array de IDs
  
  // Pedidos de oração (JSON)
  prayerRequests: text("prayer_requests"), // JSON string
  prayerLeaderId: varchar("prayer_leader_id").references(() => members.id), // Presbítero ou Pastor
  
  // Liderança (JSON - gerado automaticamente da tabela members)
  leadershipData: text("leadership_data"), // JSON string
  
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("bulletins_date_idx").on(table.date),
  publishedIdx: index("bulletins_published_idx").on(table.published),
}));

export const insertBulletinSchema = createInsertSchema(bulletins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBulletin = z.infer<typeof insertBulletinSchema>;
export type Bulletin = typeof bulletins.$inferSelect;

// ============================================
// LGPD CONSENTS (Portal LGPD)
// ============================================

export const lgpdConsents = pgTable("lgpd_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id),
  visitorId: varchar("visitor_id").references(() => visitors.id),
  consentGiven: boolean("consent_given").notNull().default(true),
  consentDate: timestamp("consent_date").notNull().defaultNow(),
  revokedDate: timestamp("revoked_date"),
  documentUrl: text("document_url"), // URL do termo assinado
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  memberIdIdx: index("lgpd_consents_member_id_idx").on(table.memberId),
  visitorIdIdx: index("lgpd_consents_visitor_id_idx").on(table.visitorId),
}));

export const insertLgpdConsentSchema = createInsertSchema(lgpdConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLgpdConsent = z.infer<typeof insertLgpdConsentSchema>;
export type LgpdConsent = typeof lgpdConsents.$inferSelect;

// ============================================
// LGPD REQUESTS (Portal LGPD)
// ============================================

export const lgpdRequests = pgTable("lgpd_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id),
  visitorId: varchar("visitor_id").references(() => visitors.id),
  action: lgpdActionEnum("action").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"), // Notas do pastor
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  memberIdIdx: index("lgpd_requests_member_id_idx").on(table.memberId),
  visitorIdIdx: index("lgpd_requests_visitor_id_idx").on(table.visitorId),
  statusIdx: index("lgpd_requests_status_idx").on(table.status),
}));

export const insertLgpdRequestSchema = createInsertSchema(lgpdRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLgpdRequest = z.infer<typeof insertLgpdRequestSchema>;
export type LgpdRequest = typeof lgpdRequests.$inferSelect;

// ============================================
// AUDIT LOGS (Sistema)
// ============================================

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, VIEW, EXPORT, etc.
  tableName: text("table_name").notNull(),
  recordId: varchar("record_id"),
  changesBefore: text("changes_before"), // JSON
  changesAfter: text("changes_after"), // JSON
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  tableNameIdx: index("audit_logs_table_name_idx").on(table.tableName),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  actionIdx: index("audit_logs_action_idx").on(table.action),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one }) => ({
  member: one(members, {
    fields: [users.memberId],
    references: [members.id],
  }),
  visitor: one(visitors, {
    fields: [users.visitorId],
    references: [visitors.id],
  }),
}));

export const membersRelations = relations(members, ({ many }) => ({
  tithes: many(tithes),
  bookstoreSales: many(bookstoreSales),
  diaconalHelp: many(diaconalHelp),
  invitedVisitors: many(visitors),
}));

export const visitorsRelations = relations(visitors, ({ one, many }) => ({
  invitedBy: one(members, {
    fields: [visitors.invitedByMemberId],
    references: [members.id],
  }),
  bookstoreSales: many(bookstoreSales),
}));

export const tithesRelations = relations(tithes, ({ one }) => ({
  member: one(members, {
    fields: [tithes.memberId],
    references: [members.id],
  }),
}));

export const bookstoreSalesRelations = relations(bookstoreSales, ({ one }) => ({
  buyerMember: one(members, {
    fields: [bookstoreSales.buyerMemberId],
    references: [members.id],
  }),
  buyerVisitor: one(visitors, {
    fields: [bookstoreSales.buyerVisitorId],
    references: [visitors.id],
  }),
}));

export const loansRelations = relations(loans, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  loan: one(loans, {
    fields: [expenses.loanId],
    references: [loans.id],
  }),
}));

export const diaconalHelpRelations = relations(diaconalHelp, ({ one }) => ({
  member: one(members, {
    fields: [diaconalHelp.memberId],
    references: [members.id],
  }),
  expense: one(expenses, {
    fields: [diaconalHelp.expenseId],
    references: [expenses.id],
  }),
}));

export const catechumensRelations = relations(catechumens, ({ one }) => ({
  professor: one(members, {
    fields: [catechumens.professorId],
    references: [members.id],
  }),
}));

export const bulletinsRelations = relations(bulletins, ({ one }) => ({
  prayerLeader: one(members, {
    fields: [bulletins.prayerLeaderId],
    references: [members.id],
  }),
}));

export const lgpdConsentsRelations = relations(lgpdConsents, ({ one }) => ({
  member: one(members, {
    fields: [lgpdConsents.memberId],
    references: [members.id],
  }),
  visitor: one(visitors, {
    fields: [lgpdConsents.visitorId],
    references: [visitors.id],
  }),
}));

export const lgpdRequestsRelations = relations(lgpdRequests, ({ one }) => ({
  member: one(members, {
    fields: [lgpdRequests.memberId],
    references: [members.id],
  }),
  visitor: one(visitors, {
    fields: [lgpdRequests.visitorId],
    references: [visitors.id],
  }),
  resolver: one(users, {
    fields: [lgpdRequests.resolvedBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
