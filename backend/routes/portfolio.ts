import { Router } from "express";
import { prisma } from "../config/db.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

export const portfolioRouter = Router();

portfolioRouter.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            description: true,
            totalRaised: true,
            valuation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(investments);
  } catch (err) {
    console.error("Portfolio error:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch portfolio";
    res.status(500).json({ error: "Failed to fetch portfolio", details: msg });
  }
});
