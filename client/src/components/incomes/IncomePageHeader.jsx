import { Link } from "react-router-dom";
import { IconChevronLeft } from "../ui/Icons";

const IncomePageHeader = ({ title, subtitle }) => (
  <div className="flex w-full flex-col gap-4 border-b border-border/60 pb-6">
    <Link
      to="/incomes"
      className="inline-flex w-fit items-center gap-2 text-sm font-medium text-textSecondary transition hover:text-accentGreen"
    >
      <IconChevronLeft />
      Back to incomes
    </Link>
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-textSecondary">{subtitle}</p>
      ) : null}
    </div>
  </div>
);

export default IncomePageHeader;
