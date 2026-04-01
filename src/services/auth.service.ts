// d:\AutomationModule\AutomationBackend\src\services\auth.service.ts
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { signToken } from "../utils/jwt";

const getDefaultRole = async (): Promise<Role> => {
  const adminExists = await prisma.userRole.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return adminExists ? "EXECUTE_PROJECTS" : "ADMIN";
};

const ensureUserHasRole = async (userId: string): Promise<string[]> => {
  const existingRoles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });

  if (existingRoles.length > 0) {
    return existingRoles.map((r) => r.role);
  }

  const fallbackRole = await getDefaultRole();

  await prisma.userRole.createMany({
    data: [{ userId, role: fallbackRole }],
    skipDuplicates: true,
  });

  const updatedRoles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });

  return updatedRoles.map((r) => r.role);
};

export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const defaultRole = await getDefaultRole();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roles: {
        create: [{ role: defaultRole }],
      },
    },
    include: {
      roles: { select: { role: true } },
    },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((r) => r.role),
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: { select: { role: true } },
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated. Contact your administrator.");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const roles = await ensureUserHasRole(user.id);
  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
    },
  };
};