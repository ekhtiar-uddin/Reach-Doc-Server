import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";

import { AdminRoutes } from "../modules/admin/admin.routes";
import { AppointmentRoutes } from "../modules/appointment/appointment.routes";
import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";
import { scheduleRoutes } from "../modules/schedule/schedule.routes";
import { SpecialtiesRoutes } from "../modules/specialties/specialties.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/schedule",
    route: scheduleRoutes,
  },
  {
    path: "/doctor-schedule",
    route: doctorScheduleRoutes,
  },

  {
    path: "/specialties",
    route: SpecialtiesRoutes,
  },
  {
    path: "/doctor",
    route: DoctorRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/patient",
    route: PatientRoutes,
  },
  {
    path: "/appointment",
    route: AppointmentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
