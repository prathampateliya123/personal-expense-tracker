import RunSchedule from "../../RunSchedule";
import { WIZARD_SCHEDULE_FREQUENCIES } from "../../../../utils/constants";

export default function StepSchedule({
  form,
  errors = {},
  onChange,
  clearError,
  readOnly = false
}) {
  return (
    <RunSchedule
      frequency={form.frequency}
      hours={form.hours}
      daysOfWeek={form.daysOfWeek}
      daysOfMonth={form.daysOfMonth}
      errors={readOnly ? {} : errors}
      clearError={clearError}
      readOnly={readOnly}
      onChange={onChange}
      frequencyOptions={WIZARD_SCHEDULE_FREQUENCIES}
      splitHeader
    />
  );
}