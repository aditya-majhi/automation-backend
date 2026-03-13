import prisma from "../config/database";
import { CreateModuleInput } from "../schemas/module.schema";

export const createModule = async (
    input: CreateModuleInput,
    userId: string
) => {
    const project = await prisma.project.findFirst({
        where: { id: input.projectId, userId },
    });

    if (!project) {
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

export const getModulesByProject = async (
    projectId: string,
    userId: string
) => {
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    return prisma.module.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
    });
};