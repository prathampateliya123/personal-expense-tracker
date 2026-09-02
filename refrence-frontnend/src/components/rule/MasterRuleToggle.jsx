import Checkbox from "../ui/Checkbox";

export default function MasterRuleToggle({
  checked = false,
  onChange,
  readOnly = false
}) {
  return (
    <div className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
      <Checkbox
        checked={Boolean(checked)}
        disabled={readOnly}
        onChange={(next) => {
          if (readOnly) return;
          onChange?.(next);
        }}
        inputClassName="mt-0.5"
        className="items-start gap-2.5"
        label={
          <span>
            <span className="block text-[14px] font-semibold text-[var(--ink)]">
              Set as master rule
            </span>
            <span className="mt-0.5 block text-[12px] text-[var(--ink-muted)]">
              Master rules can group related automation rules under one parent.
            </span>
          </span>
        }
      />
    </div>
  );
}