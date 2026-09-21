import Button from "../ui/Button";
import Select from "../ui/Select";
import DateInput from "../ui/DateInput";
import { IconPlus, IconXMark } from "../ui/Icons";
import { TRIP_STATUSES } from "../../utils/tripConstants";

const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

const TripForm = ({
  form,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  editing = false,
}) => {
  const members = form.members || [];

  const updateMember = (index, patch) => {
    const next = members.map((m, i) =>
      i === index ? { ...m, ...patch } : m
    );
    onChange({ members: next });
  };

  const addMember = () => {
    onChange({
      members: [...members, { name: "", isSelf: false }],
    });
  };

  const removeMember = (index) => {
    if (members.length <= 1) return;
    const next = members.filter((_, i) => i !== index);
    if (!next.some((m) => m.isSelf) && next[0]) {
      next[0] = { ...next[0], isSelf: true };
    }
    onChange({ members: next });
  };

  const markSelf = (index) => {
    onChange({
      members: members.map((m, i) => ({ ...m, isSelf: i === index })),
    });
  };

  return (
    <form onSubmit={onSubmit} className="card flex w-full flex-col gap-5 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="trip-title" className={labelClass}>
            Trip title
          </label>
          <input
            id="trip-title"
            className="fintech-input"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Goa Trip"
            maxLength={80}
            required
          />
        </div>
        <div>
          <label htmlFor="trip-destination" className={labelClass}>
            Destination
          </label>
          <input
            id="trip-destination"
            className="fintech-input"
            value={form.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            placeholder="Goa"
            maxLength={80}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DateInput
          id="trip-start"
          name="startDate"
          label="Start date"
          labelClassName={labelClass}
          value={form.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
        />
        <DateInput
          id="trip-end"
          name="endDate"
          label="End date"
          labelClassName={labelClass}
          value={form.endDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
        />
        <Select
          id="trip-status"
          name="status"
          label="Status"
          labelClassName={labelClass}
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
          options={TRIP_STATUSES}
        />
      </div>

      <div>
        <label htmlFor="trip-notes" className={labelClass}>
          Notes
        </label>
        <input
          id="trip-notes"
          className="fintech-input"
          value={form.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Optional notes"
          maxLength={400}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-textPrimary">Members</p>
            <p className="text-xs text-textSecondary">
              People sharing this trip — mark yourself for clarity
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addMember}>
            <IconPlus className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={member._id || `new-${index}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surfaceLight/40 p-3 sm:flex-row sm:items-center"
            >
              <input
                className="fintech-input flex-1"
                value={member.name}
                onChange={(e) => updateMember(index, { name: e.target.value })}
                placeholder={`Member ${index + 1}`}
                required
              />
              <label className="inline-flex shrink-0 items-center gap-2 text-sm text-textPrimary">
                <input
                  type="radio"
                  name="trip-self"
                  checked={Boolean(member.isSelf)}
                  onChange={() => markSelf(index)}
                />
                Me
              </label>
              <button
                type="button"
                disabled={members.length <= 1}
                onClick={() => removeMember(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                title="Remove member"
              >
                <IconXMark />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {editing ? "Update trip" : "Create trip"}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
