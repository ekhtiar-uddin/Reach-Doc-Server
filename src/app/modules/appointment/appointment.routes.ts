import express from "express";
import { UserRole } from "../../../../prisma/src/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment,
);

router.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointment,
);

router.patch(
  "/status/:id",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentController.updateAppointmentStatus,
);

export const AppointmentRoutes = router;
