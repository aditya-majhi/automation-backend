import prisma from "../config/database";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

// ── User Management ───────────────────────────────────────────────────────────

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  roles?: Role[];
}

interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  isActive?: boolean;
}

export async function createUser(input: CreateUserInput) {
  const { email, password, name, roles = [] } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roles: {
        create: roles.map((role) => ({ role })),
      },
    },
    include: {
      roles: { select: { role: true } },
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: { select: { id: true, role: true } },
      projectMappings: {
        select: {
          id: true,
          projectId: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: { select: { id: true, role: true } },
      projectMappings: {
        select: {
          id: true,
          projectId: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new Error("User not found");
  }

  const data: any = {};
  if (input.email !== undefined) {
    // Check email uniqueness
    if (input.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: input.email } });
      if (emailTaken) {
        throw new Error("Email is already in use");
      }
    }
    data.email = input.email;
  }
  if (input.name !== undefined) data.name = input.name;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password !== undefined) {
    data.password = await bcrypt.hash(input.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: { select: { id: true, role: true } },
    },
  });

  return user;
}

export async function deleteUser(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new Error("User not found");
  }

  await prisma.user.delete({ where: { id: userId } });
  return { message: "User deleted successfully" };
}

// ── Role Management ───────────────────────────────────────────────────────────

export async function assignRoles(userId: string, roles: Role[]) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  // Remove existing roles
  await prisma.userRole.deleteMany({ where: { userId } });

  // Assign new roles
  if (roles.length > 0) {
    await prisma.userRole.createMany({
      data: roles.map((role) => ({ userId, role })),
      skipDuplicates: true,
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: { select: { id: true, role: true } },
    },
  });

  return updatedUser;
}

export async function getUserRoles(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: { id: true, role: true, createdAt: true },
  });

  return roles;
}

export async function addRole(userId: string, role: Role) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const existing = await prisma.userRole.findFirst({
    where: { userId, role },
  });
  if (existing) {
    throw new Error(`User already has the role: ${role}`);
  }

  const userRole = await prisma.userRole.create({
    data: { userId, role },
  });

  return userRole;
}

export async function removeRole(userId: string, role: Role) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const existing = await prisma.userRole.findFirst({
    where: { userId, role },
  });
  if (!existing) {
    throw new Error(`User does not have the role: ${role}`);
  }

  await prisma.userRole.delete({ where: { id: existing.id } });
  return { message: `Role ${role} removed from user` };
}

// ── Project-User Mapping ──────────────────────────────────────────────────────

export async function mapUserToProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const existing = await prisma.projectUser.findFirst({
    where: { projectId, userId },
  });
  if (existing) {
    throw new Error("User is already mapped to this project");
  }

  const mapping = await prisma.projectUser.create({
    data: { projectId, userId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return mapping;
}

export async function unmapUserFromProject(projectId: string, userId: string) {
  const existing = await prisma.projectUser.findFirst({
    where: { projectId, userId },
  });
  if (!existing) {
    throw new Error("User is not mapped to this project");
  }

  await prisma.projectUser.delete({ where: { id: existing.id } });
  return { message: "User removed from project" };
}

export async function getProjectUsers(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  const mappings = await prisma.projectUser.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          roles: { select: { role: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return mappings;
}

export async function getUserProjects(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  // Get projects where user is mapped OR is the owner
  const [mappedProjects, ownedProjects] = await Promise.all([
    prisma.projectUser.findMany({
      where: { userId },
      include: {
        project: {
          select: { id: true, name: true, description: true, createdAt: true },
        },
      },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, description: true, createdAt: true },
    }),
  ]);

  // Merge and deduplicate
  const projectMap = new Map<string, any>();
  for (const p of ownedProjects) {
    projectMap.set(p.id, { ...p, relation: "owner" });
  }
  for (const m of mappedProjects) {
    if (!projectMap.has(m.project.id)) {
      projectMap.set(m.project.id, { ...m.project, relation: "member" });
    }
  }

  return Array.from(projectMap.values());
}

// ── Available Roles ───────────────────────────────────────────────────────────

export function getAvailableRoles() {
  return [
    { value: "ADMIN", label: "Admin", description: "Full access to all features" },
    { value: "DEFINE_PROJECTS", label: "Define Projects", description: "Can create and configure projects, modules, test cases, and recordings" },
    { value: "EXECUTE_PROJECTS", label: "Execute Projects", description: "Can execute test cases and view execution history" },
  ];
}