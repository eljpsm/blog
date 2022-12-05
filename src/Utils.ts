/**
 * Format a date to a more human-readable string.
 * @param date - The date.
 */
export const formatDate = (date: string | Date) => {
  if (typeof date === "string") date = new Date(date);
  return date.toDateString().toLowerCase();
};
