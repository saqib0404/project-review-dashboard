import express from "express";
// import helmet from "helmet";
import cookieParser from "cookie-parser";

import { prisma } from "./lib/prisma.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { requireSameOrigin } from "./middleware/csrf.js";
import { AppError } from "./lib/app-error.js";
import { projectRouter } from "./modules/projects/project.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";
import { Prisma } from "./generated/prisma/client.js";

const app = express();

app.disable("x-powered-by");
// app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

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

// Development-only database diagnostic
if (process.env.NODE_ENV !== "production") {
  app.get("/api/v1/health/database", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
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
}

app.use("/api/v1", requireSameOrigin);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/reviews", reviewRouter);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

// Centralized error handler
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    void _next;
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(error.details !== undefined ? { errors: error.details } : {}),
      });
      return;
    }

    if (error instanceof SyntaxError && "body" in error) {
      res.status(400).json({
        success: false,
        message: "Malformed JSON request",
      });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      res.status(409).json({
        success: false,
        message: "Concurrent database update detected. Reload and try again.",
      });
      return;
    }

    console.error("Unhandled API error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

export default app;
