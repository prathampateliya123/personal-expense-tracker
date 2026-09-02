import ProductPicker from "../../ProductPicker";

export default function StepProducts({
  form,
  errors = {},
  onChange,
  clearError,
  readOnly = false
}) {
  return (
    <ProductPicker
      selectedIds={form.selectedProductIds || []}
      selectedProducts={form.selectedProducts || []}
      error={errors.products}
      readOnly={readOnly}
      splitHeader
      onChange={(selectedProductIds, selectedProducts = []) => {
        if (readOnly) return;
        clearError?.("products");
        onChange?.({ selectedProductIds, selectedProducts });
      }}
    />
  );
}