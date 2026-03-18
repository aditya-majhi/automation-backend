import { z } from "zod";

export const createRecordingSchema = z.object({
  body: z.object({
    testCaseId: z.string().uuid(),
    steps: z.array(z.any()),
    variables: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      kind: z.enum(["input", "output"]),
      selector: z.object({
        css: z.string().nullable().optional(),
        xpath: z.string().nullable().optional(),
        relativeXPath: z.string().nullable().optional(),
      }).optional(),
      value: z.any().nullable().optional(),
      dataType: z.string().optional(),
      context: z.any().optional(),
      enumValues: z.any().nullable().optional(),
      targetTag: z.string().nullable().optional(),
      inputType: z.string().nullable().optional(),
      pageUrl: z.string().nullable().optional(),
      pageTitle: z.string().nullable().optional(),
      createdAt: z.string().optional(),
    })).optional().default([]),
    videoUrl: z.string().url().nullable().optional(),
  }),
});

export type CreateRecordingInput = z.infer<typeof createRecordingSchema>["body"];