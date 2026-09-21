import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import SimulatorStats from "../components/simulator/SimulatorStats";
import SimulatorForm from "../components/simulator/SimulatorForm";
import SimulatorResults from "../components/simulator/SimulatorResults";
import SavedSimulations from "../components/simulator/SavedSimulations";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import billSimulationService, {
  INITIAL_BILL_SIM_FILTERS,
} from "../services/billSimulationService";
import { billSimulationKeys } from "../services/queryKeys";
import {
  calculateBillProjection,
  calculateEmi,
  emptyBillForm,
  emptyEmiForm,
  isEmiBillType,
} from "../utils/billSimulator";

const BillEmiSimulator = () => {
  const queryClient = useQueryClient();
  const [billType, setBillType] = useState("loan_emi");
  const [emiForm, setEmiForm] = useState(emptyEmiForm);
  const [billForm, setBillForm] = useState(emptyBillForm);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters] = useState({ ...INITIAL_BILL_SIM_FILTERS, limit: 20 });

  const result = useMemo(() => {
    if (isEmiBillType(billType)) {
      return calculateEmi(emiForm);
    }
    return calculateBillProjection(billForm);
  }, [billType, emiForm, billForm]);

  const listQuery = useQuery({
    queryKey: billSimulationKeys.list(filters),
    queryFn: () => billSimulationService.list(filters),
  });

  const statsQuery = useQuery({
    queryKey: billSimulationKeys.stats(),
    queryFn: async () => {
      const data = await billSimulationService.getStats();
      return data.stats;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => billSimulationService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Scenario saved");
      setTitle("");
      setNotes("");
      await queryClient.invalidateQueries({
        queryKey: billSimulationKeys.all,
      });
    },
    onError: handleApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => billSimulationService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Scenario deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({
        queryKey: billSimulationKeys.all,
      });
    },
    onError: handleApiError,
  });

  const handleBillTypeChange = (next) => {
    setBillType(next);
  };

  const handleSave = () => {
    if (!title.trim()) {
      handleApiError({ message: "Enter a title to save this scenario" });
      return;
    }
    if (result?.error) {
      handleApiError({ message: result.error });
      return;
    }

    const payload = {
      title: title.trim(),
      billType,
      notes: notes.trim(),
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

  const canSave = Boolean(title.trim()) && result && !result.error;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
          Bill & EMI Simulator
        </h1>
        <p className="mt-1 text-sm text-textSecondary">
          For ongoing loans, enter how many EMIs are already paid — outstanding
          balance and remaining schedule stay accurate. Also estimate
          monthly/yearly cost for regular bills.
        </p>
      </div>

      <SimulatorStats stats={statsQuery.data} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SimulatorForm
          billType={billType}
          onBillTypeChange={handleBillTypeChange}
          emiForm={emiForm}
          onEmiChange={(patch) => setEmiForm((prev) => ({ ...prev, ...patch }))}
          billForm={billForm}
          onBillChange={(patch) =>
            setBillForm((prev) => ({ ...prev, ...patch }))
          }
          title={title}
          onTitleChange={setTitle}
          notes={notes}
          onNotesChange={setNotes}
          onSave={handleSave}
          saving={saveMutation.isPending}
          canSave={canSave}
        />
        <SimulatorResults billType={billType} result={result} />
      </div>

      <SavedSimulations
        items={listQuery.data?.simulations ?? []}
        loading={listQuery.isLoading || listQuery.isFetching}
        onDelete={setDeleteTarget}
        deleting={deleteMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete scenario?"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.title}” from saved simulations?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        confirming={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
      />
    </div>
  );
};

export default BillEmiSimulator;
