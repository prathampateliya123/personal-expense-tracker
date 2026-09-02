import RuleNameField from "../../RuleNameField";
import RuleSection from "../../RuleSection";
import SelectableTile from "../SelectableTile";
import { TableLoadingSpinner, TableStatusPanel } from "../../../table/TableState";

export default function StepBasics({
  form,
  errors = {},
  onChange,
  clearError,
  readOnly = false,
  options = [],
  loading = false,
  loadError = "",
  onRetry
}) {
  const list = Array.isArray(options) ? options : [];

  return (
    <RuleSection
      title="Basics"
      description="Enter a rule name and choose the level this rule should apply to."
      splitHeader
    >
      <div className="space-y-4">
        <RuleNameField
          value={form.name}
          error={errors.name}
          placeholder="Enter rule name"
          readOnly={readOnly}
          onChange={(name) => {
            if (readOnly) return;
            clearError?.("name");
            onChange?.({ name });
          }}
        />

        <div id="ruleLevel" className="space-y-2">
          <p className="text-[13px] font-medium text-[var(--ink)]">
            Rule level {!readOnly ? <span className="text-red-500">*</span> : null}
          </p>

          {loading ? (
            <div className="flex min-h-[120px] items-center justify-center py-6">
              <TableLoadingSpinner label="Loading rule levels…" />
            </div>
          ) : null}

          {!loading && loadError ? (
            <TableStatusPanel
              tone="error"
              title="Couldn’t load rule levels"
              description={loadError}
              actionLabel={onRetry ? "Retry" : undefined}
              onAction={onRetry}
            />
          ) : null}

          {!loading && !loadError && !list.length ? (
            <TableStatusPanel
              title="No rule levels available"
              description="Rule levels will appear here once reports config loads."
            />
          ) : null}

          {!loading && !loadError && list.length ? (
            <>
              <div
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Rule level"
              >
                {list.map((option) => {
                  const selected = form.ruleLevel === option.value;
                  return (
                    <SelectableTile
                      key={option.value}
                      compact
                      title={option.title}
                      description={option.description}
                      disabled={readOnly || option.disabled}
                      selected={selected}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        if (readOnly || option.disabled) return;
                        clearError?.("ruleLevel");
                        onChange?.({ ruleLevel: option.value });
                      }}
                    />
                  );
                })}
              </div>
              {!readOnly && errors.ruleLevel ? (
                <p className="text-[12px] font-medium text-red-500">{errors.ruleLevel}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </RuleSection>
  );
}