import { Router } from "express";
import { create, getAll, getOne, remove } from "../controllers/project.controller";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;