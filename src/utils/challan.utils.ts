import moment from "moment-timezone";

export const generateChallan = () => {
  const time = moment.tz("Asia/Dhaka");
  const year = time.format("YY");
  const month = time.format("MM");
  const day = time.format("DD");
  const hour = time.format("HH");
  const minute = time.format("mm");

  return `${year}${month}${day}${hour}${minute}`;
};
