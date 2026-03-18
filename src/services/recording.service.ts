import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { CreateRecordingInput } from "../schemas/recording.schema";
import { saveSteps } from "./step.service";
import { saveVariables } from "./variable.service";

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

    const recording = await prisma.recording.create({
        data: {
            testCaseId: input.testCaseId,
            steps: input.steps as Prisma.InputJsonValue,
            variables: (input.variables ?? []) as Prisma.InputJsonValue,
            videoUrl: input.videoUrl ?? null,
        },
    });

    // Persist steps to the Step table for structured querying
    await saveSteps(recording.id, input.steps);

    // Persist variables to the Variable table for the Design UI
    await saveVariables(input.testCaseId, recording.id, input.variables ?? []);

    // Return recording with related data
    // Use relation names (structuredSteps, structuredVars) — NOT the JSON scalar fields (steps, variables)
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
        include: {
            structuredSteps: { orderBy: { stepOrder: "asc" } },
            structuredVars: { orderBy: { createdAt: "asc" } },
        },
    });
};