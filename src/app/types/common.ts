import { UserRole } from "../../../prisma/src/generated/prisma/enums";

export type IJWTPayload = {
  email: string;
  role: UserRole;
};
