import prisma from "../config/database";
import { CreateTestCaseInput } from "../schemas/testcase.schema";

export const createTestCase = async (
    input: CreateTestCaseInput,
    userId: string
) => {
    const module = await prisma.module.findFirst({
        where: {
            id: input.moduleId,
            project: { userId },
        },
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

export const getTestCasesByModule = async (
    moduleId: string,
    userId: string
) => {
    const module = await prisma.module.findFirst({
        where: {
            id: moduleId,
            project: { userId },
        },
    });

    if (!module) {
        throw new Error("Module not found");
    }

    return prisma.testCase.findMany({
        where: { moduleId },
        orderBy: { createdAt: "desc" },
    });
};