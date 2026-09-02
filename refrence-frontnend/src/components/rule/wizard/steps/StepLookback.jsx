import LookbackPeriod from "../../LookbackPeriod";

export default function StepLookback({
  form,
  errors = {},
  onChange,
  clearError,
  readOnly = false
}) {
  return (
    <LookbackPeriod
      lookbackDays={form.lookbackDays}
      waitDays={form.waitDays}
      errors={readOnly ? {} : errors}
      clearError={clearError}
      readOnly={readOnly}
      onChange={onChange}
      splitHeader
    />
  );
}