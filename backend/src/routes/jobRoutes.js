import express from "express";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  sendTestReminderEmail,
} from "../controllers/jobController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createJob);
router.post("/test-email", sendTestReminderEmail);
router.get("/", getJobs);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
