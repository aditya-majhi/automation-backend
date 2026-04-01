import prisma from "../config/database";
import { CreateModuleInput } from "../schemas/module.schema";

const isAdminUser = async (userId: string) => {
  const adminRole = await prisma.userRole.findFirst({
    where: { userId, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(adminRole);
};

const hasProjectAccess = async (projectId: string, userId: string) => {
  const isAdmin = await isAdminUser(userId);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin
        ? {
            OR: [{ userId }, { projectUsers: { some: { userId } } }],
          }
        : {
            projectUsers: { some: { userId } },
          }),
    },
    select: { id: true },
  });

  return Boolean(project);
};

export const createModule = async (
  input: CreateModuleInput,
  userId: string,
) => {
  const allowed = await hasProjectAccess(input.projectId, userId);

  if (!allowed) {
    throw new Error("Project not found");
  }

  return prisma.module.create({
    data: {
      name: input.name,
      description: input.description,
      projectId: input.projectId,
    },
  });
};

export const getModulesByProject = async (projectId: string, userId: string) => {
  const allowed = await hasProjectAccess(projectId, userId);

  if (!allowed) {
    throw new Error("Project not found");
  }

  return prisma.module.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
};