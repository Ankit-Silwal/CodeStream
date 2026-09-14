import { Router } from "express";
import {
  createExamController,
  getExamController,
  importLeetCodeController,
  listExamsController,
  submitAttemptController,
} from "./exam.controller.js";

const router = Router();

router.get("/", listExamsController);
router.post("/", createExamController);
router.post("/import/leetcode", importLeetCodeController);
router.get("/:examId", getExamController);
router.post("/:examId/submit", submitAttemptController);

export default router;
