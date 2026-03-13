import { Router } from "express";
import { prisma } from "../config/db.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { VALUATION } from "../config/env.js";

export const startupsRouter = Router();

// POST /startups - create startup (protected)
startupsRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!name || !description) {
      res.status(400).json({ error: "Missing name or description" });
      return;
    }

    const fundingOpenAt = new Date(Date.now() + 10 * 60 * 1000);

    const startup = await prisma.startup.create({
      data: {
        name,
        description,
        founderId: userId,
        valuation: VALUATION,
        fundingOpenAt,
      },
    });

    res.status(201).json(startup);
  } catch (err) {
    console.error("Create startup error:", err);
    const msg = err instanceof Error ? err.message : "Failed to create startup";
    res.status(500).json({ error: "Failed to create startup", details: msg });
  }
});

// GET /startups - list all
startupsRouter.get("/", async (_req, res) => {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        valuation: true,
        totalRaised: true,
        fundingOpenAt: true,
      },
    });
    res.json(startups);
  } catch (err) {
    console.error("Fetch startups error:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch startups";
    res.status(500).json({ error: "Failed to fetch startups", details: msg });
  }
});

// GET /startups/:id - single startup with investors
startupsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        founder: {
          select: { id: true, name: true, email: true },
        },
        investments: {
          include: {
            investor: {
              select: { id: true, name: true, walletAddress: true },
            },
          },
        },
      },
    });

    if (!startup) {
      res.status(404).json({ error: "Startup not found" });
      return;
    }

    res.json(startup);
  } catch (err) {
    console.error("Fetch startup error:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch startup";
    res.status(500).json({ error: "Failed to fetch startup", details: msg });
  }
});
