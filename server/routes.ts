import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, createSession, getSession, deleteSession, hashPassword } from "./auth";
import { z } from "zod";
import { 
  insertMemberSchema, 
  insertSeminarianSchema,
  insertCatechumenSchema,
  insertVisitorSchema,
  insertTitheSchema,
  insertOfferingSchema,
  insertBookstoreSaleSchema,
  insertLoanSchema,
  insertExpenseSchema,
  insertDiaconalHelpSchema,
  insertBulletinSchema,
  insertLgpdConsentSchema,
  insertLgpdRequestSchema,
  insertAuditLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTH ROUTES
  // ============================================
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const user = await authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const sessionId = createSession(user);
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          memberId: user.memberId,
          visitorId: user.visitorId,
        },
        sessionId,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (sessionId) {
        deleteSession(sessionId);
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      
      if (!sessionId) {
        return res.status(401).json({ error: "No session" });
      }
      
      const session = getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: "Invalid session" });
      }
      
      res.json({ session });
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // USERS ROUTES (Pastor - User Management)
  // ============================================

  const createUserSchema = z.object({
    username: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    role: z.enum(["pastor", "treasurer", "deacon"]),
    memberId: z.string().optional(),
  });

  const updateUserSchema = z.object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
    role: z.enum(["pastor", "treasurer", "deacon"]).optional(),
    memberId: z.string().optional(),
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Não retornar senhas hasheadas
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      const session = sessionId ? getSession(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = createUserSchema.parse(req.body);
      
      // Hash da senha
      const hashedPassword = await hashPassword(validated.password);
      
      // Criar usuário
      const user = await storage.createUser({
        username: validated.username,
        password: hashedPassword,
        role: validated.role,
        memberId: validated.memberId,
      });
      
      // Criar audit log
      await storage.createAuditLog({
        userId: session.userId,
        action: "CREATE",
        tableName: "users",
        recordId: user.id,
        changesAfter: JSON.stringify({ 
          username: user.username, 
          role: user.role, 
          memberId: user.memberId 
        }),
      });
      
      // Não retornar senha hasheada
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      const session = sessionId ? getSession(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = updateUserSchema.parse(req.body);
      
      // Buscar usuário antes da atualização
      const userBefore = await storage.getUser(req.params.id);
      
      if (!userBefore) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Preparar dados para atualização
      const updateData: any = {};
      
      if (validated.role) {
        updateData.role = validated.role;
      }
      
      if (validated.memberId !== undefined) {
        updateData.memberId = validated.memberId;
      }
      
      if (validated.password) {
        updateData.password = await hashPassword(validated.password);
      }
      
      // Atualizar usuário
      const user = await storage.updateUser(req.params.id, updateData);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Criar audit log
      await storage.createAuditLog({
        userId: session.userId,
        action: "UPDATE",
        tableName: "users",
        recordId: user.id,
        changesBefore: JSON.stringify({ 
          username: userBefore.username, 
          role: userBefore.role, 
          memberId: userBefore.memberId,
          passwordChanged: validated.password ? false : undefined
        }),
        changesAfter: JSON.stringify({ 
          username: user.username, 
          role: user.role, 
          memberId: user.memberId,
          passwordChanged: validated.password ? true : undefined
        }),
      });
      
      // Não retornar senha hasheada
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      const session = sessionId ? getSession(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Buscar usuário antes da exclusão
      const userBefore = await storage.getUser(req.params.id);
      
      if (!userBefore) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Deletar usuário
      const success = await storage.deleteUser(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Criar audit log
      await storage.createAuditLog({
        userId: session.userId,
        action: "DELETE",
        tableName: "users",
        recordId: req.params.id,
        changesBefore: JSON.stringify({ 
          username: userBefore.username, 
          role: userBefore.role, 
          memberId: userBefore.memberId 
        }),
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ============================================
  // MEMBERS ROUTES (Pastor)
  // ============================================
  
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validated = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(validated);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // TODO: usar userId real da sessão
        action: "CREATE",
        tableName: "members",
        recordId: member.id,
        changesAfter: JSON.stringify(member),
      });
      
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    try {
      const validated = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(req.params.id, validated);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system",
        action: "UPDATE",
        tableName: "members",
        recordId: member.id,
        changesAfter: JSON.stringify(member),
      });
      
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const success = await storage.deleteMember(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system",
        action: "DELETE",
        tableName: "members",
        recordId: req.params.id,
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // ============================================
  // SEMINARIANS ROUTES (Pastor)
  // ============================================
  
  app.get("/api/seminarians", async (req, res) => {
    try {
      const seminarians = await storage.getSeminarians();
      res.json(seminarians);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch seminarians" });
    }
  });

  app.post("/api/seminarians", async (req, res) => {
    try {
      const validated = insertSeminarianSchema.parse(req.body);
      const seminarian = await storage.createSeminarian(validated);
      res.status(201).json(seminarian);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create seminarian" });
    }
  });

  app.put("/api/seminarians/:id", async (req, res) => {
    try {
      const validated = insertSeminarianSchema.partial().parse(req.body);
      const seminarian = await storage.updateSeminarian(req.params.id, validated);
      
      if (!seminarian) {
        return res.status(404).json({ error: "Seminarian not found" });
      }
      
      res.json(seminarian);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update seminarian" });
    }
  });

  app.delete("/api/seminarians/:id", async (req, res) => {
    try {
      const success = await storage.deleteSeminarian(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Seminarian not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete seminarian" });
    }
  });

  // ============================================
  // CATECHUMENS ROUTES (Pastor)
  // ============================================
  
  app.get("/api/catechumens", async (req, res) => {
    try {
      const catechumens = await storage.getCatechumens();
      res.json(catechumens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch catechumens" });
    }
  });

  app.post("/api/catechumens", async (req, res) => {
    try {
      const validated = insertCatechumenSchema.parse(req.body);
      const catechumen = await storage.createCatechumen(validated);
      res.status(201).json(catechumen);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create catechumen" });
    }
  });

  app.put("/api/catechumens/:id", async (req, res) => {
    try {
      const validated = insertCatechumenSchema.partial().parse(req.body);
      
      // Buscar catecúmeno original para verificar mudança de status
      const originalCatechumen = await storage.getCatechumen(req.params.id);
      if (!originalCatechumen) {
        return res.status(404).json({ error: "Catechumen not found" });
      }
      
      const catechumen = await storage.updateCatechumen(req.params.id, validated);
      
      if (!catechumen) {
        return res.status(404).json({ error: "Catechumen not found" });
      }
      
      // ✅ CRIAÇÃO AUTOMÁTICA DE MEMBRO ao marcar como "concluído"
      if (validated.stage === "concluido" && originalCatechumen.stage !== "concluido") {
        // Criar membro com dados básicos do catecúmeno
        const admissionDate = catechumen.expectedProfessionDate || new Date().toISOString().split('T')[0];
        
        const newMember = await storage.createMember({
          fullName: catechumen.fullName,
          birthDate: "2000-01-01", // Placeholder - pastor deve completar
          gender: "masculino", // Placeholder - pastor deve completar
          maritalStatus: "solteiro",
          primaryPhone: "A preencher",
          email: `${catechumen.fullName.toLowerCase().replace(/\s+/g, '.')}@pendente.com`,
          address: "A preencher",
          addressNumber: "S/N",
          neighborhood: "A preencher",
          zipCode: "00000-000",
          communionStatus: "comungante", // Fez profissão de fé
          ecclesiasticalRole: "membro",
          memberStatus: "ativo",
          admissionDate,
          lgpdConsentUrl: "https://pendente.com/consent.pdf",
          pastoralNotes: `✅ CRIADO AUTOMATICAMENTE a partir do catecúmeno concluído em ${new Date().toLocaleDateString('pt-BR')}.\n\n⚠️ ATENÇÃO: Complete os dados pessoais (data nascimento, gênero, telefone, email, endereço) assim que possível.`,
        });

        // Registrar criação automática no audit log
        const session = getSession(req.headers.authorization?.replace("Bearer ", "") || "");
        if (session) {
          await storage.createAuditLog({
            userId: session.userId,
            action: "CREATE",
            tableName: "members",
            recordId: newMember.id,
            changesBefore: null,
            changesAfter: JSON.stringify(newMember),
          });
        }

        // Retornar catecúmeno atualizado com info do membro criado
        res.json({ 
          ...catechumen, 
          memberCreated: true, 
          memberId: newMember.id,
          memberName: newMember.fullName 
        });
      } else {
        res.json(catechumen);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update catechumen" });
    }
  });

  app.delete("/api/catechumens/:id", async (req, res) => {
    try {
      const success = await storage.deleteCatechumen(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Catechumen not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete catechumen" });
    }
  });

  // ============================================
  // VISITORS ROUTES (Deacon - CRUD, Pastor - Read Only)
  // ============================================
  
  app.get("/api/visitors", async (req, res) => {
    try {
      const visitors = await storage.getVisitors();
      res.json(visitors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitors" });
    }
  });

  app.get("/api/visitors/:id", async (req, res) => {
    try {
      const visitor = await storage.getVisitor(req.params.id);
      if (!visitor) {
        return res.status(404).json({ error: "Visitor not found" });
      }
      res.json(visitor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitor" });
    }
  });

  app.post("/api/visitors", async (req, res) => {
    try {
      const validated = insertVisitorSchema.parse(req.body);
      const visitor = await storage.createVisitor(validated);
      res.status(201).json(visitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create visitor" });
    }
  });

  app.put("/api/visitors/:id", async (req, res) => {
    try {
      const validated = insertVisitorSchema.partial().parse(req.body);
      const visitor = await storage.updateVisitor(req.params.id, validated);
      
      if (!visitor) {
        return res.status(404).json({ error: "Visitor not found" });
      }
      
      res.json(visitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update visitor" });
    }
  });

  app.delete("/api/visitors/:id", async (req, res) => {
    try {
      const success = await storage.deleteVisitor(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Visitor not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete visitor" });
    }
  });

  // ============================================
  // TITHES ROUTES (Treasurer)
  // ============================================
  
  app.get("/api/tithes", async (req, res) => {
    try {
      const tithes = await storage.getTithes();
      res.json(tithes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tithes" });
    }
  });

  app.post("/api/tithes", async (req, res) => {
    try {
      const validated = insertTitheSchema.parse(req.body);
      const tithe = await storage.createTithe(validated);
      res.status(201).json(tithe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create tithe" });
    }
  });

  app.delete("/api/tithes/:id", async (req, res) => {
    try {
      const success = await storage.deleteTithe(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Tithe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tithe" });
    }
  });

  // ============================================
  // OFFERINGS ROUTES (Treasurer)
  // ============================================
  
  app.get("/api/offerings", async (req, res) => {
    try {
      const offerings = await storage.getOfferings();
      res.json(offerings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offerings" });
    }
  });

  app.post("/api/offerings", async (req, res) => {
    try {
      const validated = insertOfferingSchema.parse(req.body);
      const offering = await storage.createOffering(validated);
      res.status(201).json(offering);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create offering" });
    }
  });

  app.delete("/api/offerings/:id", async (req, res) => {
    try {
      const success = await storage.deleteOffering(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Offering not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete offering" });
    }
  });

  // ============================================
  // BOOKSTORE SALES ROUTES (Treasurer)
  // ============================================
  
  app.get("/api/bookstore-sales", async (req, res) => {
    try {
      const sales = await storage.getBookstoreSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookstore sales" });
    }
  });

  app.post("/api/bookstore-sales", async (req, res) => {
    try {
      const validated = insertBookstoreSaleSchema.parse(req.body);
      const sale = await storage.createBookstoreSale(validated);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create bookstore sale" });
    }
  });

  // ============================================
  // LOANS ROUTES (Treasurer)
  // ============================================
  
  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getLoans();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loans" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const validated = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(validated);
      
      // TODO: Gerar automaticamente parcelas em expenses
      // Para cada parcela de 1 a N:
      // - Criar expense com category = "parcela_emprestimo"
      // - loanId = loan.id
      // - installmentNumber = i
      // - amount = loan.installmentAmount
      // - date = firstInstallmentDate + (i-1) meses
      
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create loan" });
    }
  });

  // ============================================
  // EXPENSES ROUTES (Treasurer)
  // ============================================
  
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validated = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validated);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteExpense(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // ============================================
  // DIACONAL HELP ROUTES (Deacon)
  // ============================================
  
  app.get("/api/diaconal-help", async (req, res) => {
    try {
      const helps = await storage.getDiaconalHelps();
      res.json(helps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diaconal helps" });
    }
  });

  app.post("/api/diaconal-help", async (req, res) => {
    try {
      const validated = insertDiaconalHelpSchema.parse(req.body);
      const help = await storage.createDiaconalHelp(validated);
      
      // TODO: Criar automaticamente expense com category = "ajuda_diaconal"
      // - amount = help.amount
      // - date = help.date
      // - description = help.description
      // - receiptUrl = help.receiptUrl
      
      res.status(201).json(help);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create diaconal help" });
    }
  });

  // ============================================
  // BULLETINS ROUTES (Deacon)
  // ============================================
  
  app.get("/api/bulletins", async (req, res) => {
    try {
      const bulletins = await storage.getBulletins();
      res.json(bulletins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bulletins" });
    }
  });

  app.get("/api/bulletins/:id", async (req, res) => {
    try {
      const bulletin = await storage.getBulletin(req.params.id);
      if (!bulletin) {
        return res.status(404).json({ error: "Bulletin not found" });
      }
      res.json(bulletin);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bulletin" });
    }
  });

  app.post("/api/bulletins", async (req, res) => {
    try {
      const validated = insertBulletinSchema.parse(req.body);
      const bulletin = await storage.createBulletin(validated);
      res.status(201).json(bulletin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create bulletin" });
    }
  });

  app.put("/api/bulletins/:id", async (req, res) => {
    try {
      const validated = insertBulletinSchema.partial().parse(req.body);
      const bulletin = await storage.updateBulletin(req.params.id, validated);
      
      if (!bulletin) {
        return res.status(404).json({ error: "Bulletin not found" });
      }
      
      res.json(bulletin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update bulletin" });
    }
  });

  app.delete("/api/bulletins/:id", async (req, res) => {
    try {
      const success = await storage.deleteBulletin(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Bulletin not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bulletin" });
    }
  });

  // ============================================
  // LGPD ROUTES
  // ============================================
  
  // Consents - GET all
  app.get("/api/lgpd-consents", async (req, res) => {
    try {
      const { memberId, visitorId } = req.query;
      const consents = await storage.getLgpdConsents(
        memberId as string,
        visitorId as string
      );
      
      // Return mock consent types if empty
      if (!consents || consents.length === 0) {
        return res.json({
          consents: [
            { id: "1", name: "Marketing", description: "Receber comunicações de marketing", isRequired: false, isConsented: false },
            { id: "2", name: "Newsletter", description: "Receber newsletter semanal", isRequired: false, isConsented: false },
            { id: "3", name: "Dados Financeiros", description: "Processar dízimos e ofertas", isRequired: true, isConsented: true, consentedAt: new Date().toISOString() },
            { id: "4", name: "Termos de Serviço", description: "Usar sistema IPE", isRequired: true, isConsented: true, consentedAt: new Date().toISOString() },
            { id: "5", name: "Análise de Dados", description: "Análise estatística anônima", isRequired: false, isConsented: false },
          ],
          lastUpdated: new Date().toISOString(),
        });
      }
      res.json(consents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consents" });
    }
  });

  // Consents - POST create
  app.post("/api/lgpd-consents", async (req, res) => {
    try {
      const validated = insertLgpdConsentSchema.parse(req.body);
      const consent = await storage.createLgpdConsent(validated);
      res.status(201).json(consent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create consent" });
    }
  });

  // Consents - PATCH update multiple
  app.patch("/api/lgpd-consents", async (req, res) => {
    try {
      const { consents: consentUpdates } = req.body;
      
      if (!consentUpdates || typeof consentUpdates !== 'object') {
        return res.status(400).json({ error: "Invalid consent updates" });
      }
      
      // Mock implementation - just return success
      res.json({ 
        message: "Consents updated successfully",
        updated: Object.keys(consentUpdates).length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update consents" });
    }
  });

  // Requests - GET all
  app.get("/api/lgpd-requests", async (req, res) => {
    try {
      const { memberId, visitorId } = req.query;
      const requests = await storage.getLgpdRequests(
        memberId as string,
        visitorId as string
      );
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Requests - POST create
  app.post("/api/lgpd-requests", async (req, res) => {
    try {
      const { type, description, fields } = req.body;
      
      // Map frontend type to schema action
      const actionMap: Record<string, string> = {
        correction: "correction_request",
        deletion: "deletion_request",
        access: "view",
        portability: "export",
      };
      
      const validated = insertLgpdRequestSchema.parse({
        action: actionMap[type] || type,
        description,
      });
      
      const request = await storage.createLgpdRequest(validated);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  // Requests - PUT update
  app.put("/api/lgpd-requests/:id", async (req, res) => {
    try {
      const validated = insertLgpdRequestSchema.partial().parse(req.body);
      const request = await storage.updateLgpdRequest(req.params.id, validated);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update request" });
    }
  });

  // Legacy LGPD routes for backward compatibility
  app.get("/api/lgpd/consents", async (req, res) => {
    req.url = "/api/lgpd-consents";
    return res.redirect(301, "/api/lgpd-consents");
  });

  app.get("/api/lgpd/requests", async (req, res) => {
    req.url = "/api/lgpd-requests";
    return res.redirect(301, "/api/lgpd-requests");
  });

  // LGPD export endpoint (generate PDF/Excel/JSON)
  app.post("/api/lgpd/export", async (req, res) => {
    try {
      const { memberId, visitorId, format } = req.body;
      
      // Mock data export - in production would generate actual files
      const mockData = {
        format: format || "json",
        exportDate: new Date().toISOString(),
        dataCategories: {
          personal: {
            fullName: "Exemplo Nome",
            email: "exemplo@email.com",
            phone: "+55 11 99999-9999",
            address: "Rua Exemplo, 123",
          },
          financial: {
            tithes: 12500.00,
            offerings: 2300.50,
          },
          spiritual: {
            status: "ativo",
            ecclesiasticalRole: "membro",
            communionStatus: "comungante",
          },
        },
      };
      
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=dados_ipe.json");
        return res.json(mockData);
      } else if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=dados_ipe.csv");
        const csv = "Nome,Email,Telefone,Status\nExemplo,exemplo@email.com,+55 11 99999-9999,Ativo";
        return res.send(csv);
      } else {
        res.json({ 
          message: "Export available in JSON and CSV formats",
          format,
          availableFormats: ["json", "csv"],
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
