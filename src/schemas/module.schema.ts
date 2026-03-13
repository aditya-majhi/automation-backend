import { z } from "zod";

export const createModuleSchema = z.object({
    name: z.string().min(1, "Module name is required"),
    description: z.string().optional(),
    projectId: z.string().uuid("Invalid project ID"),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;