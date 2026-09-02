import Input from "../ui/Input";

export default function RuleNameField({
  value,
  onChange,
  error,
  readOnly = false,
  placeholder = "Enter rule name"
}) {
  const hasError = Boolean(error);

  return (
    <div id="name">
      <Input
        id="rule-name"
        type="text"
        label="Rule Name"
        required
        value={value}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(event) => {
          if (readOnly) return;
          onChange?.(event.target.value);
        }}
        placeholder={placeholder}
        autoComplete="off"
        error={hasError}
        errorMessage={error || "Please enter a rule name."}
        errorDisplay="text"
      />
    </div>
  );
}