import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { createRecordingSchema } from "../schemas/recording.schema";
import {
    createRecording,
    getRecordingsByTestCase,
} from "../services/recording.service";
import { sendSuccess, sendError } from "../utils/response";

export const create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { body } = createRecordingSchema.parse({ body: req.body });

        const recording = await createRecording(body, req.user!.userId);

        sendSuccess(res, recording, "Recording created successfully", 201);
    } catch (err) {
        next(err);
    }
};

export const getByTestCase = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recordings = await getRecordingsByTestCase(
            req.params.testCaseId,
            req.user!.userId
        );
        sendSuccess(res, recordings, "Recordings fetched successfully");
    } catch (err) {
        if (err instanceof Error && err.message === "Test case not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};

export const uploadVideo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.file) {
            sendError(res, "No video file provided", 400);
            return;
        }

        const videoUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;

        sendSuccess(res, { videoUrl }, "Video uploaded successfully", 201);
    } catch (err) {
        next(err);
    }
};