import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import InvestmentFormModal from "./InvestmentFormModal";
import {
  emptyInvestmentForm,
  investmentToForm,
} from "./wealthHelpers";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import investmentService from "../../services/investmentService";
import { investmentKeys } from "../../services/queryKeys";
import { toDateInputValue } from "../../utils/wealthConstants";

const InvestmentEditor = ({ mode = "add", investmentId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    ...emptyInvestmentForm,
    purchaseDate: toDateInputValue(new Date()),
  });

  const detailQuery = useQuery({
    queryKey: investmentKeys.detail(investmentId),
    queryFn: async () => {
      const data = await investmentService.getById(investmentId);
      return data.investment;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (!isEdit) {
      setForm({
        ...emptyInvestmentForm,
        purchaseDate: toDateInputValue(new Date()),
      });
      return;
    }
    if (detailQuery.data) setForm(investmentToForm(detailQuery.data));
  }, [isEdit, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load investment");
    navigate("/wealth?tab=investments", { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? investmentService.update(investmentId, payload)
        : investmentService.create(payload),
    onSuccess: async () => {
      showSuccessToast(
        isEdit
          ? "Investment updated successfully"
          : "Investment added successfully"
      );
      await queryClient.invalidateQueries({ queryKey: investmentKeys.all });
      navigate("/wealth?tab=investments");
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const amountInvested = Number(form.amountInvested);
    const currentValue = Number(form.currentValue);

    if (!name) {
      handleApiError({ message: "Investment name is required" });
      return;
    }
    if (
      !form.amountInvested ||
      Number.isNaN(amountInvested) ||
      amountInvested <= 0
    ) {
      handleApiError({ message: "Enter a valid invested amount" });
      return;
    }
    if (form.currentValue === "" || Number.isNaN(currentValue) || currentValue < 0) {
      handleApiError({ message: "Enter a valid current value" });
      return;
    }

    saveMutation.mutate({
      name,
      type: form.type,
      amountInvested,
      currentValue,
      purchaseDate: form.purchaseDate,
      institution: form.institution.trim(),
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

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <PageBackHeader
        backTo="/wealth?tab=investments"
        backLabel="Back to wealth"
        title={isEdit ? "Edit investment" : "Add investment"}
        subtitle={
          isEdit
            ? `Update details for “${detailQuery.data.name}”`
            : "Record a holding and track its current value"
        }
      />
      <InvestmentFormModal
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        editing={isEdit ? detailQuery.data : null}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/wealth?tab=investments")}
        loading={saveMutation.isPending}
        variant="page"
      />
    </div>
  );
};

export default InvestmentEditor;
