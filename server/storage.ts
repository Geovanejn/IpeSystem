import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  type User, type InsertUser,
  type Member, type InsertMember,
  type Seminarian, type InsertSeminarian,
  type Catechumen, type InsertCatechumen,
  type Visitor, type InsertVisitor,
  type Tithe, type InsertTithe,
  type Offering, type InsertOffering,
  type BookstoreSale, type InsertBookstoreSale,
  type Loan, type InsertLoan,
  type Expense, type InsertExpense,
  type DiaconalHelp, type InsertDiaconalHelp,
  type Bulletin, type InsertBulletin,
  type LgpdConsent, type InsertLgpdConsent,
  type LgpdRequest, type InsertLgpdRequest,
  type AuditLog, type InsertAuditLog,
  users, members, seminarians, catechumens, visitors,
  tithes, offerings, bookstoreSales, loans, expenses,
  diaconalHelp, bulletins, lgpdConsents, lgpdRequests, auditLogs
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Members
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;
  
  // Seminarians
  getSeminarians(): Promise<Seminarian[]>;
  getSeminarian(id: string): Promise<Seminarian | undefined>;
  createSeminarian(seminarian: InsertSeminarian): Promise<Seminarian>;
  updateSeminarian(id: string, seminarian: Partial<InsertSeminarian>): Promise<Seminarian | undefined>;
  deleteSeminarian(id: string): Promise<boolean>;
  
  // Catechumens
  getCatechumens(): Promise<Catechumen[]>;
  getCatechumen(id: string): Promise<Catechumen | undefined>;
  createCatechumen(catechumen: InsertCatechumen): Promise<Catechumen>;
  updateCatechumen(id: string, catechumen: Partial<InsertCatechumen>): Promise<Catechumen | undefined>;
  deleteCatechumen(id: string): Promise<boolean>;
  
  // Visitors
  getVisitors(): Promise<Visitor[]>;
  getVisitor(id: string): Promise<Visitor | undefined>;
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitor(id: string, visitor: Partial<InsertVisitor>): Promise<Visitor | undefined>;
  deleteVisitor(id: string): Promise<boolean>;
  
  // Tithes
  getTithes(): Promise<Tithe[]>;
  getTithe(id: string): Promise<Tithe | undefined>;
  createTithe(tithe: InsertTithe): Promise<Tithe>;
  deleteTithe(id: string): Promise<boolean>;
  
  // Offerings
  getOfferings(): Promise<Offering[]>;
  getOffering(id: string): Promise<Offering | undefined>;
  createOffering(offering: InsertOffering): Promise<Offering>;
  deleteOffering(id: string): Promise<boolean>;
  
  // Bookstore Sales
  getBookstoreSales(): Promise<BookstoreSale[]>;
  getBookstoreSale(id: string): Promise<BookstoreSale | undefined>;
  createBookstoreSale(sale: InsertBookstoreSale): Promise<BookstoreSale>;
  deleteBookstoreSale(id: string): Promise<boolean>;
  
  // Loans
  getLoans(): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  
  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Diaconal Help
  getDiaconalHelps(): Promise<DiaconalHelp[]>;
  getDiaconalHelp(id: string): Promise<DiaconalHelp | undefined>;
  createDiaconalHelp(help: InsertDiaconalHelp): Promise<DiaconalHelp>;
  
  // Bulletins
  getBulletins(): Promise<Bulletin[]>;
  getBulletin(id: string): Promise<Bulletin | undefined>;
  createBulletin(bulletin: InsertBulletin): Promise<Bulletin>;
  updateBulletin(id: string, bulletin: Partial<InsertBulletin>): Promise<Bulletin | undefined>;
  deleteBulletin(id: string): Promise<boolean>;
  
  // LGPD Consents
  getLgpdConsents(memberId?: string, visitorId?: string): Promise<LgpdConsent[]>;
  createLgpdConsent(consent: InsertLgpdConsent): Promise<LgpdConsent>;
  
  // LGPD Requests
  getLgpdRequests(memberId?: string, visitorId?: string): Promise<LgpdRequest[]>;
  getLgpdRequest(id: string): Promise<LgpdRequest | undefined>;
  createLgpdRequest(request: InsertLgpdRequest): Promise<LgpdRequest>;
  updateLgpdRequest(id: string, request: Partial<InsertLgpdRequest>): Promise<LgpdRequest | undefined>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DBStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return db.select().from(members).orderBy(desc(members.fullName));
  }

  async getMember(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(insertMember).returning();
    return result[0];
  }

  async updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined> {
    const result = await db.update(members)
      .set({ ...member, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return result[0];
  }

  async deleteMember(id: string): Promise<boolean> {
    const result = await db.delete(members).where(eq(members.id, id));
    return result.rowCount > 0;
  }

  // Seminarians
  async getSeminarians(): Promise<Seminarian[]> {
    return db.select().from(seminarians).orderBy(desc(seminarians.fullName));
  }

  async getSeminarian(id: string): Promise<Seminarian | undefined> {
    const result = await db.select().from(seminarians).where(eq(seminarians.id, id)).limit(1);
    return result[0];
  }

  async createSeminarian(insertSeminarian: InsertSeminarian): Promise<Seminarian> {
    const result = await db.insert(seminarians).values(insertSeminarian).returning();
    return result[0];
  }

  async updateSeminarian(id: string, seminarian: Partial<InsertSeminarian>): Promise<Seminarian | undefined> {
    const result = await db.update(seminarians)
      .set({ ...seminarian, updatedAt: new Date() })
      .where(eq(seminarians.id, id))
      .returning();
    return result[0];
  }

  async deleteSeminarian(id: string): Promise<boolean> {
    const result = await db.delete(seminarians).where(eq(seminarians.id, id));
    return result.rowCount > 0;
  }

  // Catechumens
  async getCatechumens(): Promise<Catechumen[]> {
    return db.select().from(catechumens).orderBy(desc(catechumens.fullName));
  }

  async getCatechumen(id: string): Promise<Catechumen | undefined> {
    const result = await db.select().from(catechumens).where(eq(catechumens.id, id)).limit(1);
    return result[0];
  }

  async createCatechumen(insertCatechumen: InsertCatechumen): Promise<Catechumen> {
    const result = await db.insert(catechumens).values(insertCatechumen).returning();
    return result[0];
  }

  async updateCatechumen(id: string, catechumen: Partial<InsertCatechumen>): Promise<Catechumen | undefined> {
    const result = await db.update(catechumens)
      .set({ ...catechumen, updatedAt: new Date() })
      .where(eq(catechumens.id, id))
      .returning();
    return result[0];
  }

  async deleteCatechumen(id: string): Promise<boolean> {
    const result = await db.delete(catechumens).where(eq(catechumens.id, id));
    return result.rowCount > 0;
  }

  // Visitors
  async getVisitors(): Promise<Visitor[]> {
    return db.select().from(visitors).orderBy(desc(visitors.fullName));
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    const result = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    return result[0];
  }

  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const result = await db.insert(visitors).values(insertVisitor).returning();
    return result[0];
  }

  async updateVisitor(id: string, visitor: Partial<InsertVisitor>): Promise<Visitor | undefined> {
    const result = await db.update(visitors)
      .set({ ...visitor, updatedAt: new Date() })
      .where(eq(visitors.id, id))
      .returning();
    return result[0];
  }

  async deleteVisitor(id: string): Promise<boolean> {
    const result = await db.delete(visitors).where(eq(visitors.id, id));
    return result.rowCount > 0;
  }

  // Tithes
  async getTithes(): Promise<Tithe[]> {
    return db.select().from(tithes).orderBy(desc(tithes.date));
  }

  async getTithe(id: string): Promise<Tithe | undefined> {
    const result = await db.select().from(tithes).where(eq(tithes.id, id)).limit(1);
    return result[0];
  }

  async createTithe(insertTithe: InsertTithe): Promise<Tithe> {
    const result = await db.insert(tithes).values(insertTithe).returning();
    return result[0];
  }

  async deleteTithe(id: string): Promise<boolean> {
    const result = await db.delete(tithes).where(eq(tithes.id, id));
    return result.rowCount > 0;
  }

  // Offerings
  async getOfferings(): Promise<Offering[]> {
    return db.select().from(offerings).orderBy(desc(offerings.date));
  }

  async getOffering(id: string): Promise<Offering | undefined> {
    const result = await db.select().from(offerings).where(eq(offerings.id, id)).limit(1);
    return result[0];
  }

  async createOffering(insertOffering: InsertOffering): Promise<Offering> {
    const result = await db.insert(offerings).values(insertOffering).returning();
    return result[0];
  }

  async deleteOffering(id: string): Promise<boolean> {
    const result = await db.delete(offerings).where(eq(offerings.id, id));
    return result.rowCount > 0;
  }

  // Bookstore Sales
  async getBookstoreSales(): Promise<BookstoreSale[]> {
    return db.select().from(bookstoreSales).orderBy(desc(bookstoreSales.date));
  }

  async getBookstoreSale(id: string): Promise<BookstoreSale | undefined> {
    const result = await db.select().from(bookstoreSales).where(eq(bookstoreSales.id, id)).limit(1);
    return result[0];
  }

  async createBookstoreSale(insertSale: InsertBookstoreSale): Promise<BookstoreSale> {
    const result = await db.insert(bookstoreSales).values(insertSale).returning();
    return result[0];
  }

  async deleteBookstoreSale(id: string): Promise<boolean> {
    const result = await db.delete(bookstoreSales).where(eq(bookstoreSales.id, id));
    return result.rowCount > 0;
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    return db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return result[0];
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const result = await db.insert(loans).values(insertLoan).returning();
    return result[0];
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return result[0];
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(insertExpense).returning();
    return result[0];
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  // Diaconal Help
  async getDiaconalHelps(): Promise<DiaconalHelp[]> {
    return db.select().from(diaconalHelp).orderBy(desc(diaconalHelp.date));
  }

  async getDiaconalHelp(id: string): Promise<DiaconalHelp | undefined> {
    const result = await db.select().from(diaconalHelp).where(eq(diaconalHelp.id, id)).limit(1);
    return result[0];
  }

  async createDiaconalHelp(insertHelp: InsertDiaconalHelp): Promise<DiaconalHelp> {
    const result = await db.insert(diaconalHelp).values(insertHelp).returning();
    return result[0];
  }

  // Bulletins
  async getBulletins(): Promise<Bulletin[]> {
    return db.select().from(bulletins).orderBy(desc(bulletins.date));
  }

  async getBulletin(id: string): Promise<Bulletin | undefined> {
    const result = await db.select().from(bulletins).where(eq(bulletins.id, id)).limit(1);
    return result[0];
  }

  async createBulletin(insertBulletin: InsertBulletin): Promise<Bulletin> {
    const result = await db.insert(bulletins).values(insertBulletin).returning();
    return result[0];
  }

  async updateBulletin(id: string, bulletin: Partial<InsertBulletin>): Promise<Bulletin | undefined> {
    const result = await db.update(bulletins)
      .set({ ...bulletin, updatedAt: new Date() })
      .where(eq(bulletins.id, id))
      .returning();
    return result[0];
  }

  async deleteBulletin(id: string): Promise<boolean> {
    const result = await db.delete(bulletins).where(eq(bulletins.id, id));
    return result.rowCount > 0;
  }

  // LGPD Consents
  async getLgpdConsents(memberId?: string, visitorId?: string): Promise<LgpdConsent[]> {
    if (memberId) {
      return db.select().from(lgpdConsents).where(eq(lgpdConsents.memberId, memberId));
    }
    if (visitorId) {
      return db.select().from(lgpdConsents).where(eq(lgpdConsents.visitorId, visitorId));
    }
    return db.select().from(lgpdConsents);
  }

  async createLgpdConsent(insertConsent: InsertLgpdConsent): Promise<LgpdConsent> {
    const result = await db.insert(lgpdConsents).values(insertConsent).returning();
    return result[0];
  }

  // LGPD Requests
  async getLgpdRequests(memberId?: string, visitorId?: string): Promise<LgpdRequest[]> {
    if (memberId) {
      return db.select().from(lgpdRequests).where(eq(lgpdRequests.memberId, memberId));
    }
    if (visitorId) {
      return db.select().from(lgpdRequests).where(eq(lgpdRequests.visitorId, visitorId));
    }
    return db.select().from(lgpdRequests).orderBy(desc(lgpdRequests.createdAt));
  }

  async getLgpdRequest(id: string): Promise<LgpdRequest | undefined> {
    const result = await db.select().from(lgpdRequests).where(eq(lgpdRequests.id, id)).limit(1);
    return result[0];
  }

  async createLgpdRequest(insertRequest: InsertLgpdRequest): Promise<LgpdRequest> {
    const result = await db.insert(lgpdRequests).values(insertRequest).returning();
    return result[0];
  }

  async updateLgpdRequest(id: string, request: Partial<InsertLgpdRequest>): Promise<LgpdRequest | undefined> {
    const result = await db.update(lgpdRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(lgpdRequests.id, id))
      .returning();
    return result[0];
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }
}

export const storage = new DBStorage();
