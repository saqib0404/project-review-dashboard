import express from "express";
import helmet from "helmet";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(express.json({ limit: "100kb" }));

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

// Handle unknown routes.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
