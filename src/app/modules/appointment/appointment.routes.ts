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

export const AppointmentRoutes = router;
