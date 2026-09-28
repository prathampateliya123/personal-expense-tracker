export const REPORT_PERIODS = [
  { value: "monthly", label: "Monthly report" },
  { value: "yearly", label: "Yearly report" },
];

export const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const buildYearOptions = (span = 6) => {
  const current = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => {
    const year = current - i;
    return { value: String(year), label: String(year) };
  });
};

export const CSV_SECTIONS = [
  { value: "all", label: "Summary + trend" },
  { value: "transactions", label: "All transactions" },
  { value: "category", label: "Category-wise" },
  { value: "account", label: "Account-wise" },
];
