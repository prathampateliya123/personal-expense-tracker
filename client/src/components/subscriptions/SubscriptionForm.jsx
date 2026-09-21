import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import {
  BILLING_CYCLE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "../../utils/subscriptionConstants";
import { labelClass } from "./subscriptionHelpers";

const SubscriptionForm = ({
  form,
  onChange,
  editing,
  onSubmit,
  onCancel,
  loading = false,
  categoryOptions = [],
  paymentOptions = [],
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
        {editing ? `Edit “${editing.serviceName}”` : "New subscription"}
      </h2>
    ) : null}

    <div className={`grid gap-4 ${isPage ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}>
      <div className={isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"}>
        <label htmlFor="sub-name" className={labelClass}>
          Service name
        </label>
        <input
          id="sub-name"
          className="fintech-input"
          value={form.serviceName}
          onChange={(e) => onChange({ serviceName: e.target.value })}
          placeholder="e.g. Netflix, Spotify, Adobe"
          maxLength={80}
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="sub-amount" className={labelClass}>
          Amount (₹)
        </label>
        <input
          id="sub-amount"
          type="number"
          min="0"
          step="0.01"
          className="fintech-input"
          value={form.amount}
          onChange={(e) => onChange({ amount: e.target.value })}
          placeholder="649"
        />
      </div>

      <Select
        id="sub-cycle"
        name="billingCycle"
        label="Billing cycle"
        labelClassName={labelClass}
        value={form.billingCycle}
        onChange={(e) => onChange({ billingCycle: e.target.value })}
        options={BILLING_CYCLE_OPTIONS}
      />

      <DateInput
        id="sub-next"
        name="nextBillingDate"
        label="Next billing date"
        labelClassName={labelClass}
        value={form.nextBillingDate}
        onChange={(e) => onChange({ nextBillingDate: e.target.value })}
        required
      />

      <div>
        <label htmlFor="sub-reminder" className={labelClass}>
          Remind days before
        </label>
        <input
          id="sub-reminder"
          type="number"
          min="0"
          max="30"
          className="fintech-input"
          value={form.reminderDaysBefore}
          onChange={(e) => onChange({ reminderDaysBefore: e.target.value })}
        />
      </div>

      <Select
        id="sub-category"
        name="category"
        label="Expense category"
        labelClassName={labelClass}
        value={form.category}
        onChange={(e) => onChange({ category: e.target.value })}
        placeholder={
          categoryOptions.length
            ? "Select category"
            : "Add expense categories first"
        }
        options={categoryOptions}
      />

      <Select
        id="sub-payment"
        name="paymentMode"
        label="Payment method"
        labelClassName={labelClass}
        value={form.paymentMode}
        onChange={(e) => onChange({ paymentMode: e.target.value })}
        placeholder={
          paymentOptions.length
            ? "Select payment method"
            : "Add payment methods in Settings"
        }
        options={paymentOptions}
      />

      <Select
        id="sub-status"
        name="status"
        label="Status"
        labelClassName={labelClass}
        value={form.status}
        onChange={(e) => onChange({ status: e.target.value })}
        options={SUBSCRIPTION_STATUS_OPTIONS}
      />

      <div className={isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"}>
        <label htmlFor="sub-notes" className={labelClass}>
          Notes (optional)
        </label>
        <input
          id="sub-notes"
          className="fintech-input"
          value={form.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Plan details, family share, etc."
          maxLength={300}
        />
      </div>

      <label className={`${isPage ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2"} flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surfaceLight/50 px-4 py-3`}>
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-accentGreen"
          checked={Boolean(form.autoAddExpense)}
          onChange={(e) => onChange({ autoAddExpense: e.target.checked })}
        />
        <span>
          <span className="block text-sm font-medium text-textPrimary">
            Auto-add expense on billing day
          </span>
          <span className="mt-0.5 block text-xs text-textSecondary">
            When due, create an expense and move the next billing date forward
            automatically.
          </span>
        </span>
      </label>
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
        {editing ? "Save changes" : "Add subscription"}
      </Button>
    </div>
  </form>
  );
};

export default SubscriptionForm;
