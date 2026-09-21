import Button from "../ui/Button";
import Select from "../ui/Select";
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
  title,
  onTitleChange,
  notes,
  onNotesChange,
  onSave,
  saving = false,
  canSave = false,
}) => {
  const isEmi = isEmiBillType(billType);

  return (
    <div className="card flex w-full flex-col gap-5 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-textPrimary">Simulator</h2>
        <p className="mt-1 text-xs text-textSecondary">
          Choose a bill type. For ongoing EMIs, enter how many installments
          are already paid.
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

      <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sim-title" className={labelClass}>
            Save as (optional)
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
        <Button
          type="button"
          onClick={onSave}
          loading={saving}
          disabled={!canSave}
        >
          Save scenario
        </Button>
      </div>
    </div>
  );
};

export default SimulatorForm;
