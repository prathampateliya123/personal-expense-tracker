import Button from "../ui/Button";
import { TrashIcon } from "../ui/Icons";
import BudgetAllocations from "./BudgetAllocations";

const BudgetForm = ({
  periodLabel,
  budget,
  saving,
  deletePending,
  onCopyPrevious,
  onRequestDelete,
  totalAmount,
  setTotalAmount,
  notes,
  setNotes,
  categories,
  allocationRows,
  allocationDraft,
  setAllocationDraft,
  colorMap,
  onSubmit,
  savePending,
}) => (
  <form onSubmit={onSubmit} className="card flex flex-col gap-5 p-5 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-textPrimary">
          Budget details
        </h2>
        <p className="mt-0.5 text-sm text-textSecondary">
          Overall limit for {periodLabel}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!budget ? (
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onCopyPrevious}
          >
            Copy previous month
          </Button>
        ) : null}
        {budget ? (
          <Button
            type="button"
            variant="secondary"
            disabled={saving || deletePending}
            onClick={onRequestDelete}
          >
            <TrashIcon />
            Delete
          </Button>
        ) : null}
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor="budget-total"
          className="mb-1.5 block text-sm font-medium text-textPrimary"
        >
          Total budget (₹)
        </label>
        <input
          id="budget-total"
          type="number"
          min="0"
          step="0.01"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          className="fintech-input"
          placeholder="e.g. 25000"
        />
      </div>
      <div>
        <label
          htmlFor="budget-notes"
          className="mb-1.5 block text-sm font-medium text-textPrimary"
        >
          Notes (optional)
        </label>
        <input
          id="budget-notes"
          type="text"
          maxLength={300}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="fintech-input"
          placeholder="e.g. Tight month — cut shopping"
        />
      </div>
    </div>

    <BudgetAllocations
      categories={categories}
      allocationRows={allocationRows}
      allocationDraft={allocationDraft}
      setAllocationDraft={setAllocationDraft}
      colorMap={colorMap}
    />

    <div className="flex justify-end border-t border-border pt-5">
      <Button type="submit" loading={savePending}>
        Save budget
      </Button>
    </div>
  </form>
);

export default BudgetForm;
