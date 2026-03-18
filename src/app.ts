import express from "express";
import cors from "cors";
import path from "path";
import { authenticate } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import testCaseRoutes from "./routes/testcase.routes.js";
import recordingRoutes from "./routes/recording.routes.js";
import variableRoutes from "./routes/variable.router.js";

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

// ── Routes ──
app.use("/auth", authRoutes);
app.use("/projects", authenticate, projectRoutes);
app.use("/modules", authenticate, moduleRoutes);
app.use("/testcases", authenticate, testCaseRoutes);
app.use("/recordings", authenticate, recordingRoutes);
app.use("/variables", authenticate, variableRoutes);

app.use(errorHandler);

export default app;