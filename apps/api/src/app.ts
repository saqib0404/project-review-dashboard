import express from "express";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// Public health endpoint.
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ProjectFlow API is healthy",
    data: {
      service: "projectflow-api",
      status: "ok",
    },
  });
});

// Development database readiness check.
app.get("/api/v1/health/database", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection healthy",
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
