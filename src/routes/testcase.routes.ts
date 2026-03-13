import { Router } from "express";
import { create, getByModule } from "../controllers/testcase.controller";

const router = Router();

router.post("/", create);
router.get("/:moduleId", getByModule);

export default router;