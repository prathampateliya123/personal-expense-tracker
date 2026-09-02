import RuleSection from "./RuleSection";
import Input from "../ui/Input";

export default function LookbackPeriod({
  lookbackDays,
  waitDays,
  errors = {},
  clearError,
  onChange,
  readOnly = false,
  splitHeader = false
}) {
  const lookbackError = errors.lookbackDays;
  const waitError = errors.waitDays;

  return (
    <RuleSection
      title="Lookback Period"
      description="When the rule runs it checks the lookback days of data, then waits the skip days before running again."
      splitHeader={splitHeader}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <div id="lookbackDays" className="min-w-0 w-full flex-1 sm:max-w-[240px]">
          <Input
            id="input-lookbackDays"
            type="text"
            numeric="integer"
            min={1}
            max={90}
            label="Days"
            required
            size="md"
            value={lookbackDays ?? ""}
            readOnly={readOnly}
            disabled={readOnly}
            error={Boolean(lookbackError)}
            errorMessage={lookbackError || ""}
            errorDisplay="text"
            info="How many past days of data to evaluate when the rule runs. Example: 7 days = check the last 7 days of performance."
            infoLabel="About lookback days"
            onChange={(event) => {
              if (readOnly) return;
              clearError?.("lookbackDays");
              const nextValue = event.target.value;
              onChange?.({ lookbackDays: nextValue === "" ? "" : Number(nextValue) });
            }}
          />
        </div>

        <div id="waitDays" className="min-w-0 w-full flex-1 sm:max-w-[280px]">
          <Input
            id="input-waitDays"
            type="text"
            numeric="integer"
            min={0}
            max={30}
            label="Skip Days"
            required
            size="md"
            value={waitDays ?? ""}
            readOnly={readOnly}
            disabled={readOnly}
            error={Boolean(waitError)}
            errorMessage={waitError || ""}
            errorDisplay="text"
            info="After the rule runs today, wait this many days before it runs again. Example: 7 days + 3 skip days → run today, skip 3 days, run again, skip 3 days, and so on."
            infoLabel="About skip days"
            onChange={(event) => {
              if (readOnly) return;
              clearError?.("waitDays");
              const nextValue = event.target.value;
              onChange?.({ waitDays: nextValue === "" ? "" : Number(nextValue) });
            }}
          />
        </div>
      </div>
    </RuleSection>
  );
}