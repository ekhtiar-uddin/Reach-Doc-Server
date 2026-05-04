import express from "express";
import { UserRole } from "../../../../prisma/src/generated/prisma/client";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post("/", auth(UserRole.DOCTOR), ReviewController.insertIntoDB);

export const ReviewRoutes = router;
