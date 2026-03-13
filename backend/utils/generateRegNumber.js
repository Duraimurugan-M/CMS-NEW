import dayjs from "dayjs";
import Student from "../models/Student.js";

export const generateRegistrationNumber = async () => {
  const year = dayjs().format("YYYY");
  const count = await Student.countDocuments();
  const serial = String(count + 1).padStart(4, "0");
  return `REG-${year}-${serial}`;
};

