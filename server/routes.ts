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
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
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
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
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
      
      // ✅ Se criar já como "concluido", criar membro automaticamente
      if (validated.stage === "concluido") {
        const admissionDate = catechumen.expectedProfessionDate || new Date().toISOString().split('T')[0];
        
        const newMember = await storage.createMember({
          fullName: catechumen.fullName,
          birthDate: "2000-01-01",
          gender: "masculino",
          maritalStatus: "solteiro",
          primaryPhone: "A preencher",
          email: `${catechumen.fullName.toLowerCase().replace(/\s+/g, '.')}@pendente.com`,
          address: "A preencher",
          addressNumber: "S/N",
          neighborhood: "A preencher",
          zipCode: "00000-000",
          communionStatus: "comungante",
          ecclesiasticalRole: "membro",
          memberStatus: "ativo",
          admissionDate,
          lgpdConsentUrl: "https://pendente.com/consent.pdf",
          pastoralNotes: `✅ CRIADO AUTOMATICAMENTE a partir do catecúmeno concluído em ${new Date().toLocaleDateString('pt-BR')}.\n\n⚠️ ATENÇÃO: Complete os dados pessoais (data nascimento, gênero, telefone, email, endereço) assim que possível.`,
        });

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

        console.log(`✅ [CATECHUMEN CREATION] ${catechumen.fullName} → Member created (ID: ${newMember.id})`);

        res.status(201).json({
          ...catechumen,
          memberCreated: true,
          memberId: newMember.id,
          memberName: newMember.fullName
        });
      } else {
        res.status(201).json(catechumen);
      }
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
      const isTransitioningToConcluded = validated.stage === "concluido" && originalCatechumen.stage !== "concluido";
      
      if (isTransitioningToConcluded) {
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

        console.log(`✅ [CATECHUMEN CONVERSION] ${catechumen.fullName} → Member created (ID: ${newMember.id})`);

        // Retornar catecúmeno atualizado com info do membro criado
        const responseData = {
          ...catechumen, 
          memberCreated: true, 
          memberId: newMember.id,
          memberName: newMember.fullName 
        };
        
        res.json(responseData);
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
      
      // Gerar automaticamente parcelas em expenses
      for (let i = 1; i <= loan.installments; i++) {
        const installmentDate = new Date(loan.firstInstallmentDate);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
        
        await storage.createExpense({
          category: "parcela_emprestimo",
          description: `Parcela ${i}/${loan.installments} - ${loan.creditorName}`,
          amount: loan.installmentAmount,
          date: installmentDate.toISOString().split('T')[0],
          receiptUrl: loan.receiptUrl || "https://pendente.com/receipt.pdf",
          loanId: loan.id,
          installmentNumber: i,
        });
      }
      
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create loan" });
    }
  });

  app.patch("/api/loans/:id", async (req, res) => {
    try {
      const validated = insertLoanSchema.partial().parse(req.body);
      const loanBefore = await storage.getLoan(req.params.id);
      
      if (!loanBefore) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      const loan = await storage.updateLoan(req.params.id, validated);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      // Se o número de parcelas mudou, deletar expenses antigas e gerar novas
      if (validated.installments && validated.installments !== loanBefore.installments) {
        // Deletar expenses antigas relacionadas ao loan
        const allExpenses = await storage.getExpenses();
        const loanExpenses = allExpenses.filter(e => e.loanId === req.params.id);
        
        for (const expense of loanExpenses) {
          await storage.deleteExpense(expense.id);
        }
        
        // Gerar novas expenses com o novo número de parcelas
        for (let i = 1; i <= loan.installments; i++) {
          const installmentDate = new Date(loan.firstInstallmentDate);
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
          
          await storage.createExpense({
            category: "parcela_emprestimo",
            description: `Parcela ${i}/${loan.installments} - ${loan.creditorName}`,
            amount: loan.installmentAmount,
            date: installmentDate.toISOString().split('T')[0],
            receiptUrl: loan.receiptUrl || "",
            loanId: loan.id,
            installmentNumber: i,
          });
        }
      }
      
      res.json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update loan" });
    }
  });

  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      // Deletar todas as expenses relacionadas ao loan (cascade)
      const allExpenses = await storage.getExpenses();
      const loanExpenses = allExpenses.filter(e => e.loanId === req.params.id);
      
      for (const expense of loanExpenses) {
        await storage.deleteExpense(expense.id);
      }
      
      // Agora deletar o loan
      const success = await storage.deleteLoan(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete loan" });
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

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      // Verificar se a expense existe e validar
      const existingExpense = await storage.getExpense(req.params.id);
      
      if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      // Bloquear edição se a expense está vinculada a um empréstimo ou é ajuda diaconal
      if (existingExpense.loanId || existingExpense.category === "ajuda_diaconal") {
        return res.status(403).json({ 
          error: "Cannot update expenses linked to loans or diaconal help. Please edit the loan or diaconal help record instead." 
        });
      }
      
      const validated = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(req.params.id, validated);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      // Verificar se a expense existe e validar
      const existingExpense = await storage.getExpense(req.params.id);
      
      if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      // Bloquear exclusão se a expense está vinculada a um empréstimo ou é ajuda diaconal
      if (existingExpense.loanId || existingExpense.category === "ajuda_diaconal") {
        return res.status(403).json({ 
          error: "Cannot delete expenses linked to loans or diaconal help. Please delete the loan or diaconal help record instead." 
        });
      }
      
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
      
      // Criar ajuda diaconal
      const help = await storage.createDiaconalHelp(validated);
      
      res.status(201).json(help);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create diaconal help" });
    }
  });

  app.patch("/api/diaconal-help/:id", async (req, res) => {
    try {
      const validated = insertDiaconalHelpSchema.partial().parse(req.body);
      const help = await storage.updateDiaconalHelp(req.params.id, validated);
      
      if (!help) {
        return res.status(404).json({ error: "Diaconal help not found" });
      }
      
      res.json(help);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update diaconal help" });
    }
  });

  app.delete("/api/diaconal-help/:id", async (req, res) => {
    try {
      const success = await storage.deleteDiaconalHelp(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Diaconal help not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete diaconal help" });
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

  // LGPD My Data endpoint - Get user's personal data summary
  app.get("/api/lgpd/my-data", async (req, res) => {
    try {
      // Validate session and get authenticated user
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      const session = sessionId ? getSession(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Verify user has member or visitor role
      if (!["member", "visitor"].includes(session.role)) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      // Get member or visitor data based on session
      let member = null;
      let visitor = null;

      if (session.memberId) {
        const members = await storage.getMembers();
        member = members.find(m => m.id === session.memberId);
      } else if (session.visitorId) {
        const visitors = await storage.getVisitors();
        visitor = visitors.find(v => v.id === session.visitorId);
      }

      if (!member && !visitor) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Build response for member
      if (member) {
        // Get financial data for members
        const allTithes = await storage.getTithes();
        const memberTithes = allTithes.filter(t => t.memberId === member.id);
        const totalTithes = memberTithes.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        // Get LGPD data
        const lgpdRequests = await storage.getLgpdRequests(member.id);
        const lgpdConsents = await storage.getLgpdConsents(member.id);
        const activeConsents = lgpdConsents.filter(c => c.consentGiven && !c.revokedDate).length;
        
        // Get last tithe date
        const lastTithe = memberTithes.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        const userData = {
          personalInfo: {
            name: member.fullName,
            email: member.email,
            phone: member.primaryPhone,
            cpf: "123.456.789-00", // Mock CPF - would come from member table in production
            address: `${member.address}, ${member.addressNumber}${member.addressComplement ? `, ${member.addressComplement}` : ''} - ${member.neighborhood}, ${member.zipCode}`,
            birthDate: member.birthDate,
            maritalStatus: member.maritalStatus,
          },
          churchInfo: {
            membershipType: member.memberStatus,
            admissionDate: member.admissionDate,
            communionStatus: member.communionStatus,
            officePosition: member.ecclesiasticalRole !== "membro" ? member.ecclesiasticalRole : undefined,
            departments: [],
          },
          financialInfo: {
            totalTithes,
            totalOfferings: 0, // Offerings are not per-member in the current schema
            lastTitheDate: lastTithe?.date,
            lastOfferingDate: undefined,
          },
          lgpdInfo: {
            consentDate: member.admissionDate,
            consentUrl: member.lgpdConsentUrl,
            activeConsents,
            totalRequests: lgpdRequests.length,
          },
        };
        
        return res.json(userData);
      }

      // Build response for visitor (no financial data)
      if (visitor) {
        // Get LGPD data for visitor
        const lgpdRequests = await storage.getLgpdRequests(visitor.id);
        
        const userData = {
          personalInfo: {
            name: visitor.fullName,
            email: visitor.email || "",
            phone: visitor.phone,
            cpf: "",
            address: visitor.address || "",
            birthDate: "",
            maritalStatus: "",
          },
          churchInfo: {
            membershipType: "Visitante",
            firstVisitDate: visitor.firstVisitDate,
          },
          lgpdInfo: {
            totalRequests: lgpdRequests.length,
          },
        };
        
        return res.json(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
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
      const { identifier, format } = req.body;
      
      if (!identifier) {
        return res.status(400).json({ error: "Identifier (CPF or email) is required" });
      }
      
      // Find member or visitor by email (simplified - in production would also check CPF)
      const members = await storage.getMembers();
      const visitors = await storage.getVisitors();
      
      const member = members.find(m => m.email.toLowerCase() === identifier.toLowerCase());
      const visitor = visitors.find(v => v.email?.toLowerCase() === identifier.toLowerCase());
      
      if (!member && !visitor) {
        return res.status(404).json({ error: "Nenhum dado encontrado para o identificador fornecido" });
      }
      
      // Gather all data for the user
      const exportData: any = {
        format: format || "json",
        exportDate: new Date().toISOString(),
        identifier,
      };
      
      if (member) {
        // Personal data from members table
        exportData.personal = {
          fullName: member.fullName,
          email: member.email,
          primaryPhone: member.primaryPhone,
          secondaryPhone: member.secondaryPhone || null,
          gender: member.gender,
          birthDate: member.birthDate,
          maritalStatus: member.maritalStatus,
          address: member.address,
          addressNumber: member.addressNumber,
          addressComplement: member.addressComplement,
          neighborhood: member.neighborhood,
          zipCode: member.zipCode,
          marriageDate: member.marriageDate || null,
        };
        
        // Spiritual data
        exportData.spiritual = {
          communionStatus: member.communionStatus,
          ecclesiasticalRole: member.ecclesiasticalRole,
          memberStatus: member.memberStatus,
          admissionDate: member.admissionDate,
          lgpdConsentUrl: member.lgpdConsentUrl,
        };
        
        // Financial data - Tithes
        const allTithes = await storage.getTithes();
        const memberTithes = allTithes.filter(t => t.memberId === member.id);
        exportData.tithes = memberTithes.map(t => ({
          amount: t.amount,
          date: t.date,
          paymentMethod: t.paymentMethod,
          notes: t.notes,
        }));
        
        // Financial data - Offerings (not linked to members in current schema)
        const allOfferings = await storage.getOfferings();
        exportData.offerings = allOfferings.map(o => ({
          amount: o.amount,
          date: o.date,
          type: o.type,
          notes: o.notes,
        }));
        
        // Bookstore purchases
        const allBookstoreSales = await storage.getBookstoreSales();
        const memberBookstoreSales = allBookstoreSales.filter(s => s.buyerMemberId === member.id);
        exportData.bookstoreSales = memberBookstoreSales.map(s => ({
          productName: s.productName,
          quantity: s.quantity,
          totalAmount: s.totalAmount,
          date: s.date,
          paymentMethod: s.paymentMethod,
        }));
        
        // LGPD Requests
        const lgpdRequests = await storage.getLgpdRequests(member.id);
        exportData.lgpdRequests = lgpdRequests.map(r => ({
          action: r.action,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
          resolvedAt: r.resolvedAt,
        }));
        
        // LGPD Consents
        const lgpdConsents = await storage.getLgpdConsents(member.id);
        exportData.lgpdConsents = lgpdConsents.map(c => ({
          consentGiven: c.consentGiven,
          consentDate: c.consentDate,
          revokedDate: c.revokedDate,
          documentUrl: c.documentUrl,
        }));
      } else if (visitor) {
        // Personal data from visitors table
        exportData.personal = {
          fullName: visitor.fullName,
          phone: visitor.phone,
          email: visitor.email || null,
          address: visitor.address || null,
          hasChurch: visitor.hasChurch,
          churchOrigin: visitor.churchOrigin || null,
          firstVisitDate: visitor.firstVisitDate,
          notes: visitor.notes || null,
          lgpdConsentUrl: visitor.lgpdConsentUrl,
        };
        
        // LGPD Requests
        const lgpdRequests = await storage.getLgpdRequests(undefined, visitor.id);
        exportData.lgpdRequests = lgpdRequests.map(r => ({
          action: r.action,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
          resolvedAt: r.resolvedAt,
        }));
        
        // LGPD Consents
        const lgpdConsents = await storage.getLgpdConsents(undefined, visitor.id);
        exportData.lgpdConsents = lgpdConsents.map(c => ({
          consentGiven: c.consentGiven,
          consentDate: c.consentDate,
          revokedDate: c.revokedDate,
          documentUrl: c.documentUrl,
        }));
      }
      
      // Generate response based on format
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=dados_ipe.json");
        return res.json(exportData);
      } else if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=dados_ipe.csv");
        
        // Generate CSV from data
        let csv = "Categoria,Campo,Valor\n";
        
        if (exportData.personal) {
          Object.entries(exportData.personal).forEach(([key, value]) => {
            csv += `Dados Pessoais,${key},${value}\n`;
          });
        }
        
        if (exportData.spiritual) {
          Object.entries(exportData.spiritual).forEach(([key, value]) => {
            csv += `Dados Espirituais,${key},${value}\n`;
          });
        }
        
        if (exportData.tithes && exportData.tithes.length > 0) {
          csv += "\nDízimos\n";
          csv += "Data,Valor,Forma de Pagamento\n";
          exportData.tithes.forEach((t: any) => {
            csv += `${t.date},${t.amount},${t.paymentMethod}\n`;
          });
        }
        
        if (exportData.offerings && exportData.offerings.length > 0) {
          csv += "\nOfertas\n";
          csv += "Data,Valor,Tipo,Forma de Pagamento\n";
          exportData.offerings.forEach((o: any) => {
            csv += `${o.date},${o.amount},${o.type},${o.paymentMethod}\n`;
          });
        }
        
        return res.send(csv);
      } else if (format === "pdf") {
        // PDF generation would require a library like pdfkit or puppeteer
        // For now, return JSON with a message
        res.json({ 
          message: "PDF export is not yet implemented. Use JSON or CSV format.",
          data: exportData,
          availableFormats: ["json", "csv"],
        });
      } else {
        res.json({ 
          message: "Export available in JSON and CSV formats",
          format,
          availableFormats: ["json", "csv"],
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
