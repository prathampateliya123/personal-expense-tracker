import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import SimulatorForm from "./SimulatorForm";
import SimulatorResults from "./SimulatorResults";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import billSimulationService from "../../services/billSimulationService";
import { billSimulationKeys } from "../../services/queryKeys";
import {
  calculateBillProjection,
  calculateEmi,
  emptyBillForm,
  emptyEmiForm,
  emptyReminderForm,
  isEmiBillType,
  simulationToForms,
} from "../../utils/billSimulator";

const SimulatorEditor = ({ mode = "add", simulationId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const [billType, setBillType] = useState("loan_emi");
  const [emiForm, setEmiForm] = useState(emptyEmiForm);
  const [billForm, setBillForm] = useState(emptyBillForm);
  const [reminderForm, setReminderForm] = useState(emptyReminderForm);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const detailQuery = useQuery({
    queryKey: billSimulationKeys.detail(simulationId),
    queryFn: async () => {
      const data = await billSimulationService.getById(simulationId);
      return data.simulation;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (!isEdit) {
      setBillType("loan_emi");
      setEmiForm(emptyEmiForm());
      setBillForm(emptyBillForm());
      setReminderForm(emptyReminderForm());
      setTitle("");
      setNotes("");
      return;
    }
    if (!detailQuery.data) return;

    const mapped = simulationToForms(detailQuery.data);
    setBillType(mapped.billType);
    setEmiForm(mapped.emiForm);
    setBillForm(mapped.billForm);
    setReminderForm(mapped.reminderForm);
    setTitle(mapped.title);
    setNotes(mapped.notes);
  }, [isEdit, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load scenario");
    navigate("/simulator", { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate]);

  const result = useMemo(() => {
    if (isEmiBillType(billType)) {
      return calculateEmi(emiForm);
    }
    return calculateBillProjection(billForm);
  }, [billType, emiForm, billForm]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? billSimulationService.update(simulationId, payload)
        : billSimulationService.create(payload),
    onSuccess: async () => {
      showSuccessToast(isEdit ? "Scenario updated" : "Scenario saved");
      await queryClient.invalidateQueries({
        queryKey: billSimulationKeys.all,
      });
      navigate("/simulator");
    },
    onError: handleApiError,
  });

  const handleSave = () => {
    if (!title.trim()) {
      handleApiError({ message: "Enter a title to save this scenario" });
      return;
    }
    if (result?.error) {
      handleApiError({ message: result.error });
      return;
    }
    if (reminderForm.reminderEnabled && !reminderForm.nextDueDate) {
      handleApiError({ message: "Select a next due date for the reminder" });
      return;
    }

    const payload = {
      title: title.trim(),
      billType,
      notes: notes.trim(),
      reminderEnabled: Boolean(reminderForm.reminderEnabled),
      nextDueDate: reminderForm.reminderEnabled
        ? reminderForm.nextDueDate
        : null,
      reminderDaysBefore: Number(reminderForm.reminderDaysBefore || 3),
    };

    if (isEmiBillType(billType)) {
      Object.assign(payload, {
        loanAmount: Number(emiForm.loanAmount),
        interestRate: Number(emiForm.interestRate),
        tenureMonths: Number(emiForm.tenureMonths),
        paidEmis: Number(emiForm.paidEmis || 0),
      });
    } else {
      Object.assign(payload, {
        billAmount: Number(billForm.billAmount),
        frequency: billForm.frequency,
      });
    }

    saveMutation.mutate(payload);
  };

  if (isEdit && detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (isEdit && !detailQuery.data) return null;

  const canSave = Boolean(title.trim()) && result && !result.error;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <PageBackHeader
        backTo="/simulator"
        backLabel="Back to Bill & EMI"
        title={isEdit ? "Edit scenario" : "New scenario"}
        subtitle={
          isEdit
            ? `Update “${detailQuery.data.title}” — paid EMIs, reminder, and amounts`
            : "Calculate EMI or bill cost, set a reminder, then save the scenario"
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SimulatorForm
          billType={billType}
          onBillTypeChange={setBillType}
          emiForm={emiForm}
          onEmiChange={(patch) => setEmiForm((prev) => ({ ...prev, ...patch }))}
          billForm={billForm}
          onBillChange={(patch) =>
            setBillForm((prev) => ({ ...prev, ...patch }))
          }
          reminderForm={reminderForm}
          onReminderChange={(patch) =>
            setReminderForm((prev) => ({ ...prev, ...patch }))
          }
          title={title}
          onTitleChange={setTitle}
          notes={notes}
          onNotesChange={setNotes}
          onSave={handleSave}
          onCancelEdit={() => navigate("/simulator")}
          saving={saveMutation.isPending}
          canSave={canSave}
          editing={isEdit}
        />
        <SimulatorResults billType={billType} result={result} />
      </div>
    </div>
  );
};

export default SimulatorEditor;
