import { z } from "zod";

export const createTestCaseSchema = z.object({
    name: z.string().min(1, "Test case name is required"),
    description: z.string().optional(),
    moduleId: z.string().uuid("Invalid module ID"),
});

export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;