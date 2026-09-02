import NotificationFields from "../../NotificationFields";
import MasterRuleToggle from "../../MasterRuleToggle";

export default function StepNotifyConfirm({
  form,
  errors = {},
  onChange,
  readOnly = false
}) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <NotificationFields
        notifyPass={form.notifyPass}
        notifyFail={form.notifyFail}
        readOnly={readOnly}
        onChange={onChange}
        splitHeader
      />

      <MasterRuleToggle
        checked={form.isMasterRule}
        readOnly={readOnly}
        onChange={(isMasterRule) => onChange?.({ isMasterRule })}
      />

      {!readOnly && errors.confirm ? (
        <p className="text-[12px] font-medium text-red-500">{errors.confirm}</p>
      ) : null}
    </div>
  );
}