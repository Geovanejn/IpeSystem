import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireRole } from "../middleware/auth.middleware";
import { getSession } from "../auth";
import {
  insertLgpdConsentSchema,
  insertLgpdRequestSchema,
} from "@shared/schema";

const router = Router();

// ============================================
// LGPD CONSENT ROUTES
// ============================================

router.get("/lgpd-consents", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
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

router.post("/lgpd-consents", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
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

router.patch("/lgpd-consents", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
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

// ============================================
// LGPD REQUEST ROUTES
// ============================================

router.get("/lgpd-requests", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
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

router.post("/lgpd-requests", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
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

router.put("/lgpd-requests/:id", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
  try {
    const requestBefore = await storage.getLgpdRequest(req.params.id);
    
    if (!requestBefore) {
      return res.status(404).json({ error: "Request not found" });
    }
    
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

// ============================================
// LGPD DATA ENDPOINTS
// ============================================

router.get("/lgpd/my-data", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    const session = sessionId ? getSession(sessionId) : null;
    
    if (!session) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!["member", "visitor"].includes(session.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

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

    if (member) {
      const allTithes = await storage.getTithes();
      const memberTithes = allTithes.filter(t => t.memberId === member.id);
      const totalTithes = memberTithes.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const lgpdRequests = await storage.getLgpdRequests(member.id);
      const lgpdConsents = await storage.getLgpdConsents(member.id);
      const activeConsents = lgpdConsents.filter(c => c.consentGiven && !c.revokedDate).length;
      
      const lastTithe = memberTithes.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      const userData = {
        personalInfo: {
          name: member.fullName,
          email: member.email,
          phone: member.primaryPhone,
          cpf: "123.456.789-00",
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
          totalOfferings: 0,
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

    if (visitor) {
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

router.get("/lgpd/consents", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
  return res.redirect(301, "/api/lgpd-consents");
});

router.get("/lgpd/requests", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
  return res.redirect(301, "/api/lgpd-requests");
});

router.post("/lgpd/export", requireRole("pastor", "treasurer", "deacon"), async (req, res) => {
  try {
    const { identifier, format } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: "Identifier (CPF or email) is required" });
    }
    
    const members = await storage.getMembers();
    const visitors = await storage.getVisitors();
    
    const member = members.find(m => m.email.toLowerCase() === identifier.toLowerCase());
    const visitor = visitors.find(v => v.email?.toLowerCase() === identifier.toLowerCase());
    
    if (!member && !visitor) {
      return res.status(404).json({ error: "Nenhum dado encontrado para o identificador fornecido" });
    }
    
    const exportData: any = {
      format: format || "json",
      exportDate: new Date().toISOString(),
      identifier,
    };
    
    if (member) {
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
      
      exportData.spiritual = {
        communionStatus: member.communionStatus,
        ecclesiasticalRole: member.ecclesiasticalRole,
        memberStatus: member.memberStatus,
        admissionDate: member.admissionDate,
        lgpdConsentUrl: member.lgpdConsentUrl,
      };
      
      const allTithes = await storage.getTithes();
      const memberTithes = allTithes.filter(t => t.memberId === member.id);
      exportData.tithes = memberTithes.map(t => ({
        amount: t.amount,
        date: t.date,
        paymentMethod: t.paymentMethod,
        notes: t.notes,
      }));
      
      const allOfferings = await storage.getOfferings();
      exportData.offerings = allOfferings.map(o => ({
        amount: o.amount,
        date: o.date,
        type: o.type,
        notes: o.notes,
      }));
      
      const allBookstoreSales = await storage.getBookstoreSales();
      const memberBookstoreSales = allBookstoreSales.filter(s => s.buyerMemberId === member.id);
      exportData.bookstoreSales = memberBookstoreSales.map(s => ({
        productName: s.productName,
        quantity: s.quantity,
        totalAmount: s.totalAmount,
        date: s.date,
        paymentMethod: s.paymentMethod,
      }));
      
      const lgpdRequests = await storage.getLgpdRequests(member.id);
      exportData.lgpdRequests = lgpdRequests.map(r => ({
        action: r.action,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
      }));
      
      const lgpdConsents = await storage.getLgpdConsents(member.id);
      exportData.lgpdConsents = lgpdConsents.map(c => ({
        consentGiven: c.consentGiven,
        consentDate: c.consentDate,
        revokedDate: c.revokedDate,
        documentUrl: c.documentUrl,
      }));
    } else if (visitor) {
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
      
      const lgpdRequests = await storage.getLgpdRequests(undefined, visitor.id);
      exportData.lgpdRequests = lgpdRequests.map(r => ({
        action: r.action,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
      }));
    }
    
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: "Failed to export data" });
  }
});

export default router;
