import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { Role } from "@prisma/client";

/**
 * Middleware: requires the authenticated user to have at least one of the specified roles.
 * Must be used AFTER auth middleware (req.user.userId must exist).
 */
export function requireRole(...requiredRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        select: { role: true },
      });

      const roleSet = new Set(userRoles.map((ur) => ur.role));

      // ADMIN always has access
      if (roleSet.has("ADMIN")) {
        next();
        return;
      }

      const hasRequiredRole = requiredRoles.some((r) => roleSet.has(r));
      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${requiredRoles.join(", ")}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("[RoleMiddleware] Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

/**
 * Middleware: requires the authenticated user to be an ADMIN.
 */
export function requireAdmin() {
  return requireRole("ADMIN" as Role);
}

/**
 * Middleware: requires the user to have access to the project.
 * Checks if user is ADMIN, project owner, or mapped to the project.
 */
export function requireProjectAccess() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      // Extract projectId from params or body
      const projectId =
        req.params.projectId ||
        req.params.id ||
        req.body?.projectId;

      if (!projectId) {
        // If no projectId in request, let the route handler deal with it
        next();
        return;
      }

      // Check if user is ADMIN
      const adminRole = await prisma.userRole.findFirst({
        where: { userId, role: "ADMIN" },
      });
      if (adminRole) {
        next();
        return;
      }

      // Check if user is project owner
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (project) {
        next();
        return;
      }

      // Check if user is mapped to this project
      const mapping = await prisma.projectUser.findFirst({
        where: { projectId, userId },
      });
      if (mapping) {
        next();
        return;
      }

      res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      });
    } catch (error) {
      console.error("[ProjectAccessMiddleware] Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}