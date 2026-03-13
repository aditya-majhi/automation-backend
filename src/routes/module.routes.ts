import { Router } from "express";
import { create, getByProject } from "../controllers/module.controller";

const router = Router();

router.post("/", create);
router.get("/:projectId", getByProject);

export default router;