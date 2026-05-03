import express from "express";
import { UserRole } from "../../../../prisma/src/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { ScheduleController } from "./schedule.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.DOCTOR),
  ScheduleController.schedulesForDoctor,
);
router.post("/", auth(UserRole.ADMIN), ScheduleController.insertIntoDB);
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  ScheduleController.deleteScheduleFromDB,
);
export const scheduleRoutes = router;
