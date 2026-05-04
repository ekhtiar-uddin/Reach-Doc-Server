import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { UserStatus } from "../../../../prisma/src/generated/prisma/enums";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelper } from "../../helper/jwtHelper";
import { prisma } from "../../shared/prisma";
const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }

  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelper.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_round),
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

export const AuthService = {
  login,
  refreshToken,
  changePassword,
};
