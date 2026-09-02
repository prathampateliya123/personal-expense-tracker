import { useMemo } from "react";
import Select from "../ui/Select";
import NumericWithAffix from "../ui/NumericWithAffix";
import FieldErrorTooltip from "../ui/FieldErrorTooltip";
import {
  actionUnitOptions,
  listRuleActions,
  normalizeActionUnit
} from "../../utils/ruleReportsConfig";

const FIELD =
  "h-[36px] rounded-[7px] border bg-[var(--surface)] text-[13px] font-medium text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:font-normal placeholder:text-[var(--ink-subtle)] hover:border-[var(--border-strong)] focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_rgba(246,143,61,0.12)]";

function isValuelessAction(actionType = "") {
  const lowerAction = String(actionType).toLowerCase();
  return (
    lowerAction.includes("pause") ||
    lowerAction.includes("enable") ||
    lowerAction.includes("negative")
  );
}

function isSetBidAction(actionType = "") {
  return String(actionType).toLowerCase().includes("set_bid");
}

function isAdjustBidAction(actionType = "") {
  const lowerAction = String(actionType).toLowerCase();
  return (
    lowerAction.includes("bid") &&
    !isSetBidAction(lowerAction) &&
    (lowerAction.includes("increase") || lowerAction.includes("decrease"))
  );
}

export default function ThenActionRow({
  blockId,
  action,
  currentSourceConfig,
  errors = {},
  clearError,
  onChange,
  readOnly = false
}) {
  const parsedActions = useMemo(
    () => listRuleActions(currentSourceConfig),
    [currentSourceConfig]
  );

  const actionOptions = useMemo(
    () => parsedActions.map((act) => ({ value: act.value, label: act.label })),
    [parsedActions]
  );

  const selectedAction = useMemo(
    () => parsedActions.find((act) => act.value === action.actionType) || null,
    [parsedActions, action.actionType]
  );

  const unitOptions = useMemo(
    () => actionUnitOptions(selectedAction?.units || []),
    [selectedAction]
  );

  const hasAction = Boolean(action.actionType);
  const needsValue = hasAction && !isValuelessAction(action.actionType);
  const showMaxBid =
    !isSetBidAction(action.actionType) &&
    (Boolean(selectedAction?.hasMax) || isAdjustBidAction(action.actionType));
  const activeUnit = normalizeActionUnit(action.unit) || unitOptions[0]?.value || "";

  const actionTypeError = errors[`actionType_${blockId}`];
  const actionValueError = errors[`actionValue_${blockId}`];
  const actionUnitError = errors[`actionUnit_${blockId}`];

  return (
    <div className="flex flex-wrap items-start gap-2">
      <div id={`actionType_${blockId}`} className="flex min-w-0 flex-col">
        <Select
          value={action.actionType}
          onChange={(actionType) => {
            clearError?.(`actionType_${blockId}`);
            clearError?.(`actionValue_${blockId}`);
            clearError?.(`actionUnit_${blockId}`);
            const next = parsedActions.find((act) => act.value === actionType);
            const nextUnits = actionUnitOptions(next?.units || []);
            onChange?.({
              actionType,
              unit: nextUnits[0]?.value || "",
              ...(isValuelessAction(actionType) ? { value: "", maxBid: "" } : {}),
              ...(isSetBidAction(actionType) ? { maxBid: "" } : {})
            });
          }}
          options={actionOptions}
          placeholder="Select Action"
          ariaLabel="Action type"
          disabled={readOnly}
          triggerClassName={`h-[36px] w-full px-3 font-medium sm:min-w-[150px] sm:w-auto ${actionTypeError ? "border-red-500" : ""}`}
        />
        <FieldErrorTooltip
          id={`actionType_${blockId}-error`}
          show={Boolean(actionTypeError)}
          message={actionTypeError}
        />
      </div>

      {needsValue ? (
        <>
          {unitOptions.length > 1 ? (
            <div id={`actionUnit_${blockId}`} className="flex min-w-0 flex-col">
              <Select
                value={activeUnit}
                onChange={(unit) => {
                  clearError?.(`actionUnit_${blockId}`);
                  onChange?.({ unit: normalizeActionUnit(unit) });
                }}
                options={unitOptions}
                ariaLabel="Action unit"
                disabled={readOnly}
                triggerClassName={`h-[36px] w-full px-3 font-medium sm:min-w-[140px] sm:w-auto ${actionUnitError ? "border-red-500" : ""}`}
              />
              <FieldErrorTooltip
                id={`actionUnit_${blockId}-error`}
                show={Boolean(actionUnitError)}
                message={actionUnitError}
              />
            </div>
          ) : null}

          <div id={`actionValue_${blockId}`} className="flex w-full shrink-0 flex-col sm:w-[180px]">
            <NumericWithAffix
              value={action.value || ""}
              readOnly={readOnly}
              allowDecimal
              affix={activeUnit === "percentage" ? "%" : ""}
              onChange={(value) => {
                if (readOnly) return;
                clearError?.(`actionValue_${blockId}`);
                onChange?.({ value });
              }}
              placeholder={
                activeUnit === "number" || activeUnit === "fixed" ? "Amount" : "Value"
              }
              inputClassName={`${FIELD} w-full px-2.5 ${readOnly
                  ? "border-[var(--border)] cursor-default"
                  : actionValueError
                    ? "border-red-500"
                    : "border-[var(--border)]"
                }`}
            />
            <FieldErrorTooltip
              id={`actionValue_${blockId}-error`}
              show={Boolean(actionValueError)}
              message={actionValueError}
            />
          </div>

          {showMaxBid ? (
            <div className="w-full sm:w-[148px]">
              <NumericWithAffix
                value={action.maxBid ?? ""}
                readOnly={readOnly}
                allowDecimal
                maxDecimals={2}
                affix="₹"
                affixPosition="start"
                onChange={(maxBid) => {
                  if (readOnly) return;
                  onChange?.({ maxBid });
                }}
                placeholder="Maximum bid"
                inputClassName={`${FIELD} border-[var(--border)] w-full pr-2.5 ${readOnly ? "cursor-default" : ""
                  }`}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}