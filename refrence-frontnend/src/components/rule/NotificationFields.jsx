import RuleSection from "./RuleSection";
import Textarea from "../ui/Textarea";

const readOnlyTextareaClass =
  "cursor-default hover:border-[var(--border)] focus:border-[var(--border)] focus:shadow-none";

export default function NotificationFields({
  notifyPass = "",
  notifyFail = "",
  onChange,
  readOnly = false,
  splitHeader = false
}) {
  return (
    <RuleSection
      title="Notifications"
      description="Optional messages for successful and failed rule runs."
      splitHeader={splitHeader}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Textarea
          label="Pass Message"
          value={notifyPass}
          readOnly={readOnly}
          onChange={(event) => {
            if (readOnly) return;
            onChange?.({ notifyPass: event.target.value });
          }}
          rows={4}
          placeholder="Message when the rule runs successfully..."
          textareaClassName={readOnly ? readOnlyTextareaClass : ""}
        />
        <Textarea
          label="Fail Message"
          value={notifyFail}
          readOnly={readOnly}
          onChange={(event) => {
            if (readOnly) return;
            onChange?.({ notifyFail: event.target.value });
          }}
          rows={4}
          placeholder="Message when the rule fails or skips..."
          textareaClassName={readOnly ? readOnlyTextareaClass : ""}
        />
      </div>
    </RuleSection>
  );
}