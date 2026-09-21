import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import {
  BILL_FREQUENCY_OPTIONS,
  BILL_TYPE_OPTIONS,
  isEmiBillType,
} from "../../utils/billSimulator";

const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

const SimulatorForm = ({
  billType,
  onBillTypeChange,
  emiForm,
  onEmiChange,
  billForm,
  onBillChange,
  reminderForm,
  onReminderChange,
  title,
  onTitleChange,
  notes,
  onNotesChange,
  onSave,
  onCancelEdit,
  saving = false,
  canSave = false,
  editing = false,
}) => {
  const isEmi = isEmiBillType(billType);

  return (
    <div className="card flex w-full flex-col gap-5 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-textPrimary">
          {editing ? "Edit details" : "Scenario details"}
        </h2>
        <p className="mt-1 text-xs text-textSecondary">
          Choose a bill type. For ongoing EMIs, enter how many installments
          are already paid. Set a reminder for the next due date.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BILL_TYPE_OPTIONS.map((opt) => {
          const active = billType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onBillTypeChange(opt.value)}
              className={`rounded-lg border px-3 py-3 text-left text-sm font-medium transition ${
                active
                  ? "border-accentGreen bg-successBg text-primaryDark"
                  : "border-border bg-white text-textSecondary hover:border-accentGreen/40 hover:bg-surfaceLight"
              }`}
            >
              {opt.label}
              <span className="mt-1 block text-[11px] font-normal opacity-70">
                {opt.kind === "emi" ? "EMI calculator" : "Bill projection"}
              </span>
            </button>
          );
        })}
      </div>

      {isEmi ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="loan-amount" className={labelClass}>
                Original loan amount (₹)
              </label>
              <input
                id="loan-amount"
                type="number"
                min="0"
                step="0.01"
                className="fintech-input"
                value={emiForm.loanAmount}
                onChange={(e) => onEmiChange({ loanAmount: e.target.value })}
                placeholder="500000"
              />
            </div>
            <div>
              <label htmlFor="interest-rate" className={labelClass}>
                Interest rate (% p.a.)
              </label>
              <input
                id="interest-rate"
                type="number"
                min="0"
                step="0.01"
                className="fintech-input"
                value={emiForm.interestRate}
                onChange={(e) => onEmiChange({ interestRate: e.target.value })}
                placeholder="10.5"
              />
            </div>
            <div>
              <label htmlFor="tenure" className={labelClass}>
                Total tenure (months)
              </label>
              <input
                id="tenure"
                type="number"
                min="1"
                max="600"
                step="1"
                className="fintech-input"
                value={emiForm.tenureMonths}
                onChange={(e) => onEmiChange({ tenureMonths: e.target.value })}
                placeholder="36"
              />
            </div>
            <div>
              <label htmlFor="paid-emis" className={labelClass}>
                EMIs already paid
              </label>
              <input
                id="paid-emis"
                type="number"
                min="0"
                max="600"
                step="1"
                className="fintech-input"
                value={emiForm.paidEmis}
                onChange={(e) => onEmiChange({ paidEmis: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
          <p className="rounded-lg border border-border bg-surfaceLight/50 px-3 py-2 text-xs text-textSecondary">
            Already mid-loan? Enter total tenure and{" "}
            <span className="font-medium text-textPrimary">EMIs already paid</span>{" "}
            — we calculate outstanding balance and the remaining schedule from
            there, not from month 1.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bill-amount" className={labelClass}>
              Bill amount (₹)
            </label>
            <input
              id="bill-amount"
              type="number"
              min="0"
              step="0.01"
              className="fintech-input"
              value={billForm.billAmount}
              onChange={(e) => onBillChange({ billAmount: e.target.value })}
              placeholder="2500"
            />
          </div>
          <Select
            id="bill-frequency"
            name="frequency"
            label="Frequency"
            labelClassName={labelClass}
            value={billForm.frequency}
            onChange={(e) => onBillChange({ frequency: e.target.value })}
            options={BILL_FREQUENCY_OPTIONS}
          />
        </div>
      )}

      <div className="space-y-4 border-t border-border pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-textPrimary">Reminder</p>
            <p className="text-xs text-textSecondary">
              Get a due hint before the next EMI or bill date
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-textPrimary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-accentGreen focus:ring-accentGreen"
              checked={Boolean(reminderForm.reminderEnabled)}
              onChange={(e) =>
                onReminderChange({ reminderEnabled: e.target.checked })
              }
            />
            Enable
          </label>
        </div>

        {reminderForm.reminderEnabled ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput
              id="sim-next-due"
              name="nextDueDate"
              label="Next due date"
              labelClassName={labelClass}
              value={reminderForm.nextDueDate}
              onChange={(e) => onReminderChange({ nextDueDate: e.target.value })}
              required
            />
            <div>
              <label htmlFor="sim-reminder-days" className={labelClass}>
                Remind days before
              </label>
              <input
                id="sim-reminder-days"
                type="number"
                min="0"
                max="30"
                className="fintech-input"
                value={reminderForm.reminderDaysBefore}
                onChange={(e) =>
                  onReminderChange({ reminderDaysBefore: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sim-title" className={labelClass}>
            Title
          </label>
          <input
            id="sim-title"
            className="fintech-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Home loan option A"
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="sim-notes" className={labelClass}>
            Notes (optional)
          </label>
          <input
            id="sim-notes"
            className="fintech-input"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Bank / plan notes"
            maxLength={300}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {editing ? (
          <Button type="button" variant="secondary" onClick={onCancelEdit}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={onSave}
          loading={saving}
          disabled={!canSave}
        >
          {editing ? "Update scenario" : "Save scenario"}
        </Button>
      </div>
    </div>
  );
};

export default SimulatorForm;
