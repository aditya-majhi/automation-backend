import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { requireAdmin } from "../middlewares/role.middleware.ts";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireAdmin());

// ── Available Roles ───────────────────────────────────────────────────────────
router.get("/roles", adminController.getAvailableRoles);

// ── User CRUD ─────────────────────────────────────────────────────────────────
router.post("/users", adminController.createUser);
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// ── Role Assignment ───────────────────────────────────────────────────────────
router.get("/users/:id/roles", adminController.getUserRoles);
router.put("/users/:id/roles", adminController.assignRoles);       // Replace all roles
router.post("/users/:id/roles", adminController.addRole);          // Add single role
router.delete("/users/:id/roles", adminController.removeRole);     // Remove single role

// ── Project-User Mapping ──────────────────────────────────────────────────────
router.get("/users/:id/projects", adminController.getUserProjects);
router.get("/projects/:projectId/users", adminController.getProjectUsers);
router.post("/projects/:projectId/users", adminController.mapUserToProject);
router.delete("/projects/:projectId/users/:userId", adminController.unmapUserFromProject);

export default router;