import { Router } from "express";
import { create, getByTestCase, uploadVideo } from "../controllers/recording.controller.js";
import { videoUpload } from "../services/upload.service.js";

const router = Router();

router.post("/upload-video", videoUpload.single("video"), uploadVideo);
router.post("/", create);
router.get("/:testCaseId", getByTestCase);

export default router;