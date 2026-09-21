import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import { INVESTMENT_TYPE_OPTIONS } from "../../utils/wealthConstants";
import { labelClass } from "./wealthHelpers";

const InvestmentFormModal = ({
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
          {editing ? `Edit “${editing.name}”` : "New investment"}
        </h2>
      ) : null}

      <div
        className={`grid gap-4 ${
          isPage ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        <div className={isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"}>
          <label htmlFor="inv-name" className={labelClass}>
            Name
          </label>
          <input
            id="inv-name"
            className="fintech-input"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Nifty 50 Index Fund"
            maxLength={80}
            autoFocus
          />
        </div>
        <Select
          id="inv-type"
          name="type"
          label="Type"
          labelClassName={labelClass}
          value={form.type}
          onChange={(e) => onChange({ type: e.target.value })}
          options={INVESTMENT_TYPE_OPTIONS}
        />
        <DateInput
          id="inv-date"
          name="purchaseDate"
          label="Purchase date"
          labelClassName={labelClass}
          value={form.purchaseDate}
          onChange={(e) => onChange({ purchaseDate: e.target.value })}
          required
        />
        <div>
          <label htmlFor="inv-invested" className={labelClass}>
            Amount invested (₹)
          </label>
          <input
            id="inv-invested"
            type="number"
            min="0"
            step="0.01"
            className="fintech-input"
            value={form.amountInvested}
            onChange={(e) => onChange({ amountInvested: e.target.value })}
            placeholder="50000"
          />
        </div>
        <div>
          <label htmlFor="inv-current" className={labelClass}>
            Current value (₹)
          </label>
          <input
            id="inv-current"
            type="number"
            min="0"
            step="0.01"
            className="fintech-input"
            value={form.currentValue}
            onChange={(e) => onChange({ currentValue: e.target.value })}
            placeholder="52000"
          />
        </div>
        <div>
          <label htmlFor="inv-institution" className={labelClass}>
            Institution (optional)
          </label>
          <input
            id="inv-institution"
            className="fintech-input"
            value={form.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            placeholder="e.g. Groww, Zerodha, SBI"
            maxLength={80}
          />
        </div>
        <div className={isPage ? "xl:col-span-2" : ""}>
          <label htmlFor="inv-notes" className={labelClass}>
            Notes (optional)
          </label>
          <input
            id="inv-notes"
            className="fintech-input"
            value={form.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Optional notes"
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
          {editing ? "Save changes" : "Add investment"}
        </Button>
      </div>
    </form>
  );
};

export default InvestmentFormModal;
