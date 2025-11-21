import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireRole } from "../middleware/auth.middleware";
import {
  insertVisitorSchema,
  insertDiaconalHelpSchema,
  insertBulletinSchema,
} from "@shared/schema";

const router = Router();

// ============================================
// VISITORS ROUTES (Deacon - CRUD, Pastor - Read Only)
// ============================================

router.get("/visitors", requireRole("pastor", "deacon"), async (req, res) => {
  try {
    const visitors = await storage.getVisitors();
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

router.get("/visitors/:id", requireRole("pastor", "deacon"), async (req, res) => {
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

router.post("/visitors", requireRole("deacon"), async (req, res) => {
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

router.put("/visitors/:id", requireRole("deacon"), async (req, res) => {
  try {
    const visitorBefore = await storage.getVisitor(req.params.id);
    
    if (!visitorBefore) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
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

router.delete("/visitors/:id", requireRole("deacon"), async (req, res) => {
  try {
    const visitorBefore = await storage.getVisitor(req.params.id);
    
    if (!visitorBefore) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
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
// DIACONAL HELP ROUTES (Deacon)
// ============================================

router.get("/diaconal-help", requireRole("pastor", "deacon"), async (req, res) => {
  try {
    const helps = await storage.getDiaconalHelps();
    res.json(helps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch diaconal helps" });
  }
});

router.post("/diaconal-help", requireRole("deacon"), async (req, res) => {
  try {
    const validated = insertDiaconalHelpSchema.parse(req.body);
    const help = await storage.createDiaconalHelp(validated);
    res.status(201).json(help);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create diaconal help" });
  }
});

router.patch("/diaconal-help/:id", requireRole("deacon"), async (req, res) => {
  try {
    const helpBefore = await storage.getDiaconalHelp(req.params.id);
    
    if (!helpBefore) {
      return res.status(404).json({ error: "Diaconal help not found" });
    }
    
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

router.delete("/diaconal-help/:id", requireRole("deacon"), async (req, res) => {
  try {
    const helpBefore = await storage.getDiaconalHelp(req.params.id);
    
    if (!helpBefore) {
      return res.status(404).json({ error: "Diaconal help not found" });
    }
    
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

router.get("/bulletins", requireRole("pastor", "deacon"), async (req, res) => {
  try {
    const bulletins = await storage.getBulletins();
    res.json(bulletins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bulletins" });
  }
});

router.get("/bulletins/:id", requireRole("pastor", "deacon"), async (req, res) => {
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

router.post("/bulletins", requireRole("deacon"), async (req, res) => {
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

router.put("/bulletins/:id", requireRole("deacon"), async (req, res) => {
  try {
    const bulletinBefore = await storage.getBulletin(req.params.id);
    
    if (!bulletinBefore) {
      return res.status(404).json({ error: "Bulletin not found" });
    }
    
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

router.delete("/bulletins/:id", requireRole("deacon"), async (req, res) => {
  try {
    const bulletinBefore = await storage.getBulletin(req.params.id);
    
    if (!bulletinBefore) {
      return res.status(404).json({ error: "Bulletin not found" });
    }
    
    const success = await storage.deleteBulletin(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: "Bulletin not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bulletin" });
  }
});

export default router;
