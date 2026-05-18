import { UserRole } from "../../../prisma/src/generated/prisma/enums";

export type IAuthUser = {
  email: string;
  role: UserRole;
} | null;
