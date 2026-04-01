import prisma from "../config/database";
import { CreateTestCaseInput } from "../schemas/testcase.schema";

const isAdminUser = async (userId: string) => {
  const adminRole = await prisma.userRole.findFirst({
    where: { userId, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(adminRole);
};

const moduleAccessWhere = (userId: string, isAdmin: boolean) => {
  if (isAdmin) {
    return {
      project: {
        OR: [{ userId }, { projectUsers: { some: { userId } } }],
      },
    };
  }

  return {
    project: {
      projectUsers: { some: { userId } },
    },
  };
};

export const createTestCase = async (
  input: CreateTestCaseInput,
  userId: string,
) => {
  const isAdmin = await isAdminUser(userId);

  const module = await prisma.module.findFirst({
    where: {
      id: input.moduleId,
      ...moduleAccessWhere(userId, isAdmin),
    },
    select: { id: true },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  return prisma.testCase.create({
    data: {
      name: input.name,
      description: input.description,
      moduleId: input.moduleId,
    },
  });
};

export const getTestCasesByModule = async (moduleId: string, userId: string) => {
  const isAdmin = await isAdminUser(userId);

  const module = await prisma.module.findFirst({
    where: {
      id: moduleId,
      ...moduleAccessWhere(userId, isAdmin),
    },
    select: { id: true },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  return prisma.testCase.findMany({
    where: { moduleId },
    orderBy: { createdAt: "desc" },
  });
};