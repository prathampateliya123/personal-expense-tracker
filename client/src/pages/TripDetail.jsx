import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../components/common/PageBackHeader";
import ConfirmModal from "../components/modal/ConfirmModal";
import TripExpenseForm from "../components/trips/TripExpenseForm";
import TripDetailPanels from "../components/trips/TripDetailPanels";
import { IconPlus, PencilSquareIcon } from "../components/ui/Icons";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import tripService from "../services/tripService";
import { tripKeys } from "../services/queryKeys";
import {
  emptyTripExpenseForm,
  getTripStatusLabel,
  tripStatusBadgeClass,
} from "../utils/tripConstants";
import { formatCurrency, formatDate } from "../utils/formatters";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);

  const detailQuery = useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => tripService.getById(id),
    retry: false,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: tripKeys.all });
  };

  const applyBundle = (data) => {
    queryClient.setQueryData(tripKeys.detail(id), data);
  };

  const addExpenseMutation = useMutation({
    mutationFn: (payload) => tripService.addExpense(id, payload),
    onSuccess: async (data) => {
      showSuccessToast("Expense added");
      applyBundle(data);
      setShowExpenseForm(false);
      await invalidate();
    },
    onError: handleApiError,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => tripService.removeExpense(id, expenseId),
    onSuccess: async (data) => {
      showSuccessToast("Expense deleted");
      setDeleteExpense(null);
      applyBundle(data);
      await invalidate();
    },
    onError: handleApiError,
  });

  const settlementMutation = useMutation({
    mutationFn: (payload) => tripService.recordSettlement(id, payload),
    onSuccess: async (data) => {
      showSuccessToast("Settlement recorded");
      applyBundle(data);
      await invalidate();
    },
    onError: handleApiError,
  });

  const undoSettlementMutation = useMutation({
    mutationFn: (settlementId) =>
      tripService.removeSettlement(id, settlementId),
    onSuccess: async (data) => {
      showSuccessToast("Settlement removed");
      applyBundle(data);
      await invalidate();
    },
    onError: handleApiError,
  });

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.trip) {
    return (
      <div className="dashboard-page space-y-4">
        <PageBackHeader
          backTo="/trips"
          backLabel="Back to trips"
          title="Trip not found"
        />
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/trips")}
        >
          Go to trips
        </button>
      </div>
    );
  }

  const { trip, expenses = [], summary } = detailQuery.data;
  const actionLoading =
    addExpenseMutation.isPending ||
    deleteExpenseMutation.isPending ||
    settlementMutation.isPending ||
    undoSettlementMutation.isPending;

  const openExpenseForm = () => {
    setExpenseForm(emptyTripExpenseForm(trip.members || []));
    setShowExpenseForm(true);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm?.title?.trim()) {
      handleApiError({ message: "Expense title is required" });
      return;
    }
    if (!expenseForm.splitAmong?.length) {
      handleApiError({ message: "Select at least one member to split with" });
      return;
    }
    addExpenseMutation.mutate({
      title: expenseForm.title.trim(),
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      paidBy: expenseForm.paidBy,
      splitAmong: expenseForm.splitAmong,
      date: expenseForm.date || null,
      notes: "",
    });
  };

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageBackHeader
          backTo="/trips"
          backLabel="Back to trips"
          title={trip.title}
          subtitle={
            trip.destination
              ? `${trip.destination}${
                  trip.startDate ? ` · ${formatDate(trip.startDate)}` : ""
                }`
              : "Shared trip expenses and settlements"
          }
        />
        <div className="flex flex-wrap items-center gap-2 sm:pt-8">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${tripStatusBadgeClass(
              trip.status
            )}`}
          >
            {getTripStatusLabel(trip.status)}
          </span>
          <Link
            to={`/trips/${trip._id}/edit`}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-textPrimary hover:bg-surfaceLight"
          >
            <PencilSquareIcon />
            Edit
          </Link>
          <button
            type="button"
            onClick={openExpenseForm}
            className="btn-primary inline-flex items-center gap-1.5"
          >
            <IconPlus className="h-4 w-4" />
            Add expense
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-gradient-to-br from-primaryDark via-primaryMid to-primaryLight p-5 text-white sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentSage/90">
          Trip total
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
          {formatCurrency(summary?.total || 0)}
        </p>
        <p className="mt-1 text-sm text-white/70">
          {summary?.expenseCount || 0} expenses · {summary?.memberCount || 0}{" "}
          members
          {summary?.isFullySettled ? " · fully settled" : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(trip.members || []).map((m) => (
            <span
              key={m._id}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90"
            >
              {m.name}
              {m.isSelf ? " · you" : ""}
            </span>
          ))}
        </div>
      </div>

      {showExpenseForm && expenseForm ? (
        <TripExpenseForm
          form={expenseForm}
          members={trip.members || []}
          onChange={(patch) =>
            setExpenseForm((prev) => ({ ...prev, ...patch }))
          }
          onSubmit={handleAddExpense}
          onCancel={() => setShowExpenseForm(false)}
          loading={addExpenseMutation.isPending}
        />
      ) : null}

      <TripDetailPanels
        trip={trip}
        expenses={expenses}
        summary={summary}
        onDeleteExpense={setDeleteExpense}
        onRecordSettlement={(payload) => settlementMutation.mutate(payload)}
        onDeleteSettlement={(settlementId) =>
          undoSettlementMutation.mutate(settlementId)
        }
        actionLoading={actionLoading}
      />

      <ConfirmModal
        open={Boolean(deleteExpense)}
        title="Delete expense?"
        description={
          deleteExpense
            ? `Remove “${deleteExpense.title}” from this trip?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        confirming={deleteExpenseMutation.isPending}
        onConfirm={() => deleteExpenseMutation.mutate(deleteExpense._id)}
        onClose={() =>
          !deleteExpenseMutation.isPending && setDeleteExpense(null)
        }
      />
    </div>
  );
};

export default TripDetail;
