import ConditionActionBuilder from "../../ConditionActionBuilder";
import FieldErrorTooltip from "../../../ui/FieldErrorTooltip";
import PanZoomCanvas from "../../PanZoomCanvas";

export default function StepConditions({
  form,
  errors = {},
  currentSourceConfig,
  onChange,
  clearError,
  readOnly = false,
  wheelZoomMode = "scroll"
}) {
  const blockError = errors.ruleBlocks;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2">
      {!readOnly && blockError ? (
        <div id="ruleBlocks" className="shrink-0 rounded-[7px] border border-red-200 bg-red-50 px-3 py-2">
          <FieldErrorTooltip
            id="ruleBlocks-error"
            show
            message={blockError}
            className="mt-0"
          />
        </div>
      ) : (
        <div id="ruleBlocks" className="sr-only" aria-hidden />
      )}

      <PanZoomCanvas className="min-h-0" wheelZoomMode={wheelZoomMode}>
        <ConditionActionBuilder
          ruleBlocks={form.ruleBlocks}
          currentSourceConfig={currentSourceConfig}
          errors={readOnly ? {} : errors}
          clearError={clearError}
          readOnly={readOnly}
          embedInCanvas
          onChange={(ruleBlocks) => {
            if (readOnly) return;
            clearError?.("ruleBlocks");
            onChange?.({ ruleBlocks });
          }}
        />
      </PanZoomCanvas>
    </div>
  );
}