import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import { SAVING_STATUS_OPTIONS } from "../../utils/wealthConstants";
import { labelClass } from "./wealthHelpers";

const SavingFormModal = ({
  form,
  onChange,
  editing,
  onSubmit,
  onCancel,
  loading = false,
  variant = "page",
}) => {
  const isPage = variant === "page";

  return (
    <form
      onSubmit={onSubmit}
      className={`card flex w-full flex-col ${
        isPage ? "gap-6 p-6 sm:p-8" : "gap-4 p-5 sm:p-6"
      }`}
    >
      {!isPage ? (
        <h2 className="text-base font-semibold text-textPrimary">
          {editing ? `Edit “${editing.name}”` : "New saving goal"}
        </h2>
      ) : null}

      <div
        className={`grid gap-4 ${
          isPage ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        <div className={isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"}>
          <label htmlFor="saving-name" className={labelClass}>
            Goal name
          </label>
          <input
            id="saving-name"
            className="fintech-input"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Emergency fund"
            maxLength={60}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="saving-target" className={labelClass}>
            Target amount (₹)
          </label>
          <input
            id="saving-target"
            type="number"
            min="0"
            step="0.01"
            className="fintech-input"
            value={form.targetAmount}
            onChange={(e) => onChange({ targetAmount: e.target.value })}
            placeholder="100000"
          />
        </div>
        <div>
          <label htmlFor="saving-current" className={labelClass}>
            Already saved (₹)
          </label>
          <input
            id="saving-current"
            type="number"
            min="0"
            step="0.01"
            className="fintech-input"
            value={form.currentAmount}
            onChange={(e) => onChange({ currentAmount: e.target.value })}
            placeholder="0"
          />
        </div>
        <DateInput
          id="saving-deadline"
          name="deadline"
          label="Deadline (optional)"
          labelClassName={labelClass}
          value={form.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
        />
        <Select
          id="saving-status"
          name="status"
          label="Status"
          labelClassName={labelClass}
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
          options={SAVING_STATUS_OPTIONS}
        />
        <div className={isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"}>
          <label htmlFor="saving-notes" className={labelClass}>
            Notes (optional)
          </label>
          <input
            id="saving-notes"
            className="fintech-input"
            value={form.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Why this goal matters"
            maxLength={300}
          />
        </div>
      </div>

      <div
        className={`flex flex-wrap gap-2 ${
          isPage ? "border-t border-border pt-6 sm:justify-end" : "sm:justify-end"
        }`}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className={isPage ? "sm:min-w-[140px]" : ""}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className={isPage ? "sm:min-w-[160px]" : ""}
        >
          {editing ? "Save changes" : "Create goal"}
        </Button>
      </div>
    </form>
  );
};

export default SavingFormModal;
