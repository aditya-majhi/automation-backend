import prisma from "../config/database";
import { CreateProjectInput } from "../schemas/project.schema";

const isAdminUser = async (userId: string) => {
  const adminRole = await prisma.userRole.findFirst({
    where: { userId, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(adminRole);
};

const getProjectAccessWhere = (userId: string, isAdmin: boolean) => {
  if (isAdmin) {
    return {
      OR: [
        { userId }, // created by admin
        { projectUsers: { some: { userId } } }, // assigned to admin
      ],
    };
  }

  return {
    projectUsers: { some: { userId } }, // non-admin: only assigned
  };
};

export const createProject = async (
  input: CreateProjectInput,
  userId: string,
) => {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      userId,
    },
  });
};

export const getProjects = async (userId: string) => {
  const isAdmin = await isAdminUser(userId);

  return prisma.project.findMany({
    where: getProjectAccessWhere(userId, isAdmin),
    orderBy: { createdAt: "desc" },
  });
};

export const getProjectById = async (id: string, userId: string) => {
  const isAdmin = await isAdminUser(userId);

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...getProjectAccessWhere(userId, isAdmin),
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

export const deleteProject = async (id: string, userId: string) => {
  // Keep delete ownership-based (same as your current behavior)
  const project = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({ where: { id } });
};