import { Prescription } from "../../../../prisma/src/generated/prisma/client";
import { IJWTPayload } from "../../types/common";

const createPrescription = async (
  user: IJWTPayload,
  payload: Partial<Prescription>,
) => {
  console.log("payload", payload);
};

export const PrescriptionService = {
  createPrescription,
};
