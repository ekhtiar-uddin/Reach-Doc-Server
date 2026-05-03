import { addHours, addMinutes, format } from "date-fns";
import { Prisma } from "../../../../prisma/src/generated/prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
const insertIntoDB = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;

  console.log("payload", payload);

  const intervalTime = 30;
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]), // 11:00
        ),
        Number(startTime.split(":")[1]),
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]), // 11:00
        ),
        Number(endTime.split(":")[1]),
      ),
    );

    // console.log("startDateTime", startDateTime);
    // console.log("endDateTime", endDateTime);

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime; // 10:30
      const slotEndDateTime = addMinutes(startDateTime, intervalTime); // 11:00

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      // console.log("scheduleData", scheduleData);

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime,
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // return schedules;
  return;
};

const schedulesForDoctor = async (
  user: IJWTPayload,
  fillters: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } =
    fillters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (filterStartDateTime && filterEndDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: filterStartDateTime,
          },
        },
        {
          endDateTime: {
            lte: filterEndDateTime,
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const doctorSchedulesIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId,
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  // to write static way
  //   const result = await prisma.schedule.findMany({
  //   where: {
  //     AND: [
  //       {
  //         AND: [
  //           {
  //             startDateTime: {
  //               gte: new Date("2026-10-10T10:00:00.000Z"),
  //             },
  //           },
  //           {
  //             endDateTime: {
  //               lte: new Date("2026-10-10T17:00:00.000Z"),
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   skip: 0,
  //   take: 10,
  //   orderBy: {
  //     startDateTime: "asc",
  //   },
  // });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const deleteScheduleFromDB = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};

// 59-8 Creating Doctor Schedule – Part 1
export const ScheduleService = {
  insertIntoDB,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
