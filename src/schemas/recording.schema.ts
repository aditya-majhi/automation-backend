import { z } from "zod";

export const createRecordingSchema = z.object({
  body: z.object({
    testCaseId: z.string().uuid(),
    steps: z.array(z.any()),
    variables: z.array(z.any()).optional().default([]),
    videoUrl: z.string().url().nullable().optional(),
  }),
});

// use only the inner body for service/controller
export type CreateRecordingInput = z.infer<
  typeof createRecordingSchema
>["body"];