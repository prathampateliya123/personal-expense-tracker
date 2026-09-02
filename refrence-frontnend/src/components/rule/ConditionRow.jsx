import { NORMALIZE_KEY_SPACES_REGEX, UNDERSCORE_REGEX } from "../../utils/constants";
import { useEffect } from "react";
import { TrashIcon } from "../ui/Icons";
import Select from "../ui/Select";
import DatePicker from "../ui/DatePicker";
import NumericWithAffix from "../ui/NumericWithAffix";
import FieldErrorTooltip from "../ui/FieldErrorTooltip";
import { formatFieldLabel, formatOperatorLabel } from "../../utils/ruleDetailsFormatters";
import { resolveFieldValueKind } from "../../utils/ruleReportsConfig";
import { getAcosRoasLock, isAcosMetric, isRoasMetric } from "../../utils/ruleTree";

const INNER = "h-[34px] px-2.5 text-[13px] font-medium bg-[var(--surface)]";

function normalizeKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(NORMALIZE_KEY_SPACES_REGEX, "_");
}

function findField(fields, metric) {
  const key = String(metric || "").trim();
  if (!key) return null;
  const normalized = normalizeKey(key);
  return (
    fields.find((f) => f.field_name === key) ||
    fields.find((f) => normalizeKey(f.field_name) === normalized) ||
    fields.find((f) => normalizeKey(f.display_name) === normalized) ||
    fields.find(
      (f) =>
        normalizeKey(f.field_name).replace(UNDERSCORE_REGEX, "") === normalized.replace(UNDERSCORE_REGEX, "") ||
        normalizeKey(f.display_name).replace(UNDERSCORE_REGEX, "") === normalized.replace(UNDERSCORE_REGEX, "")
    ) ||
    null
  );
}

function withFallbackOption(options, value, label) {
  if (value == null || value === "") return options;
  const exists = options.some((opt) => String(opt.value) === String(value));
  if (exists) return options;
  return [{ label: label || String(value), value }, ...options];
}

function getInputClass({ readOnly, hasError }) {
  if (readOnly) {
    return "h-[34px] w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px] font-medium text-[var(--ink)] outline-none cursor-default";
  }

  return `h-[34px] w-full rounded-[7px] border bg-[var(--surface)] px-2.5 text-[13px] font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:font-normal placeholder:text-[var(--ink-subtle)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.12)] ${hasError ? "border-red-500" : "border-[var(--border)]"
    }`;
}

export default function ConditionRow({
  condition,
  currentSourceConfig,
  errors = {},
  clearError,
  onChange,
  onRemove,
  canRemove = true,
  readOnly = false,
  softBg = "var(--surface)",
  borderColor = "var(--border)",
  conditionMetrics = []
}) {
  const fields = Array.isArray(currentSourceConfig?.field_name)
    ? currentSourceConfig.field_name
    : [];

  const selectedField = findField(fields, condition.metric);
  const metricValue = selectedField?.field_name || condition.metric || "";
  const hasMetric = Boolean(metricValue);
  const firstOperator = fields[0]?.operators?.[0] || "";
  const defaultOperator = selectedField?.operators?.[0] || firstOperator;
  const { blockAcos, blockRoas } = getAcosRoasLock(conditionMetrics, condition.id);
  const currentIsAcos = isAcosMetric(metricValue);
  const currentIsRoas = isRoasMetric(metricValue);

  useEffect(() => {
    if (readOnly) return;
    if (!String(condition.metric || "").trim()) return;
    if (!String(condition.operator || "").trim() && defaultOperator) {
      onChange?.({ operator: defaultOperator });
    }
  }, [readOnly, defaultOperator, condition.metric, condition.operator]);

  let metricsOptions = fields
    .filter((f) => {
      const name = f.field_name;
      if (blockAcos && isAcosMetric(name) && !currentIsAcos) return false;
      if (blockRoas && isRoasMetric(name) && !currentIsRoas) return false;
      return true;
    })
    .map((f) => ({
      label: f.display_name || formatFieldLabel(f.field_name),
      value: f.field_name
    }));
  metricsOptions = withFallbackOption(
    metricsOptions,
    metricValue,
    selectedField?.display_name || formatFieldLabel(metricValue)
  );

  let operatorsOptions = (selectedField?.operators || []).map((op) => ({
    label: formatOperatorLabel(op).toUpperCase(),
    value: op
  }));
  operatorsOptions = withFallbackOption(
    operatorsOptions,
    condition.operator,
    formatOperatorLabel(condition.operator).toUpperCase()
  );

  const valueKind = resolveFieldValueKind(selectedField);
  const isDropdown = valueKind === "dropdown";
  const isDate = valueKind === "date";
  const isText = valueKind === "text";
  const isPercent = valueKind === "percentage";
  const isBetween = ["between", "is_between"].includes(String(condition.operator || "").toLowerCase());
  const showValueTo = isBetween && (isDate || isPercent || valueKind === "number");

  let dropdownOptions = (selectedField?.options || []).map((opt) => ({
    label: String(opt),
    value: String(opt)
  }));
  if (isDropdown) {
    dropdownOptions = withFallbackOption(
      dropdownOptions,
      condition.value,
      String(condition.value ?? "")
    );
  }

  const metricError = errors[`metric_${condition.id}`];
  const operatorError = errors[`operator_${condition.id}`];
  const valueError = errors[`value_${condition.id}`];
  const valueToError = errors[`valueTo_${condition.id}`];

  return (
    <div
      className="w-full max-w-full overflow-visible rounded-[7px] px-3 py-2.5 shadow-[0_1px_3px_rgba(17,24,39,0.06)] sm:w-fit"
      style={{
        backgroundColor: softBg,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Condition
        </p>
        {!readOnly ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[var(--ink-muted)] transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1"
            aria-label="Remove criteria"
          >
            <TrashIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-start gap-2 overflow-visible">
        <div id={`metric_${condition.id}`} className="flex w-full min-w-0 flex-col sm:w-auto">
          <Select
            value={metricValue}
            onChange={(metric) => {
              if (blockAcos && isAcosMetric(metric) && !currentIsAcos) return;
              if (blockRoas && isRoasMetric(metric) && !currentIsRoas) return;
              clearError?.(`metric_${condition.id}`);
              clearError?.(`operator_${condition.id}`);
              clearError?.(`value_${condition.id}`);
              clearError?.(`valueTo_${condition.id}`);
              const field = findField(fields, metric);
              onChange?.({
                metric,
                operator: field?.operators?.[0] || "",
                value: "",
                valueTo: ""
              });
            }}
            options={metricsOptions}
            placeholder="Select metric"
            ariaLabel="Metric"
            disabled={readOnly}
            triggerClassName={`${INNER} ${metricError ? "border-red-500" : ""}`}
          />
          <FieldErrorTooltip
            id={`metric_${condition.id}-error`}
            show={Boolean(metricError)}
            message={metricError}
          />
        </div>

        {hasMetric ? (
          <>
            <div id={`operator_${condition.id}`} className="flex w-full min-w-0 flex-col sm:w-auto">
              <Select
                value={condition.operator}
                onChange={(operator) => {
                  clearError?.(`operator_${condition.id}`);
                  clearError?.(`valueTo_${condition.id}`);
                  const nextBetween = ["between", "is_between"].includes(
                    String(operator || "").toLowerCase()
                  );
                  onChange?.({
                    operator,
                    ...(!nextBetween ? { valueTo: "" } : {})
                  });
                }}
                options={operatorsOptions}
                ariaLabel="Operator"
                disabled={readOnly}
                triggerClassName={`${INNER} px-2 ${operatorError ? "border-red-500" : ""}`}
              />
              <FieldErrorTooltip
                id={`operator_${condition.id}-error`}
                show={Boolean(operatorError)}
                message={operatorError}
              />
            </div>

            <div
              id={`value_${condition.id}`}
              className={`flex w-full min-w-0 flex-col sm:shrink-0 ${isDropdown || isText ? "sm:min-w-[160px] sm:w-[200px]" : "sm:w-[140px]"}`}
            >
              {isDropdown ? (
                <Select
                  value={condition.value}
                  onChange={(val) => {
                    clearError?.(`value_${condition.id}`);
                    onChange?.({ value: val });
                  }}
                  options={dropdownOptions}
                  placeholder="Select value"
                  ariaLabel="Value"
                  autoWidth={false}
                  disabled={readOnly}
                  triggerClassName={`${INNER} w-full ${valueError ? "border-red-500" : ""}`}
                />
              ) : isDate ? (
                <DatePicker
                  value={condition.value || ""}
                  readOnly={readOnly}
                  onChange={(value) => {
                    if (readOnly) return;
                    clearError?.(`value_${condition.id}`);
                    onChange?.({ value });
                  }}
                  triggerClassName={getInputClass({ readOnly, hasError: Boolean(valueError) })}
                  ariaLabel="Value"
                />
              ) : isText ? (
                <input
                  type="text"
                  value={condition.value || ""}
                  readOnly={readOnly}
                  onChange={(event) => {
                    if (readOnly) return;
                    clearError?.(`value_${condition.id}`);
                    onChange?.({ value: event.target.value });
                  }}
                  placeholder="Enter text"
                  className={getInputClass({ readOnly, hasError: Boolean(valueError) })}
                />
              ) : (
                <NumericWithAffix
                  value={condition.value || ""}
                  readOnly={readOnly}
                  allowDecimal
                  allowNegative
                  affix={isPercent ? "%" : ""}
                  onChange={(value) => {
                    if (readOnly) return;
                    clearError?.(`value_${condition.id}`);
                    onChange?.({ value });
                  }}
                  placeholder={isPercent ? "Value" : "Number"}
                  inputClassName={getInputClass({ readOnly, hasError: Boolean(valueError) })}
                />
              )}
              <FieldErrorTooltip
                id={`value_${condition.id}-error`}
                show={Boolean(valueError)}
                message={valueError}
              />
            </div>

            {showValueTo ? (
              <div id={`valueTo_${condition.id}`} className="flex w-full shrink-0 flex-col sm:w-[140px]">
                {isDate ? (
                  <DatePicker
                    value={condition.valueTo || ""}
                    readOnly={readOnly}
                    onChange={(valueTo) => {
                      if (readOnly) return;
                      clearError?.(`valueTo_${condition.id}`);
                      onChange?.({ valueTo });
                    }}
                    triggerClassName={getInputClass({ readOnly, hasError: Boolean(valueToError) })}
                    ariaLabel="Value to"
                  />
                ) : (
                  <NumericWithAffix
                    value={condition.valueTo || ""}
                    readOnly={readOnly}
                    allowDecimal
                    allowNegative
                    affix={isPercent ? "%" : ""}
                    onChange={(value) => {
                      if (readOnly) return;
                      clearError?.(`valueTo_${condition.id}`);
                      onChange?.({ valueTo: value });
                    }}
                    placeholder={isPercent ? "To value" : "To number"}
                    inputClassName={getInputClass({ readOnly, hasError: Boolean(valueToError) })}
                  />
                )}
                <FieldErrorTooltip
                  id={`valueTo_${condition.id}-error`}
                  show={Boolean(valueToError)}
                  message={valueToError}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}