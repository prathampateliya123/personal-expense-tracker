import RuleSection from "./RuleSection";
import Checkbox from "../ui/Checkbox";
import Select from "../ui/Select";
import FieldErrorTooltip from "../ui/FieldErrorTooltip";
import { WIZARD_SCHEDULE_FREQUENCIES } from "../../utils/constants";

const DAYS_OF_WEEK = [
  { value: "Mo", label: "Mo" },
  { value: "Tu", label: "Tu" },
  { value: "We", label: "We" },
  { value: "Th", label: "Th" },
  { value: "Fr", label: "Fr" },
  { value: "Sa", label: "Sa" },
  { value: "Su", label: "Su" }
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

function getChipClass({ active, hasError, readOnly }) {
  return `h-10 rounded-[7px] border text-[13px] font-medium transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"
    } ${active
      ? "border-[var(--brand-orange)] bg-[var(--brand-orange)] text-white"
      : hasError
        ? "border-red-500 bg-[var(--surface)] text-[var(--ink)] hover:border-red-600"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--border-strong)] hover:bg-[var(--canvas)]"
    }`;
}

function normalizeFrequency(value, options = WIZARD_SCHEDULE_FREQUENCIES) {
  const key = String(value || "").trim().toLowerCase();
  if (options.some((item) => item.value === key)) return key;
  // Legacy "daily" / hours UI removed — fall back to weekly days structure
  return "weekly";
}

export default function RunSchedule({
  splitHeader = false,
  frequency,
  hours: _hours = [],
  daysOfWeek = [],
  daysOfMonth = [],
  errors = {},
  clearError,
  onChange,
  readOnly = false,
  frequencyOptions = WIZARD_SCHEDULE_FREQUENCIES
}) {
  const frequencySelectOptions =
    Array.isArray(frequencyOptions) && frequencyOptions.length > 0
      ? frequencyOptions
      : WIZARD_SCHEDULE_FREQUENCIES;
  const safeFrequency = normalizeFrequency(frequency, frequencySelectOptions);

  const selectedDaysOfWeek = new Set(daysOfWeek);
  const selectedDaysOfMonth = new Set(daysOfMonth);

  const ALL_WEEK_DAYS = DAYS_OF_WEEK.map((d) => d.value);
  const ALL_MONTH_DAYS = [...DAYS_OF_MONTH];
  const isAllWeekDays = daysOfWeek.length === 7;
  const isAllMonthDays = daysOfMonth.length === 31;

  const handleFrequencyChange = (nextFrequency) => {
    if (readOnly) return;
    clearError?.("hours");
    clearError?.("daysOfWeek");
    clearError?.("daysOfMonth");

    const patch = {
      frequency: nextFrequency,
      hours: []
    };

    if (nextFrequency === "monthly") {
      patch.daysOfMonth = isAllWeekDays ? ALL_MONTH_DAYS : [];
    } else if (nextFrequency === "weekly") {
      if (isAllMonthDays) {
        patch.daysOfWeek = ALL_WEEK_DAYS;
      }
    }

    onChange?.(patch);
  };

  const toggleDayOfWeek = (day) => {
    if (readOnly) return;
    clearError?.("daysOfWeek");
    const next = selectedDaysOfWeek.has(day)
      ? daysOfWeek.filter((item) => item !== day)
      : [...daysOfWeek, day];

    onChange?.({
      daysOfWeek: next,
      daysOfMonth: next.length === 7 ? ALL_MONTH_DAYS : []
    });
  };

  const toggleAllDaysOfWeek = () => {
    if (readOnly) return;
    clearError?.("daysOfWeek");
    if (isAllWeekDays) {
      onChange?.({ daysOfWeek: [], daysOfMonth: [] });
    } else {
      onChange?.({ daysOfWeek: ALL_WEEK_DAYS, daysOfMonth: ALL_MONTH_DAYS });
    }
  };

  const toggleDayOfMonth = (day) => {
    if (readOnly) return;
    clearError?.("daysOfMonth");
    if (selectedDaysOfMonth.has(day)) {
      onChange?.({ daysOfMonth: daysOfMonth.filter((item) => item !== day) });
    } else {
      onChange?.({ daysOfMonth: [...daysOfMonth, day].sort((a, b) => a - b) });
    }
  };

  return (
    <RuleSection
      title="Rule Schedule"
      description="Set when this rule should run automatically"
      splitHeader={splitHeader}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-[13px] font-medium text-[var(--ink)]">Repeat every</span>
        <Select
          value={safeFrequency}
          onChange={handleFrequencyChange}
          options={frequencySelectOptions}
          ariaLabel="Run frequency"
          triggerClassName="h-[34px] px-3"
          disabled={readOnly}
        />
      </div>

      {safeFrequency === "weekly" ? (
        <div id="daysOfWeek" className="flex w-full flex-col gap-3">
          <div className="grid w-full grid-cols-7 gap-1.5 sm:flex sm:w-full sm:flex-wrap sm:gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const active = selectedDaysOfWeek.has(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleDayOfWeek(day.value)}
                  className={`${getChipClass({
                    active,
                    hasError: Boolean(errors.daysOfWeek),
                    readOnly
                  })} w-full min-w-0 sm:w-12`}
                  aria-label={`Toggle ${day.label}`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <Checkbox
            label="All Days"
            checked={isAllWeekDays}
            disabled={readOnly}
            onChange={toggleAllDaysOfWeek}
          />
          <FieldErrorTooltip
            id="daysOfWeek-error"
            show={Boolean(errors.daysOfWeek)}
            message={errors.daysOfWeek}
            className="mt-0"
          />
        </div>
      ) : null}

      {safeFrequency === "monthly" ? (
        <div id="daysOfMonth" className="relative">
          <div className="grid w-full grid-cols-7 gap-1.5 sm:inline-grid sm:w-auto sm:grid-cols-10 sm:gap-2">
            {DAYS_OF_MONTH.map((day) => {
              const active = selectedDaysOfMonth.has(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleDayOfMonth(day)}
                  className={`${getChipClass({
                    active,
                    hasError: Boolean(errors.daysOfMonth),
                    readOnly
                  })} w-full min-w-0 sm:w-11`}
                  aria-label={`Toggle day ${day}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <FieldErrorTooltip
            id="daysOfMonth-error"
            show={Boolean(errors.daysOfMonth)}
            message={errors.daysOfMonth}
          />
        </div>
      ) : null}
    </RuleSection>
  );
}