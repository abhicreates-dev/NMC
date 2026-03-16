import { Router } from "express";
import { prisma } from "../config/db.js";
import { type AuthRequest, authMiddleware } from "../middleware/auth.js";
import { VALUATION } from "../config/env.js";

const ALLOWED_CATEGORIES = [
  "AI", "SaaS", "FinTech", "Web3 / Crypto", "E-commerce", "EdTech", "HealthTech",
  "Creator Economy", "Gaming", "DevTools", "ClimateTech", "AgriTech", "Logistics",
  "PropTech", "Cybersecurity", "Robotics", "SpaceTech",
] as const;
const MAX_CATEGORIES = 4;

export const startupsRouter = Router();

// POST /startups - create startup (protected)
startupsRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, categories: rawCategories, linkedinUrl, xUrl, githubUrl } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!name || !description) {
      res.status(400).json({ error: "Missing name or description" });
      return;
    }

    const categories = Array.isArray(rawCategories) ? rawCategories as string[] : [];
    if (categories.length === 0 || categories.length > MAX_CATEGORIES) {
      res.status(400).json({ error: `Choose between 1 and ${MAX_CATEGORIES} categories` });
      return;
    }
    const invalid = categories.filter((c: string) => !ALLOWED_CATEGORIES.includes(c as typeof ALLOWED_CATEGORIES[number]));
    if (invalid.length > 0) {
      res.status(400).json({ error: "Invalid category selection" });
      return;
    }

    const fundingOpenAt = new Date(Date.now() + 10 * 60 * 1000);

    const startup = await prisma.startup.create({
      data: {
        name,
        description,
        categories,
        founderId: userId,
        valuation: VALUATION,
        fundingOpenAt,
        linkedinUrl: linkedinUrl && String(linkedinUrl).trim() ? String(linkedinUrl).trim() : null,
        xUrl: xUrl && String(xUrl).trim() ? String(xUrl).trim() : null,
        githubUrl: githubUrl && String(githubUrl).trim() ? String(githubUrl).trim() : null,
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
        categories: true,
        valuation: true,
        totalRaised: true,
        fundingOpenAt: true,
        linkedinUrl: true,
        xUrl: true,
        githubUrl: true,
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
