import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";

// doctorSearchableFields = ["name", "email", "contactNumber"]
// doctorFilterableFields = ["email", "contactNumber", "gender", "address", "appointmentFee", "searchTerm"]

const getAllFromDB = async (filters: any, options: IOptions) => {
  // ─────────────────────────────────────────────────────────────
  // STEP 1: Pagination values বের করা
  // ─────────────────────────────────────────────────────────────
  // req.query থেকে আসা options = { page: "1", limit: "10", sortBy: "createdAt", sortOrder: "desc" }
  // calculatePagination এগুলো process করে দেয়:
  //   page     = 1
  //   limit    = 10
  //   skip     = 0        → (page-1) * limit = (1-1)*10 = 0
  //   sortBy   = "createdAt"
  //   sortOrder= "desc"
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // ─────────────────────────────────────────────────────────────
  // STEP 2: filters থেকে searchTerm আলাদা করা
  // ─────────────────────────────────────────────────────────────
  // req.query থেকে আসা filters (pick করার পর) হতে পারে:
  //   { searchTerm: "nusrat", address: "Sylhet", gender: "MALE" }
  //
  // Destructure করার পর:
  //   searchTerm = "nusrat"
  //   filterData = { address: "Sylhet", gender: "MALE" }
  //
  // searchTerm আলাদা করা হচ্ছে কারণ এটা OR দিয়ে multiple fields এ search করবে
  // filterData গুলো exact match (equals) দিয়ে filter করবে
  const { searchTerm, ...filterData } = filters;

  // ─────────────────────────────────────────────────────────────
  // STEP 3: andConditions array শুরু করা (শুরুতে খালি)
  // ─────────────────────────────────────────────────────────────
  // এই array তে সব filter conditions জমা হবে
  // সবগুলো condition AND দিয়ে জুড়বে — মানে সব condition একসাথে true হতে হবে
  //
  // এখন: andConditions = []
  const andConditions: Prisma.DoctorWhereInput[] = [];

  // ─────────────────────────────────────────────────────────────
  // STEP 4: searchTerm থাকলে OR condition push করা
  // ─────────────────────────────────────────────────────────────
  // searchTerm = "nusrat" দিলে নিচের OR block তৈরি হয়:
  //
  // Static example হলে এটা এরকম দেখাতো:
  // {
  //   OR: [
  //     { name:          { contains: "nusrat", mode: "insensitive" } },
  //     { email:         { contains: "nusrat", mode: "insensitive" } },
  //     { contactNumber: { contains: "nusrat", mode: "insensitive" } },
  //   ]
  // }
  //
  // মানে: name OR email OR contactNumber এর যেকোনো একটায় "nusrat" থাকলেই চলবে
  // mode: "insensitive" → case sensitive না, "Nusrat" বা "NUSRAT" ও match করবে
  //
  // push করার পর: andConditions = [
  //   { OR: [ {name: ...}, {email: ...}, {contactNumber: ...} ] }
  // ]
  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 5: filterData থাকলে exact match conditions push করা
  // ─────────────────────────────────────────────────────────────
  // filterData = { address: "Sylhet", gender: "MALE" } হলে
  // Object.keys(filterData) = ["address", "gender"]
  //
  // .map() করলে filterConditions হয়:
  // [
  //   { address: { equals: "Sylhet" } },
  //   { gender:  { equals: "MALE"  } },
  // ]
  //
  // Static example হলে এরকম দেখাতো:
  // andConditions.push(
  //   { address: { equals: "Sylhet" } },
  //   { gender:  { equals: "MALE"  } }
  // )
  //
  // ...filterConditions → spread দিয়ে individually push হচ্ছে (array হিসেবে না)
  //
  // push করার পর: andConditions = [
  //   { OR: [ {name: ...}, {email: ...}, {contactNumber: ...} ] },  ← searchTerm থেকে
  //   { address: { equals: "Sylhet" } },                            ← filterData থেকে
  //   { gender:  { equals: "MALE"  } },                            ← filterData থেকে
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
  // andConditions এ কিছু থাকলে → { AND: [...] } wrap করো
  // কিছু না থাকলে → {} (মানে কোনো filter নেই, সব data আনো)
  //
  // Static example — searchTerm + address + gender সব দিলে:
  // whereConditions = {
  //   AND: [
  //     {
  //       OR: [
  //         { name:          { contains: "nusrat", mode: "insensitive" } },
  //         { email:         { contains: "nusrat", mode: "insensitive" } },
  //         { contactNumber: { contains: "nusrat", mode: "insensitive" } },
  //       ]
  //     },
  //     { address: { equals: "Sylhet" } },
  //     { gender:  { equals: "MALE"  } },
  //   ]
  // }
  //
  // এর মানে SQL এ এরকম হবে:
  // WHERE (name ILIKE '%nusrat%' OR email ILIKE '%nusrat%' OR contactNumber ILIKE '%nusrat%')
  //   AND address = 'Sylhet'
  //   AND gender = 'MALE'
  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Debug করার জন্য — [Object] না দেখিয়ে full structure দেখাবে
  console.log("whereConditions", JSON.stringify(whereConditions, null, 2));

  // ─────────────────────────────────────────────────────────────
  // STEP 7: Database query
  // ─────────────────────────────────────────────────────────────
  // whereConditions দিয়ে filter, skip/take দিয়ে pagination, orderBy দিয়ে sort
  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip, // কতটা record skip করবে (pagination এর জন্য)
    take: limit, // কতটা record নেবে
    orderBy: {
      [sortBy]: sortOrder, // e.g. { createdAt: "desc" }
    },
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 8: Total count (pagination meta এর জন্য)
  // ─────────────────────────────────────────────────────────────
  // same whereConditions দিয়ে total কতটা record আছে সেটা বের করা
  // এটা frontend এ total pages calculate করতে কাজে লাগে
  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 9: Return
  // ─────────────────────────────────────────────────────────────
  return {
    meta: {
      total, // মোট কতটা record filter এ match করেছে
      page, // এখন কত নম্বর page এ আছি
      limit, // প্রতি page এ কতটা
    },
    data: result, // actual doctor records
  };
};

export const DoctorService = {
  getAllFromDB,
};
