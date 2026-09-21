import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import { TRIP_EXPENSE_CATEGORIES } from "../../utils/tripConstants";

const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

const TripExpenseForm = ({
  form,
  members = [],
  onChange,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const memberOptions = members.map((m) => ({
    value: String(m._id),
    label: m.isSelf ? `${m.name} (me)` : m.name,
  }));

  const toggleSplit = (id) => {
    const current = form.splitAmong || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onChange({ splitAmong: next });
  };

  const selectAll = () => {
    onChange({ splitAmong: members.map((m) => String(m._id)) });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-border bg-surfaceLight/50 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-textPrimary">Add expense</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-textSecondary hover:text-textPrimary"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="te-title" className={labelClass}>
            Title
          </label>
          <input
            id="te-title"
            className="fintech-input"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Dinner at beach shack"
            required
          />
        </div>
        <div>
          <label htmlFor="te-amount" className={labelClass}>
            Amount (₹)
          </label>
          <input
            id="te-amount"
            type="number"
            min="0.01"
            step="0.01"
            className="fintech-input"
            value={form.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
            placeholder="2500"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          id="te-category"
          name="category"
          label="Category"
          labelClassName={labelClass}
          value={form.category}
          onChange={(e) => onChange({ category: e.target.value })}
          options={TRIP_EXPENSE_CATEGORIES}
        />
        <Select
          id="te-paidby"
          name="paidBy"
          label="Who paid?"
          labelClassName={labelClass}
          value={form.paidBy}
          onChange={(e) => onChange({ paidBy: e.target.value })}
          options={memberOptions}
        />
        <DateInput
          id="te-date"
          name="date"
          label="Date"
          labelClassName={labelClass}
          value={form.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className={labelClass + " mb-0"}>Split among</p>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-semibold text-accentGreen"
          >
            Select all
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const id = String(m._id);
            const active = (form.splitAmong || []).includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleSplit(id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-accentGreen bg-successBg text-primaryDark"
                    : "border-border bg-white text-textSecondary"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Add expense
        </Button>
      </div>
    </form>
  );
};

export default TripExpenseForm;
