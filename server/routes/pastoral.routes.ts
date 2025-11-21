import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireRole } from "../middleware/auth.middleware";
import { hashPassword, getSession } from "../auth";
import {
  insertMemberSchema,
  insertSeminarianSchema,
  insertCatechumenSchema,
} from "@shared/schema";

const router = Router();

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

/**
 * GET /api/users
 * Lista todos os usuários (sem senhas)
 */
router.get("/users", requireRole("pastor"), async (req, res) => {
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

/**
 * POST /api/users
 * Cria novo usuário
 */
router.post("/users", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
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

/**
 * PUT /api/users/:id
 * Atualiza usuário existente
 */
router.put("/users/:id", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
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

/**
 * DELETE /api/users/:id
 * Remove usuário
 */
router.delete("/users/:id", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
    
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

/**
 * GET /api/members
 * Lista todos os membros
 */
router.get("/members", requireRole("pastor"), async (req, res) => {
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

/**
 * GET /api/members/:id
 * Busca membro por ID
 */
router.get("/members/:id", requireRole("pastor"), async (req, res) => {
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

/**
 * POST /api/members
 * Cria novo membro
 */
router.post("/members", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
    const validated = insertMemberSchema.parse(req.body);
    const member = await storage.createMember(validated);
    
    // Create audit log
    await storage.createAuditLog({
      userId: session.userId,
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

/**
 * PUT /api/members/:id
 * Atualiza membro existente
 */
router.put("/members/:id", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
    const validated = insertMemberSchema.partial().parse(req.body);
    
    // Buscar membro antes da atualização para audit log (requisito LGPD)
    const memberBefore = await storage.getMember(req.params.id);
    
    if (!memberBefore) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    const member = await storage.updateMember(req.params.id, validated);
    
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // Create audit log com changesBefore e changesAfter
    await storage.createAuditLog({
      userId: session.userId,
      action: "UPDATE",
      tableName: "members",
      recordId: member.id,
      changesBefore: JSON.stringify(memberBefore),
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

/**
 * DELETE /api/members/:id
 * Remove membro
 */
router.delete("/members/:id", requireRole("pastor"), async (req, res) => {
  try {
    const session = (req as any).session;
    const success = await storage.deleteMember(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // Create audit log
    await storage.createAuditLog({
      userId: session.userId,
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

/**
 * GET /api/seminarians
 * Lista todos os seminaristas
 */
router.get("/seminarians", requireRole("pastor"), async (req, res) => {
  try {
    const seminarians = await storage.getSeminarians();
    res.json(seminarians);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seminarians" });
  }
});

/**
 * POST /api/seminarians
 * Cria novo seminarista
 */
router.post("/seminarians", requireRole("pastor"), async (req, res) => {
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

/**
 * PUT /api/seminarians/:id
 * Atualiza seminarista existente
 */
router.put("/seminarians/:id", requireRole("pastor"), async (req, res) => {
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

/**
 * DELETE /api/seminarians/:id
 * Remove seminarista
 */
router.delete("/seminarians/:id", requireRole("pastor"), async (req, res) => {
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

/**
 * GET /api/catechumens
 * Lista todos os catecúmenos
 */
router.get("/catechumens", requireRole("pastor"), async (req, res) => {
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

/**
 * POST /api/catechumens
 * Cria novo catecúmeno (cria membro automaticamente se status = "concluido")
 */
router.post("/catechumens", requireRole("pastor"), async (req, res) => {
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

/**
 * PUT /api/catechumens/:id
 * Atualiza catecúmeno (cria membro automaticamente se mudou para status = "concluido")
 */
router.put("/catechumens/:id", requireRole("pastor"), async (req, res) => {
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

/**
 * DELETE /api/catechumens/:id
 * Remove catecúmeno
 */
router.delete("/catechumens/:id", requireRole("pastor"), async (req, res) => {
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

export default router;
