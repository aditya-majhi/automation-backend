import { Router } from "express";
import * as setupController from "../controllers/setup.controller";

const router = Router();

// No auth required — self-locks after first admin is created
router.get("/status", setupController.checkSetupStatus);
router.post("/admin", setupController.setupAdmin);

export default router;