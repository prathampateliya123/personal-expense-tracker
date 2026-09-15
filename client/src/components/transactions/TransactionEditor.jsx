import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBackHeader from "../common/PageBackHeader";
import TransactionForm from "./TransactionForm";
import { handleApiError, showSuccessToast } from "../../hooks/useHandleError";

const TransactionEditor = ({
  mode = "add",
  listPath,
  backLabel,
  entityLabel,
  detailKey,
  service,
  queryKeys,
  addTitle,
  addSubtitle,
  editTitle,
  categoryType,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const detailQuery = useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      const data = await service.getById(id);
      return data[detailKey];
    },
    enabled: isEdit,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      isEdit ? service.update(id, formData) : service.create(formData),
    onSuccess: async () => {
      showSuccessToast(
        isEdit
          ? `${entityLabel} updated successfully`
          : `${entityLabel} added successfully`
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.all });
      navigate(listPath);
    },
    onError: handleApiError,
  });

  useEffect(() => {
    if (!isEdit || !detailQuery.isError) return;
    handleApiError(detailQuery.error, `Failed to load ${entityLabel.toLowerCase()}`);
    navigate(listPath, { replace: true });
  }, [isEdit, detailQuery.isError, detailQuery.error, navigate, listPath, entityLabel]);

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
        backTo={listPath}
        backLabel={backLabel}
        title={
          isEdit
            ? editTitle || `Edit ${entityLabel.toLowerCase()}`
            : addTitle
        }
        subtitle={
          isEdit
            ? `Update details for "${detailQuery.data.title}"`
            : addSubtitle
        }
      />

      <div className="card w-full p-6 sm:p-8">
        <TransactionForm
          variant="page"
          categoryType={categoryType}
          initialData={isEdit ? detailQuery.data : undefined}
          onSubmit={(formData) => saveMutation.mutate(formData)}
          onCancel={() => navigate(listPath)}
          loading={saveMutation.isPending}
        />
      </div>
    </div>
  );
};

export default TransactionEditor;
