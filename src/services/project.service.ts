import prisma from "../config/database";
import { CreateProjectInput } from "../schemas/project.schema";

export const createProject = async (
    input: CreateProjectInput,
    userId: string
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
    return prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};

export const getProjectById = async (id: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: { id, userId },
        include: { modules: true },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    return project;
};

export const deleteProject = async (id: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: { id, userId },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    await prisma.project.delete({ where: { id } });
};