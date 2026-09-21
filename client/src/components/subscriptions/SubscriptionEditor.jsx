import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import SubscriptionForm from "./SubscriptionForm";
import {
  emptySubscriptionForm,
  subscriptionToForm,
} from "./subscriptionHelpers";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import subscriptionService from "../../services/subscriptionService";
import categoryService from "../../services/categoryService";
import paymentMethodService from "../../services/paymentMethodService";
import {
  subscriptionKeys,
  categoryKeys,
  paymentMethodKeys,
  expenseKeys,
} from "../../services/queryKeys";

const SubscriptionEditor = ({ mode = "add", subscriptionId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptySubscriptionForm);

  const detailQuery = useQuery({
    queryKey: subscriptionKeys.detail(subscriptionId),
    queryFn: async () => {
      const data = await subscriptionService.getById(subscriptionId);
      return data.subscription;
    },
    enabled: isEdit,
    retry: false,
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");
      return data.categories ?? [];
    },
  });

  const paymentMethodsQuery = useQuery({
    queryKey: paymentMethodKeys.options(),
    queryFn: async () => {
      const data = await paymentMethodService.options();
      return data.paymentMethods ?? [];
    },
  });

  useEffect(() => {
    if (!isEdit) {
      setForm(emptySubscriptionForm());
      return;
    }
    if (detailQuery.data) {
      setForm(subscriptionToForm(detailQuery.data));
    }
  }, [isEdit, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load subscription");
    navigate("/subscriptions", { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? subscriptionService.update(subscriptionId, payload)
        : subscriptionService.create(payload),
    onSuccess: async () => {
      showSuccessToast(
        isEdit ? "Subscription updated successfully" : "Subscription added successfully"
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      ]);
      navigate("/subscriptions");
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      serviceName: form.serviceName.trim(),
      amount: Number(form.amount),
      billingCycle: form.billingCycle,
      nextBillingDate: form.nextBillingDate,
      category: form.category,
      paymentMode: form.paymentMode,
      reminderDaysBefore: Number(form.reminderDaysBefore),
      status: form.status,
      autoAddExpense: Boolean(form.autoAddExpense),
      notes: form.notes.trim(),
    });
  };

  if (isEdit && detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (isEdit && !detailQuery.data) return null;

  const categoryOptions = (categoriesQuery.data ?? []).map((c) => c.name);
  const paymentOptions = (paymentMethodsQuery.data ?? []).map((p) => p.name);

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <PageBackHeader
        backTo="/subscriptions"
        backLabel="Back to subscriptions"
        title={isEdit ? "Edit subscription" : "Add subscription"}
        subtitle={
          isEdit
            ? `Update details for “${detailQuery.data.serviceName}”`
            : "Set up a recurring bill with optional auto-expense on billing day"
        }
      />

      <SubscriptionForm
        form={form}
        onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
        editing={isEdit ? detailQuery.data : null}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/subscriptions")}
        loading={saveMutation.isPending}
        categoryOptions={categoryOptions}
        paymentOptions={paymentOptions}
        variant="page"
      />
    </div>
  );
};

export default SubscriptionEditor;
