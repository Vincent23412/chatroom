import { liveData } from "../controllers/liveController.js";
import { Router } from "express";

const router = Router();

router.get("/live", liveData);

export default router;
