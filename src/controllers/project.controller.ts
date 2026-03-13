import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createProjectSchema } from "../schemas/project.schema";
import {
    createProject,
    getProjects,
    getProjectById,
    deleteProject,
} from "../services/project.service";
import { sendSuccess, sendError } from "../utils/response";

export const create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = createProjectSchema.parse(req.body);
        const project = await createProject(input, req.user!.userId);
        sendSuccess(res, project, "Project created successfully", 201);
    } catch (err) {
        next(err);
    }
};

export const getAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const projects = await getProjects(req.user!.userId);
        sendSuccess(res, projects, "Projects fetched successfully");
    } catch (err) {
        next(err);
    }
};

export const getOne = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const project = await getProjectById(req.params.id, req.user!.userId);
        sendSuccess(res, project, "Project fetched successfully");
    } catch (err) {
        if (err instanceof Error && err.message === "Project not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};

export const remove = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await deleteProject(req.params.id, req.user!.userId);
        sendSuccess(res, null, "Project deleted successfully");
    } catch (err) {
        if (err instanceof Error && err.message === "Project not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};