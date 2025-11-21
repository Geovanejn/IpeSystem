import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireRole } from "../middleware/auth.middleware";
import {
  insertTitheSchema,
  insertOfferingSchema,
  insertBookstoreSaleSchema,
  insertLoanSchema,
  insertExpenseSchema,
} from "@shared/schema";

const router = Router();

// ============================================
// TITHES ROUTES (Treasurer)
// ============================================

router.get("/tithes", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
    const tithes = await storage.getTithes();
    res.json(tithes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tithes" });
  }
});

router.post("/tithes", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.delete("/tithes/:id", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.get("/offerings", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
    const offerings = await storage.getOfferings();
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch offerings" });
  }
});

router.post("/offerings", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.delete("/offerings/:id", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.get("/bookstore-sales", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
    const sales = await storage.getBookstoreSales();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookstore sales" });
  }
});

router.post("/bookstore-sales", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.get("/loans", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
    const loans = await storage.getLoans();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

router.post("/loans", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.patch("/loans/:id", requireRole("pastor", "treasurer"), async (req, res) => {
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
      const allExpenses = await storage.getExpenses();
      const loanExpenses = allExpenses.filter(e => e.loanId === req.params.id);
      
      for (const expense of loanExpenses) {
        await storage.deleteExpense(expense.id);
      }
      
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

router.delete("/loans/:id", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.get("/expenses", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.post("/expenses", requireRole("pastor", "treasurer"), async (req, res) => {
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

router.patch("/expenses/:id", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
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

router.delete("/expenses/:id", requireRole("pastor", "treasurer"), async (req, res) => {
  try {
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

export default router;
