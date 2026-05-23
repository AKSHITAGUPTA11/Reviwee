import { format } from "date-fns";

export const formatedDateTimeIntoIst = (
  dateAndTime: string,
  customFormat?: string,
): string => {
  const date = new Date(dateAndTime);

  return format(date, customFormat || "dd-MMM-yyyy - hh:mm a");
};
