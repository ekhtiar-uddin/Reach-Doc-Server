import {
  Prisma,
  UserRole,
} from "../../../../prisma/src/generated/prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";

// এই function টা Doctor এবং Patient দুইজনের জন্যই কাজ করে
// JWT token থেকে আসা user দেখে বুঝে নেয় কে request করছে
// এবং সেই অনুযায়ী শুধু তার appointments দেখায়

const getMyAppointment = async (
  user: IJWTPayload, // JWT থেকে আসা → { email: "dr@gmail.com", role: "DOCTOR" }
  filters: any, // req.query থেকে আসা filter values → { status: "SCHEDULED" }
  options: IOptions, // req.query থেকে আসা → { page: "1", limit: "10", sortBy: "createdAt" }
) => {
  // ─────────────────────────────────────────────────────────────
  // STEP 1: Pagination values বের করা
  // ─────────────────────────────────────────────────────────────
  //   page      = 1
  //   limit     = 10
  //   skip      = 0   → (page-1) * limit
  //   sortBy    = "createdAt"
  //   sortOrder = "desc"
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: filterData বের করা
  // ─────────────────────────────────────────────────────────────
  // filters = { status: "SCHEDULED" } হলে
  // filterData = { status: "SCHEDULED" }
  //
  // এখানে searchTerm নেই, তাই সরাসরি spread করা হয়েছে
  // পুরো filters-ই filterData হয়ে যায়
  const { ...filterData } = filters;

  // ─────────────────────────────────────────────────────────────
  // STEP 3: andConditions array শুরু করা (শুরুতে খালি)
  // ─────────────────────────────────────────────────────────────
  // এখন: andConditions = []
  const andConditions: Prisma.AppointmentWhereInput[] = [];

  // ─────────────────────────────────────────────────────────────
  // STEP 4: User এর role দেখে নিজের data restrict করা ★ KEY LOGIC ★
  // ─────────────────────────────────────────────────────────────
  // এটাই এই function এর মূল বিষয় — যে login করেছে শুধু তার appointments আসবে
  //
  // ── PATIENT হলে ──
  // Static example:
  // {
  //   patient: {
  //     email: "patient@gmail.com"   ← JWT token থেকে আসা email
  //   }
  // }
  // মানে Prisma relation দিয়ে বলছে:
  // "শুধু সেই appointments দাও যার patient এর email = আমার email"
  //
  // push করার পর: andConditions = [
  //   { patient: { email: "patient@gmail.com" } }
  // ]
  //
  // ── DOCTOR হলে ──
  // Static example:
  // {
  //   doctor: {
  //     email: "doctor@gmail.com"    ← JWT token থেকে আসা email
  //   }
  // }
  // মানে: "শুধু সেই appointments দাও যার doctor এর email = আমার email"
  //
  // push করার পর: andConditions = [
  //   { doctor: { email: "doctor@gmail.com" } }
  // ]
  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 5: Extra filter conditions push করা
  // ─────────────────────────────────────────────────────────────
  // filterData = { status: "SCHEDULED" } হলে
  // filterConditions = [
  //   { status: { equals: "SCHEDULED" } }
  // ]
  //
  // Static example — DOCTOR হলে এবং status filter দিলে andConditions হবে:
  // andConditions = [
  //   { doctor: { email: "doctor@gmail.com" } },   ← STEP 4 থেকে
  //   { status: { equals: "SCHEDULED" } },          ← এখান থেকে
  // ]
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 6: Final whereConditions তৈরি
  // ─────────────────────────────────────────────────────────────
  // Static example — DOCTOR + status filter দিলে:
  // whereConditions = {
  //   AND: [
  //     { doctor: { email: "doctor@gmail.com" } },
  //     { status: { equals: "SCHEDULED" } },
  //   ]
  // }
  //
  // SQL এ এরকম হবে:
  // WHERE doctor.email = 'doctor@gmail.com'
  //   AND status = 'SCHEDULED'
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ─────────────────────────────────────────────────────────────
  // STEP 7: Database query — include দিয়ে relation আনা ★ SMART LOGIC ★
  // ─────────────────────────────────────────────────────────────
  // include টাও role দেখে dynamically decide হচ্ছে:
  //
  // DOCTOR হলে → patient এর info include করো
  // (doctor নিজে জানে সে কে, তার patient কে সেটা দরকার)
  // include: { patient: true }
  //
  // PATIENT হলে → doctor এর info include করো
  // (patient নিজে জানে সে কে, তার doctor কে সেটা দরকার)
  // include: { doctor: true }
  //
  // Static example — DOCTOR হলে response এ আসবে:
  // {
  //   id: "appt_123",
  //   status: "SCHEDULED",
  //   patient: { name: "Rahim", email: "rahim@gmail.com", ... }
  // }
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      user.role === UserRole.DOCTOR
        ? { patient: true } // DOCTOR → patient details আনো
        : { doctor: true }, // PATIENT → doctor details আনো
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 8: Total count (pagination meta এর জন্য)
  // ─────────────────────────────────────────────────────────────
  // same whereConditions — শুধু এই user এর total appointments count
  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 9: Return
  // ─────────────────────────────────────────────────────────────
  return {
    meta: {
      total, // এই user এর মোট appointments
      limit,
      page,
    },
    data: result, // actual appointment records (with relation included)
  };
};

// export const AppointmentService = {
//   getMyAppointment,
// };
