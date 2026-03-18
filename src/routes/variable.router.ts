import { Router } from "express";
import { getVariables, getOperators } from "../controllers/variable.controller.js";

const router = Router();

router.get("/test-cases/:testCaseId/variables", getVariables);
router.get("/operators/:dataType", getOperators);

export default router;