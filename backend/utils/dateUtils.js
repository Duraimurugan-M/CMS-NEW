import dayjs from "dayjs";

export const toDate = (value) => (value ? dayjs(value).toDate() : null);

export const today = () => dayjs().startOf("day").toDate();

export const addDays = (date, days) => dayjs(date).add(days, "day").toDate();

