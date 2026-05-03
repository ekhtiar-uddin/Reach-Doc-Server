import { IOptions, paginationHelper } from "../../helper/paginationHelper";

const getAllFromDB = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  console.log({ page, limit, skip, sortBy, sortOrder });
};

export const DoctorService = {
  getAllFromDB,
};
