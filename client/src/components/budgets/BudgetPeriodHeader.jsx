import {
  IconChevronLeft,
  IconChevronRight,
} from "../ui/Icons";

const BudgetPeriodHeader = ({ periodLabel, onPrev, onNext }) => (
  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
        Budget planning
      </h1>
      <p className="mt-1 text-sm text-textSecondary">
        Set a monthly limit and allocate spend by category
      </p>
    </div>

    <div className="flex items-center gap-2 self-start sm:self-auto">
      <button
        type="button"
        onClick={onPrev}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:bg-surfaceGray"
        aria-label="Previous month"
      >
        <IconChevronLeft />
      </button>
      <div className="min-w-[10rem] text-center text-sm font-semibold text-textPrimary">
        {periodLabel}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:bg-surfaceGray"
        aria-label="Next month"
      >
        <IconChevronRight />
      </button>
    </div>
  </div>
);

export default BudgetPeriodHeader;
