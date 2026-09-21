import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import { IconPlus } from "../components/ui/Icons";
import TripStats from "../components/trips/TripStats";
import TripList from "../components/trips/TripList";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import tripService, { INITIAL_TRIP_FILTERS } from "../services/tripService";
import { tripKeys } from "../services/queryKeys";

const Trips = () => {
  const queryClient = useQueryClient();
  const [filters] = useState({ ...INITIAL_TRIP_FILTERS, limit: 50 });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const listQuery = useQuery({
    queryKey: tripKeys.list(filters),
    queryFn: () => tripService.list(filters),
  });

  const statsQuery = useQuery({
    queryKey: tripKeys.stats(),
    queryFn: async () => {
      const data = await tripService.getStats();
      return data.stats;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tripService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Trip deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
    onError: handleApiError,
  });

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Trip expenses
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Shared trip spend, who paid, splits, and settlements
          </p>
        </div>
        <Link
          to="/trips/add"
          className="btn-primary inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
        >
          <IconPlus className="h-4 w-4" />
          New trip
        </Link>
      </div>

      <TripStats stats={statsQuery.data} />

      <TripList
        items={listQuery.data?.trips ?? []}
        loading={listQuery.isLoading || listQuery.isFetching}
        onDelete={setDeleteTarget}
        deleting={deleteMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete trip?"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.title}” and all its expenses?`
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

export default Trips;
