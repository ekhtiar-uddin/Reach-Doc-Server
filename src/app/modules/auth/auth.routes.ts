import express from "express";
import { UserRole } from "../../../../prisma/src/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.login);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword,
);

export const authRoutes = router;
