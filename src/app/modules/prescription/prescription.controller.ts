import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const result = await PrescriptionService.createPrescription(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Prescription created successfully!",
      data: result,
    });
  },
);

export const PrescriptionController = {
  createPrescription,
};
