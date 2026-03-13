import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { startupsRouter } from "./routes/startups.js";
import { investRouter } from "./routes/invest.js";
import { portfolioRouter } from "./routes/portfolio.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/startups", startupsRouter);
app.use("/invest", investRouter);
app.use("/portfolio", portfolioRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, version: "v2-bun-password" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const { prisma } = await import("./config/db.js");
    await prisma.user.count();
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DB health check failed:", err);
    res.status(500).json({ ok: false, error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
