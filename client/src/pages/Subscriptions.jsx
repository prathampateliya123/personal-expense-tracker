import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../components/modal/ConfirmModal";
import { IconPlus } from "../components/ui/Icons";
import SubscriptionStats from "../components/subscriptions/SubscriptionStats";
import SubscriptionList from "../components/subscriptions/SubscriptionList";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import subscriptionService, {
  INITIAL_SUBSCRIPTION_FILTERS,
} from "../services/subscriptionService";
import {
  subscriptionKeys,
  expenseKeys,
} from "../services/queryKeys";
import { debounce } from "../utils/helper";
import { DEFAULT_DEBOUNCE_MS } from "../utils/constants";

const Subscriptions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...INITIAL_SUBSCRIPTION_FILTERS });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debounceSearch = useMemo(
    () => debounce(setDebouncedSearch, DEFAULT_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debounceSearch(searchInput);
    return () => debounceSearch.cancel();
  }, [searchInput, debounceSearch]);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const listQuery = useQuery({
    queryKey: subscriptionKeys.list(filters),
    queryFn: () => subscriptionService.list(filters),
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: subscriptionKeys.stats(),
    queryFn: async () => {
      const data = await subscriptionService.getStats();
      return data.stats;
    },
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
    ]);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => subscriptionService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Subscription deleted");
      setDeleteTarget(null);
      await invalidateAll();
    },
    onError: handleApiError,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action }) => subscriptionService[action](id),
    onSuccess: async (_data, vars) => {
      const labels = {
        pause: "Subscription paused",
        resume: "Subscription resumed",
        cancel: "Subscription cancelled",
      };
      showSuccessToast(labels[vars.action] || "Updated");
      await invalidateAll();
    },
    onError: handleApiError,
  });

  const listData = listQuery.data;
  const items = listData?.subscriptions ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const currentPage = listData?.currentPage ?? filters.page;
  const loading = listQuery.isLoading || listQuery.isFetching;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Track recurring bills and auto-add expenses on billing day
          </p>
        </div>
        <Link
          to="/subscriptions/add"
          className="btn-primary inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
        >
          <IconPlus className="h-4 w-4" />
          Add subscription
        </Link>
      </div>

      <SubscriptionStats stats={statsQuery.data} />

      <SubscriptionList
        items={items}
        loading={loading}
        filters={filters}
        onFiltersChange={(updates) =>
          setFilters((prev) => ({ ...prev, ...updates }))
        }
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page < 1 || page > totalPages) return;
          setFilters((prev) => ({ ...prev, page }));
        }}
        onEdit={(item) => navigate(`/subscriptions/${item._id}/edit`)}
        onDelete={setDeleteTarget}
        onPause={(item) =>
          statusMutation.mutate({ id: item._id, action: "pause" })
        }
        onResume={(item) =>
          statusMutation.mutate({ id: item._id, action: "resume" })
        }
        onCancel={(item) =>
          statusMutation.mutate({ id: item._id, action: "cancel" })
        }
        actionLoading={statusMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete subscription?"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.serviceName}”? Past auto-expenses stay in your expense list.`
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

export default Subscriptions;
