import express from "express";
import cors from "cors";
import path from "path";
import { authenticate } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

import setupRoutes from "./routes/setup.routes";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import moduleRoutes from "./routes/module.routes";
import testCaseRoutes from "./routes/testcase.routes";
import recordingRoutes from "./routes/recording.routes";
import variableRoutes from "./routes/variable.router";
import adminRoutes from "./routes/admin.routes";

const app = express();

(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

// ── CORS ──
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded videos ──
app.use("/uploads", express.static(path.resolve("uploads")));

// ── Health ──
app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ── Setup ──
app.use("/api/setup", setupRoutes);

// ── Routes ──
app.use("/auth", authRoutes);
app.use("/projects", authenticate, projectRoutes);
app.use("/modules", authenticate, moduleRoutes);
app.use("/testcases", authenticate, testCaseRoutes);
app.use("/recordings", authenticate, recordingRoutes);
app.use("/variables", authenticate, variableRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;