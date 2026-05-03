import { Request, Response } from "express";

import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(
      user as IJWTPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appointment create successfully",
      data: result,
    });
  },
);

export const AppointmentController = {
  createAppointment,
};
