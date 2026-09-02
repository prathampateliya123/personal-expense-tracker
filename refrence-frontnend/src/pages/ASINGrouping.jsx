import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asinKeys } from "../services/queryKeys";
import { bulkEditAsinGroup, editAsinGroup, listAsinGroups } from "../services/asinService";
import TableView from "../components/table/TableView";
import Button from "../components/ui/Button";
import TableToolbarActionButton from "../components/table/TableToolbarActionButton";
import { ArrowUpTrayIcon, PencilSquareIcon } from "../components/ui/Icons";
import { MessageBox } from "../components/ui/MessageBox";
import { useStore } from "../context/StoreContext";
import { getCookie, TOKEN_NAME } from "../utils/cookie";

const emptyDraft = () => ({ asin: "", short_name: "", group_name: "" });
const FIELD_WIDTH = "w-full min-w-0 max-w-full sm:w-[13rem] sm:max-w-[14.5rem]";
const IMPORT_ACCEPT = ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

const rowIdOf = (row) => String((row?.product_id || row?.asin) ?? "").trim();

const amazonAsinLink = (value) => {
  const asin = String(value ?? "").trim();
  if (!asin) return "—";
  return (
    <a
      href={`https://www.amazon.in/dp/${asin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--brand-orange)] font-medium underline underline-offset-2 hover:opacity-80"
    >
      {asin}
    </a>
  );
};

function GroupingField({
  value,
  editing,
  disabled,
  autoFocus = false,
  placeholder,
  ariaLabel,
  onChange,
  onSave,
  onCancel
}) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      readOnly={!editing}
      autoFocus={editing && autoFocus}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(event) => {
        if (!editing) return;
        onChange(event.target.value);
      }}
      onKeyDown={(event) => {
        if (!editing) return;
        if (event.key === "Enter") {
          event.preventDefault();
          onSave?.();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel?.();
        }
      }}
      className={`${FIELD_WIDTH} h-9 rounded-[7px] border px-2.5 text-[13px] outline-none transition-colors placeholder:text-[var(--ink-subtle)] ${
        editing
          ? "border-[var(--brand-orange)] bg-[var(--surface)] text-[var(--ink)] shadow-[0_0_0_3px_rgba(246,143,61,0.15)]"
          : "cursor-not-allowed border-[var(--border)] bg-[var(--canvas)] text-[var(--ink)] disabled:opacity-100"
      } ${!editing && !value ? "text-[var(--ink-subtle)]" : ""}`}
    />
  );
}

export default function ASINGrouping() {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { selectedStore, selectedStoreId } = useStore();
  const storeId = Number(selectedStoreId || selectedStore?.id) || 0;

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const editMutation = useMutation({
    mutationFn: (data) => editAsinGroup(data, getCookie(TOKEN_NAME)),
    onSuccess: (res) => {
      MessageBox("success", res?.message || "ASIN grouping saved");
      queryClient.invalidateQueries({ queryKey: asinKeys.grouping() });
      cancelEdit();
    },
    onError: (error) => {
      MessageBox(
        "error",
        error?.response?.data?.message || error?.message || "Failed to save ASIN grouping"
      );
    }
  });

  const importMutation = useMutation({
    mutationFn: (file) =>
      bulkEditAsinGroup({ store_id: storeId, file }, getCookie(TOKEN_NAME)),
    onSuccess: (res) => {
      MessageBox("success", res?.message || "ASIN grouping imported successfully");
      queryClient.invalidateQueries({ queryKey: asinKeys.grouping() });
      cancelEdit();
    },
    onError: (error) => {
      MessageBox(
        "error",
        error?.response?.data?.message || error?.message || "Failed to import ASIN grouping"
      );
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

  const startEdit = (row) => {
    const id = rowIdOf(row);
    const asin = row?.asin;
    if (!id || !asin || editingId || editMutation.isPending || importMutation.isPending) return;
    setDraft({
      asin: asin,
      short_name: row?.short_name || "",
      group_name: row?.group_name || ""
    });
    setEditingId(id);
  };

  const saveEdit = () => {
    if (!editingId || editMutation.isPending || importMutation.isPending) return;
    const asin = draft.asin;
    if (!asin) {
      MessageBox("error", "Missing ASIN for this row");
      return;
    }
    editMutation.mutate({
      asin: asin,
      short_name: String(draft.short_name || "").trim(),
      group_name: String(draft.group_name || "").trim()
    });
  };

  const handleImportClick = () => {
    if (!storeId) {
      MessageBox("warn", "Select a store first");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!storeId) {
      MessageBox("warn", "Select a store first");
      event.target.value = "";
      return;
    }

    const name = String(file.name || "").toLowerCase();
    const allowed =
      name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");
    if (!allowed) {
      MessageBox("error", "Please upload an Excel (.xlsx, .xls) or CSV file");
      event.target.value = "";
      return;
    }

    importMutation.mutate(file);
  };

  const importToolbar = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        className="hidden"
        onChange={handleImportFile}
      />
      <TableToolbarActionButton
        label="Import"
        loadingLabel="Importing..."
        isLoading={importMutation.isPending}
        icon={ArrowUpTrayIcon}
        onClick={handleImportClick}
        disabled={!storeId || Boolean(editingId)}
        variant="secondary"
        title="Import Excel or CSV"
      />
    </>
  );

  const columns = useMemo(
    () => [
      {
        key: "asin",
        label: "ASIN",
        sortable: false,
        exportLabel: "asin",
        locked: true,
        align: "left",
        minWidth: "160px",
        width: "22%",
        render: (value) => amazonAsinLink(value)
      },
      {
        key: "short_name",
        label: "Short Name",
        exportLabel: "short_name",
        locked: true,
        sortable: false,
        minWidth: "240px",
        width: "26%",
        render: (_value, row) => {
          const id = rowIdOf(row);
          const editing = editingId === id;
          const value = editing ? draft.short_name : row?.short_name || "";
          return (
            <GroupingField
              value={value}
              editing={editing}
              disabled={!editing || editMutation.isPending || importMutation.isPending}
              autoFocus
              placeholder="Add short name"
              ariaLabel="Short name"
              onChange={(next) => setDraft((prev) => ({ ...prev, short_name: next }))}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          );
        }
      },
      {
        key: "group_name",
        label: "Group Name",
        exportLabel: "group_name",
        locked: true,
        sortable: false,
        minWidth: "240px",
        width: "26%",
        render: (_value, row) => {
          const id = rowIdOf(row);
          const editing = editingId === id;
          const value = editing ? draft.group_name : row?.group_name || "";
          return (
            <GroupingField
              value={value}
              editing={editing}
              disabled={!editing || editMutation.isPending || importMutation.isPending}
              placeholder="Add group name"
              ariaLabel="Group name"
              onChange={(next) => setDraft((prev) => ({ ...prev, group_name: next }))}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          );
        }
      },
      {
        key: "actions",
        label: "Action",
        locked: true,
        sortable: false,
        hideable: false,
        exportable: false,
        align: "center",
        minWidth: "200px",
        width: "22%",
        render: (_value, row) => {
          const id = rowIdOf(row);
          const canEdit = Boolean(row?.asin);
          if (editingId === id) {
            return (
              <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={editMutation.isPending || importMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveEdit}
                  disabled={editMutation.isPending || importMutation.isPending}
                >
                  {editMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            );
          }

          return (
            <Button
              type="button"
              size="sm"
              onClick={() => startEdit(row)}
              disabled={
                !canEdit ||
                Boolean(editingId) ||
                editMutation.isPending ||
                importMutation.isPending
              }
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </Button>
          );
        }
      }
    ],
    [draft, editingId, editMutation.isPending, importMutation.isPending]
  );

  return (
    <TableView
      title="ASIN Grouping"
      queryKey={asinKeys.grouping()}
      fetchList={listAsinGroups}
      extraParams={{ p_type: "all" }}
      columns={columns}
      entityName="ASINs"
      showDateFilter={false}
      showColumnPicker={false}
      toolbarEndExtra={importToolbar}
    />
  );
}
