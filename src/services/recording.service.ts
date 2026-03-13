////typescript
// filepath: d:\AutomationModule\AutomationBackend\src\services\recording.service.ts
import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateRecordingInput } from "../schemas/recording.schema";

export const createRecording = async (
    input: CreateRecordingInput,
    userId: string,
) => {
    const testCase = await prisma.testCase.findFirst({
        where: {
            id: input.testCaseId,
            module: {
                project: { userId },
            },
        },
    });

    if (!testCase) {
        throw new Error("Test case not found");
    }

    return prisma.recording.create({
        data: {
            testCaseId: input.testCaseId,
            steps: input.steps as Prisma.InputJsonValue,
            variables: {
                set: (input.variables ?? []) as Prisma.InputJsonValue[],
            },
            videoUrl: input.videoUrl ?? null,
        },
    });
};

export const getRecordingsByTestCase = async (
    testCaseId: string,
    userId: string,
) => {
    const testCase = await prisma.testCase.findFirst({
        where: {
            id: testCaseId,
            module: {
                project: { userId },
            },
        },
    });

    if (!testCase) {
        throw new Error("Test case not found");
    }

    return prisma.recording.findMany({
        where: { testCaseId },
        orderBy: { createdAt: "desc" },
    });
};