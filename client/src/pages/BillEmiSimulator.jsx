import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import { IconPlus } from "../components/ui/Icons";
import SimulatorStats from "../components/simulator/SimulatorStats";
import SavedSimulations from "../components/simulator/SavedSimulations";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import billSimulationService, {
  INITIAL_BILL_SIM_FILTERS,
} from "../services/billSimulationService";
import { billSimulationKeys } from "../services/queryKeys";

const BillEmiSimulator = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters] = useState({ ...INITIAL_BILL_SIM_FILTERS, limit: 50 });

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

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Bill & EMI Simulator
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Saved EMI and bill scenarios with reminders — open the calculator
            to add or edit
          </p>
        </div>
        <Link
          to="/simulator/add"
          className="btn-primary inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
        >
          <IconPlus className="h-4 w-4" />
          New scenario
        </Link>
      </div>

      <SimulatorStats stats={statsQuery.data} />

      <SavedSimulations
        items={listQuery.data?.simulations ?? []}
        loading={listQuery.isLoading || listQuery.isFetching}
        onEdit={(item) => navigate(`/simulator/${item._id}/edit`)}
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
