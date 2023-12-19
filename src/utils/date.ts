export const getFormattedDateString = (date: Date) =>
  `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(
    2,
    "0"
  )}-${`${date.getUTCDate()}`.padStart(2, "0")}`;
