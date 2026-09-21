import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import TripForm from "./TripForm";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";
import tripService from "../../services/tripService";
import { tripKeys } from "../../services/queryKeys";
import { emptyTripForm, tripToForm } from "../../utils/tripConstants";

const TripEditor = ({ mode = "add", tripId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptyTripForm);

  const detailQuery = useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async () => {
      const data = await tripService.getById(tripId);
      return data.trip;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (!isEdit) {
      setForm(emptyTripForm());
      return;
    }
    if (detailQuery.data) {
      setForm(tripToForm(detailQuery.data));
    }
  }, [isEdit, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load trip");
    navigate("/trips", { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? tripService.update(tripId, payload)
        : tripService.create(payload),
    onSuccess: async (data) => {
      showSuccessToast(isEdit ? "Trip updated" : "Trip created");
      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
      navigate(`/trips/${data.trip._id}`);
    },
    onError: handleApiError,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const members = (form.members || [])
      .map((m) => ({
        ...(m._id ? { _id: m._id } : {}),
        name: m.name.trim(),
        isSelf: Boolean(m.isSelf),
      }))
      .filter((m) => m.name);

    if (!form.title.trim()) {
      handleApiError({ message: "Trip title is required" });
      return;
    }
    if (members.length < 1) {
      handleApiError({ message: "Add at least one member" });
      return;
    }

    saveMutation.mutate({
      title: form.title.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
      notes: form.notes.trim(),
      members,
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
        backTo={isEdit ? `/trips/${tripId}` : "/trips"}
        backLabel={isEdit ? "Back to trip" : "Back to trips"}
        title={isEdit ? "Edit trip" : "New trip"}
        subtitle={
          isEdit
            ? `Update “${detailQuery.data.title}” and members`
            : "Name the trip, add members, then track shared expenses"
        }
      />

      <TripForm
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(isEdit ? `/trips/${tripId}` : "/trips")
        }
        loading={saveMutation.isPending}
        editing={isEdit}
      />
    </div>
  );
};

export default TripEditor;
