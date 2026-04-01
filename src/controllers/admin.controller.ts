import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { Role } from "@prisma/client";

const VALID_ROLES: Role[] = ["ADMIN", "DEFINE_PROJECTS", "EXECUTE_PROJECTS"];

function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role);
}

// ── User Management ───────────────────────────────────────────────────────────

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, roles } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: "email, password, and name are required",
      });
      return;
    }

    // Validate roles if provided
    if (roles && Array.isArray(roles)) {
      for (const r of roles) {
        if (!isValidRole(r)) {
          res.status(400).json({
            success: false,
            message: `Invalid role: ${r}. Valid roles: ${VALID_ROLES.join(", ")}`,
          });
          return;
        }
      }
    }

    const user = await adminService.createUser({
      email,
      password,
      name,
      roles: roles || [],
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    const status = error.message?.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { email, name, password, isActive } = req.body;
    const user = await adminService.updateUser(id, { email, name, password, isActive });
    res.json({ success: true, data: user });
  } catch (error: any) {
    const status = error.message?.includes("not found")
      ? 404
      : error.message?.includes("already in use")
        ? 409
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

// ── Role Management ───────────────────────────────────────────────────────────

export async function assignRoles(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      res.status(400).json({
        success: false,
        message: "roles must be an array",
      });
      return;
    }

    for (const r of roles) {
      if (!isValidRole(r)) {
        res.status(400).json({
          success: false,
          message: `Invalid role: ${r}. Valid roles: ${VALID_ROLES.join(", ")}`,
        });
        return;
      }
    }

    const result = await adminService.assignRoles(id, roles);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function getUserRoles(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const roles = await adminService.getUserRoles(id);
    res.json({ success: true, data: roles });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function addRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !isValidRole(role)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${VALID_ROLES.join(", ")}`,
      });
      return;
    }

    const result = await adminService.addRole(id, role);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found")
      ? 404
      : error.message?.includes("already has")
        ? 409
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function removeRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !isValidRole(role)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${VALID_ROLES.join(", ")}`,
      });
      return;
    }

    const result = await adminService.removeRole(id, role);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found") || error.message?.includes("does not have")
      ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

// ── Project-User Mapping ──────────────────────────────────────────────────────

export async function mapUserToProject(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId is required",
      });
      return;
    }

    const result = await adminService.mapUserToProject(projectId, userId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found")
      ? 404
      : error.message?.includes("already mapped")
        ? 409
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function unmapUserFromProject(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, userId } = req.params;
    const result = await adminService.unmapUserFromProject(projectId, userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not mapped") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function getProjectUsers(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const users = await adminService.getProjectUsers(projectId);
    res.json({ success: true, data: users });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

export async function getUserProjects(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const projects = await adminService.getUserProjects(id);
    res.json({ success: true, data: projects });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

// ── Available Roles ───────────────────────────────────────────────────────────

export async function getAvailableRoles(req: Request, res: Response): Promise<void> {
  try {
    const roles = adminService.getAvailableRoles();
    res.json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}