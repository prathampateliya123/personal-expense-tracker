import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import SavingFormModal from "./SavingFormModal";
import {
  emptySavingForm,
  savingToForm,
} from "./wealthHelpers";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import savingService from "../../services/savingService";
import { savingKeys } from "../../services/queryKeys";

const SavingEditor = ({ mode = "add", savingId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ ...emptySavingForm });

  const detailQuery = useQuery({
    queryKey: savingKeys.detail(savingId),
    queryFn: async () => {
      const data = await savingService.getById(savingId);
      return data.saving;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...emptySavingForm });
      return;
    }
    if (detailQuery.data) setForm(savingToForm(detailQuery.data));
  }, [isEdit, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load saving goal");
    navigate("/wealth?tab=savings", { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? savingService.update(savingId, payload)
        : savingService.create(payload),
    onSuccess: async () => {
      showSuccessToast(
        isEdit ? "Saving goal updated successfully" : "Saving goal created successfully"
      );
      await queryClient.invalidateQueries({ queryKey: savingKeys.all });
      navigate("/wealth?tab=savings");
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount || 0);

    if (!name) {
      handleApiError({ message: "Goal name is required" });
      return;
    }
    if (!form.targetAmount || Number.isNaN(targetAmount) || targetAmount <= 0) {
      handleApiError({ message: "Enter a valid target amount" });
      return;
    }
    if (Number.isNaN(currentAmount) || currentAmount < 0) {
      handleApiError({ message: "Saved amount cannot be negative" });
      return;
    }

    saveMutation.mutate({
      name,
      targetAmount,
      currentAmount,
      deadline: form.deadline || null,
      notes: form.notes.trim(),
      status: form.status,
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
        backTo="/wealth?tab=savings"
        backLabel="Back to wealth"
        title={isEdit ? "Edit saving goal" : "Add saving goal"}
        subtitle={
          isEdit
            ? `Update details for “${detailQuery.data.name}”`
            : "Set a target and track progress toward your goal"
        }
      />
      <SavingFormModal
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        editing={isEdit ? detailQuery.data : null}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/wealth?tab=savings")}
        loading={saveMutation.isPending}
        variant="page"
      />
    </div>
  );
};

export default SavingEditor;
