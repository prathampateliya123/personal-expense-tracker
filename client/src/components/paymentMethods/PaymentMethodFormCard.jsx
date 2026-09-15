import Button from "../ui/Button";

const PaymentMethodFormCard = ({
  title,
  form,
  setForm,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}) => (
  <form
    onSubmit={onSubmit}
    className="card flex w-full flex-col gap-4 p-5 sm:p-6"
  >
    <h2 className="text-base font-semibold text-textPrimary">{title}</h2>
    <div>
      <label
        htmlFor="payment-method-name"
        className="mb-1.5 block text-sm font-medium text-textPrimary"
      >
        Name
      </label>
      <input
        id="payment-method-name"
        type="text"
        maxLength={40}
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        className="fintech-input"
        placeholder="e.g. Cash, UPI, Card"
        autoFocus
      />
    </div>
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {onCancel ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      ) : null}
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  </form>
);

export default PaymentMethodFormCard;
