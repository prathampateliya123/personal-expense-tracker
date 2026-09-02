import RuleSection from "../../RuleSection";
import SelectableTile from "../SelectableTile";
import { TableLoadingSpinner, TableStatusPanel } from "../../../table/TableState";

export default function StepTargetType({
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
      title="Target type"
      description="Choose one level where this rule should evaluate and take action."
      splitHeader
      className="h-fit"
    >
      {loading ? (
        <div className="flex min-h-[160px] items-center justify-center py-8">
          <TableLoadingSpinner label="Loading reports…" />
        </div>
      ) : null}

      {!loading && loadError ? (
        <TableStatusPanel
          tone="error"
          title="Couldn’t load report types"
          description={loadError}
          actionLabel={onRetry ? "Retry" : undefined}
          onAction={onRetry}
        />
      ) : null}

      {!loading && !loadError && !list.length ? (
        <TableStatusPanel
          title="No target types available"
          description="Report types will appear here once reports config loads."
        />
      ) : null}

      {!loading && !loadError && list.length ? (
        <>
          <div
            id="targetType"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
            role="radiogroup"
            aria-label="Target type"
          >
            {list.map((option) => {
              const selected =
                form.targetType === option.value ||
                (option.reportId != null &&
                  Number(form.reportId) === Number(option.reportId));
              return (
                <SelectableTile
                  key={option.reportId ?? option.value}
                  className="min-h-[88px] px-3.5 py-3.5 sm:min-h-[104px] sm:px-5 sm:py-5"
                  title={option.title}
                  description={option.description}
                  selected={selected}
                  disabled={readOnly}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    if (readOnly) return;
                    clearError?.("targetType");
                    onChange?.({
                      targetType: option.value,
                      source: option.value,
                      reportId: option.reportId ?? null
                    });
                  }}
                />
              );
            })}
          </div>

          {!readOnly ? (
            <p className="mt-3 text-[12px] font-medium text-[var(--ink-muted)]">
              Only ONE can be selected.
            </p>
          ) : null}

          {!readOnly && errors.targetType ? (
            <p className="mt-1.5 text-[12px] font-medium text-red-500">
              {errors.targetType}
            </p>
          ) : null}
        </>
      ) : null}
    </RuleSection>
  );
}