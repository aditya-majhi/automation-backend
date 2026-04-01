import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateRecordingInput } from "../schemas/recording.schema";
import { saveSteps } from "./step.service";
import { saveVariables } from "./variable.service";

const isAdminUser = async (userId: string) => {
  const adminRole = await prisma.userRole.findFirst({
    where: { userId, role: "ADMIN" },
    select: { id: true },
  });
  return Boolean(adminRole);
};

const testCaseAccessWhere = (userId: string, isAdmin: boolean) => {
  if (isAdmin) {
    return {
      module: {
        project: {
          OR: [{ userId }, { projectUsers: { some: { userId } } }],
        },
      },
    };
  }

  return {
    module: {
      project: {
        projectUsers: { some: { userId } },
      },
    },
  };
};

export const createRecording = async (
  input: CreateRecordingInput,
  userId: string,
) => {
  const isAdmin = await isAdminUser(userId);

  const testCase = await prisma.testCase.findFirst({
    where: {
      id: input.testCaseId,
      ...testCaseAccessWhere(userId, isAdmin),
    },
    select: { id: true },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  const recording = await prisma.recording.create({
    data: {
      testCaseId: input.testCaseId,
      steps: input.steps as Prisma.InputJsonValue,
      variables: (input.variables ?? []) as Prisma.InputJsonValue,
      videoUrl: input.videoUrl ?? null,
    },
  });

  await saveSteps(recording.id, input.steps);
  await saveVariables(input.testCaseId, recording.id, input.variables ?? []);

  return prisma.recording.findUnique({
    where: { id: recording.id },
    include: {
      structuredSteps: { orderBy: { stepOrder: "asc" } },
      structuredVars: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const getRecordingsByTestCase = async (
  testCaseId: string,
  userId: string,
) => {
  const isAdmin = await isAdminUser(userId);

  const testCase = await prisma.testCase.findFirst({
    where: {
      id: testCaseId,
      ...testCaseAccessWhere(userId, isAdmin),
    },
    select: { id: true },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  return prisma.recording.findMany({
    where: { testCaseId },
    orderBy: { createdAt: "desc" },
    include: {
      structuredSteps: { orderBy: { stepOrder: "asc" } },
      structuredVars: { orderBy: { createdAt: "asc" } },
    },
  });
};