import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownTrayIcon, ArrowLeftIcon } from "../components/ui/Icons";
import Button from "../components/ui/Button";
import { MessageBox } from "../components/ui/MessageBox";
import LookbackPeriod from "../components/rule/LookbackPeriod";
import ProductPicker from "../components/rule/ProductPicker";
import NotificationFields from "../components/rule/NotificationFields";
import MasterRuleToggle from "../components/rule/MasterRuleToggle";
import RuleBuilderFooter from "../components/rule/RuleBuilderFooter";
import RuleNameField from "../components/rule/RuleNameField";
import RuleSection from "../components/rule/RuleSection";
import RunSchedule from "../components/rule/RunSchedule";
import SourceSelector from "../components/rule/SourceSelector";
import StepConditions from "../components/rule/wizard/steps/StepConditions";
import { TableSkeleton } from "../components/table/TableState";
import { createCondition, createGroup, createInitialRuleFormState, createRuleId, createThenAction, ensureRuleBlockStructure, normalizeGroupLogic } from "../utils/ruleTree";
import { parseRuleBranches } from "../utils/ruleDetailsFormatters";
import { buildRulePayload, parseSelectedProducts, toUiActionUnit } from "../utils/rulePayload";
import { validateRuleBlocks } from "../utils/ruleValidation";
import { createRule, executeRule, getRuleDetails, getRuleReportsConfig, updateRule } from "../services/ruleService";
import { ruleKeys } from "../services/queryKeys";
import { useStore } from "../context/StoreContext";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { useQueryClient } from "@tanstack/react-query";
import { NORMALIZE_KEY_SPACES_REGEX, UNDERSCORE_REGEX } from "../utils/constants";
import { findAccountDefaultReport, normalizeRuleLevel } from "../utils/ruleReportsConfig";
import { downloadExcelWorkbook } from "../utils/report";

function normalizeExecuteRuleRows(payload) {
  const root = payload?.data ?? payload ?? {};
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.data)) return root.data.data;
  if (Array.isArray(root?.rows)) return root.rows;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.result)) return root.result;
  if (Array.isArray(root?.records)) return root.records;
  return [];
}

function buildSheetFromObjects(rows = []) {
  if (!Array.isArray(rows) || !rows.length) return [];

  const keys = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  }
  if (!keys.length) return [];

  const dataRows = rows.map((row) =>
    keys.map((key) => {
      const value = row?.[key];
      if (value == null) return "";
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      return String(value);
    })
  );

  return [keys, ...dataRows];
}

function normalizeKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(NORMALIZE_KEY_SPACES_REGEX, "_");
}

function resolveFieldInSource(fieldKey, sourceConfig) {
  const fields = Array.isArray(sourceConfig?.field_name) ? sourceConfig.field_name : [];
  const key = String(fieldKey || "").trim();
  if (!key || !fields.length) return null;

  const normalized = normalizeKey(key);
  return (
    fields.find((f) => f.field_name === key) ||
    fields.find((f) => normalizeKey(f.field_name) === normalized) ||
    fields.find((f) => normalizeKey(f.display_name) === normalized) ||
    fields.find(
      (f) =>
        normalizeKey(f.field_name).replace(UNDERSCORE_REGEX, "") === normalized.replace(UNDERSCORE_REGEX, "") ||
        normalizeKey(f.display_name).replace(UNDERSCORE_REGEX, "") === normalized.replace(UNDERSCORE_REGEX, "")
    ) ||
    null
  );
}

function resolveOperatorInField(operator, fieldConfig) {
  const ops = Array.isArray(fieldConfig?.operators) ? fieldConfig.operators : [];
  const key = String(operator || "").trim();
  if (!key) return "";
  if (!ops.length) return key;

  const normalized = normalizeKey(key);
  const aliases = {
    ">": "gt",
    ">=": "gte",
    "<": "lt",
    "<=": "lte",
    "=": "eq",
    "==": "eq",
    "!=": "neq",
    "<>": "neq",
    equals: "eq",
    equal: "eq",
    is_equals: "eq",
    not_equals: "neq",
    is_greater_than: "gt",
    greater_than: "gt",
    is_greater_than_or_equals: "gte",
    is_less_than: "lt",
    less_than: "lt",
    is_less_than_or_equals: "lte"
  };
  const aliasTarget = aliases[key] || aliases[normalized] || normalized;

  return (
    ops.find((op) => op === key) ||
    ops.find((op) => normalizeKey(op) === normalized) ||
    ops.find((op) => normalizeKey(op) === normalizeKey(aliasTarget)) ||
    key
  );
}

function collectConditionFieldKeys(jsonGroup, out = []) {
  if (!jsonGroup) return out;
  if (Array.isArray(jsonGroup.conditions)) {
    jsonGroup.conditions.forEach((cond) => {
      const field = cond?.field || cond?.metric || cond?.field_name || "";
      if (field) out.push(String(field));
    });
  }
  if (Array.isArray(jsonGroup.groups)) {
    jsonGroup.groups.forEach((grp) => collectConditionFieldKeys(grp, out));
  }
  return out;
}

function matchRuleSource(config = [], details = {}, rootJSON = null) {
  if (!Array.isArray(config) || config.length === 0) return "";

  const reportId = details?.report_id ?? details?.reportId;
  if (reportId != null && reportId !== "") {
    const byId = config.find(
      (s) =>
        Number(s.id) === Number(reportId) ||
        Number(s.report_id) === Number(reportId) ||
        String(s.id) === String(reportId) ||
        String(s.report_id) === String(reportId)
    );
    if (byId?.name) return byId.name;
  }

  const reportName = details?.report_name || details?.reportName || details?.source || "";
  if (reportName) {
    const normalizedName = normalizeKey(reportName);
    const byName = config.find(
      (s) =>
        normalizeKey(s.name) === normalizedName ||
        normalizeKey(s.id) === normalizedName ||
        normalizeKey(s.report_name) === normalizedName
    );
    if (byName?.name) return byName.name;
  }

  const fieldKeys = collectConditionFieldKeys(rootJSON);
  if (fieldKeys.length > 0) {
    let best = null;
    let bestScore = -1;
    config.forEach((source) => {
      const score = fieldKeys.reduce(
        (sum, key) => sum + (resolveFieldInSource(key, source) ? 1 : 0),
        0
      );
      if (score > bestScore) {
        bestScore = score;
        best = source;
      }
    });
    if (best?.name && bestScore > 0) return best.name;
  }

  return config[0]?.name || "";
}

function convertJSONToGroupNode(jsonGroup, sourceConfig = null) {
  if (!jsonGroup) return createGroup({}, sourceConfig);

  const children = [];

  if (Array.isArray(jsonGroup.conditions)) {
    jsonGroup.conditions.forEach((cond) => {
      let val = cond.value;
      if (Array.isArray(val)) {
        val = val.join(", ");
      }

      const rawField = cond.field || cond.metric || cond.field_name || "";
      const matchedField = resolveFieldInSource(rawField, sourceConfig);
      const metric = matchedField?.field_name || rawField || "";
      const operator = resolveOperatorInField(cond.operator, matchedField);

      children.push(
        createCondition(
          {
            metric,
            operator: operator || "",
            value: val != null ? String(val) : "",
            valueTo: cond.value_to != null ? String(cond.value_to) : ""
          },
          sourceConfig
        )
      );
    });
  }

  if (Array.isArray(jsonGroup.groups)) {
    jsonGroup.groups.forEach((grp) => {
      children.push(convertJSONToGroupNode(grp, sourceConfig));
    });
  }

  return createGroup({
    logic: normalizeGroupLogic(jsonGroup.logic),
    children: children.length > 0 ? children : [createCondition({}, sourceConfig)]
  }, sourceConfig);
}

function validateBasicDetails(form) {
  if (!form.name.trim()) {
    return { errors: { name: "Please enter a rule name." }, firstErrorId: "name" };
  }

  const isAccount =
    normalizeRuleLevel(form.ruleLevel || form.rule_level) === "account";
  if (!isAccount && !form.source) {
    return { errors: { source: "Please select a rule source." }, firstErrorId: "source" };
  }

  if (!form.ruleBlocks.length) {
    return {
      errors: { ruleBlocks: "Please add at least one rule block." },
      firstErrorId: "ruleBlocks"
    };
  }

  return null;
}

function actionFromApi(action = {}) {
  return createThenAction({
    actionType: action.action || action.actionType || action.type || "",
    unit: toUiActionUnit(action.unit || "percentage"),
    value: action.value != null ? String(action.value) : "",
    maxBid:
      action.minimum_bid != null
        ? String(action.minimum_bid)
        : action.maximum_bid != null
          ? String(action.maximum_bid)
          : ""
  });
}

function hydrateRuleBlocksFromAPI(conditionsJson, actionsJson, sourceConfig) {
  const blocks = parseRuleBranches(conditionsJson, actionsJson).map((branch, index) => {
    const kind = branch.kind || (index === 0 ? "if" : "else_if");
    const isElseBlock = String(kind).toLowerCase() === "else";
    return {
      id: createRuleId("block"),
      kind,
      conditions: isElseBlock
        ? null
        : convertJSONToGroupNode(branch.conditionGroup, sourceConfig),
      action: actionFromApi(branch.action || {})
    };
  });
  return ensureRuleBlockStructure(blocks, sourceConfig);
}

function validateProductSelection(form) {
  const isAccount =
    normalizeRuleLevel(form.ruleLevel || form.rule_level) === "account";
  if (isAccount) return null;
  if (form.selectedProductIds?.length > 0 || form.selectedProducts?.length > 0) return null;
  return {
    errors: { products: "Please select at least one product." },
    firstErrorId: "products"
  };
}

function validateLookback(form) {
  if (form.lookbackDays === "" || form.lookbackDays == null) {
    return {
      errors: { lookbackDays: "Please enter lookback days." },
      firstErrorId: "lookbackDays"
    };
  }
  if (form.waitDays === "" || form.waitDays == null) {
    return {
      errors: { waitDays: "Please enter wait days." },
      firstErrorId: "waitDays"
    };
  }
  return null;
}

function validateSchedule(form) {
  const frequency =
    form.frequency === "daily" ? "weekly" : form.frequency;
  if (frequency === "weekly" && !form.daysOfWeek.length) {
    return {
      errors: { daysOfWeek: "Please select at least one day." },
      firstErrorId: "daysOfWeek"
    };
  }
  if (frequency === "monthly" && !form.daysOfMonth.length) {
    return {
      errors: { daysOfMonth: "Please select at least one day." },
      firstErrorId: "daysOfMonth"
    };
  }
  return null;
}

function RuleBuilderLoadingState() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading rule builder">
      <div className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <TableSkeleton rows={6} />
      </div>
      <div className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <TableSkeleton rows={4} />
      </div>
      <span className="sr-only">Loading rule builder</span>
    </div>
  );
}

function RuleBuilderHeader({ title, subtitle, onBack, actions = null }) {
  return (
    <div className="mb-4 sm:mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 sm:h-[38px] sm:w-[38px]"
            title="Back to Rule List"
            aria-label="Back to rule list"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="page-title truncate">{title}</h1>
            <p className="page-subtitle truncate">{subtitle}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 items-center self-start sm:w-auto">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

function CreateRuleForm({ viewOnly = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ruleId } = useParams();
  const isEditMode = Boolean(ruleId) && !viewOnly;
  const isViewMode = Boolean(viewOnly);

  const { selectedStore, selectedStoreId } = useStore();
  const storeId = Number(selectedStoreId || selectedStore?.id) || 0;

  const [form, setForm] = useState(() => createInitialRuleFormState());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [apiConfig, setApiConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef("");
  const token = getCookie(TOKEN_NAME);

  useEffect(() => {
    const resolvedStoreId = Number(storeId);
    if (!token || !resolvedStoreId) return;
    if (selectedStore?.sync_per != null && selectedStore.sync_per < 100) return;

    const key = `${isViewMode ? "view" : isEditMode ? "edit" : "create"}_${ruleId}_${resolvedStoreId}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    const init = async () => {
      setLoading(true);
      try {
        const configPayload = await getRuleReportsConfig(resolvedStoreId, token);
        const config = Array.isArray(configPayload)
          ? configPayload
          : configPayload?.rule_report || [];
        setApiConfig(config);

        if ((isEditMode || isViewMode) && resolvedStoreId) {
          const res = await getRuleDetails(
            { store_id: resolvedStoreId, rule_id: Number(ruleId) },
            token
          );
          const details = res?.data || res;
          if (details) {
            const rootJSON = Array.isArray(details.conditions_json)
              ? details.conditions_json[0]
              : details.conditions_json;

            const matchedSource = matchRuleSource(config, details, rootJSON);
            const matchedSourceConfig =
              config.find((s) => s.name === matchedSource) || config[0] || null;

            const ruleBlocks = hydrateRuleBlocksFromAPI(
              details.conditions_json,
              details.actions_json,
              matchedSourceConfig
            );

            const selected = parseSelectedProducts(details);
            setForm({
              name: details.rule_name || details.name || "",
              source: matchedSource,
              ruleLevel:
                normalizeRuleLevel(
                  details.rule_level ?? details.ruleLevel ?? details.level
                ) || "product",
              ruleBlocks,
              selectedCampaignIds: [],
              selectedProductIds: selected.selectedProductIds,
              selectedProducts: selected.selectedProducts,
              lookbackDays: details.lookback_json?.days ?? 7,
              waitDays: details.lookback_json?.skip_days ?? 3,
              frequency:
                details.schedule_json?.repeat === "monthly"
                  ? "monthly"
                  : "weekly",
              hours: [],
              daysOfWeek: details.schedule_json?.days || [],
              daysOfMonth: details.schedule_json?.days || [],
              notifyPass:
                details.exclude_json?.pass ??
                details.pass ??
                details.notify_pass ??
                details.notifyPass ??
                "",
              notifyFail:
                details.exclude_json?.fail ??
                details.fail ??
                details.notify_fail ??
                details.notifyFail ??
                "",
              isMasterRule: Boolean(
                details.is_master_rule ?? details.is_master_rule ?? details.isMasterRule
              )
            });
          }
        } else if (config.length > 0 && !form.source) {
          setForm((prev) => ({ ...prev, source: config[0].name }));
        }
      } catch {
        void 0;
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEditMode, isViewMode, ruleId, storeId, token, selectedStore?.sync_per]);

  const isAccountLevel =
    normalizeRuleLevel(form.ruleLevel || form.rule_level) === "account";

  const currentSourceConfig = useMemo(() => {
    const byName = apiConfig.find((s) => s.name === form.source);
    if (byName) return byName;
    if (isAccountLevel) return findAccountDefaultReport(apiConfig);
    return null;
  }, [apiConfig, form.source, isAccountLevel]);

  const patchForm = useCallback((patch) => {
    if (isViewMode) return;
    setForm((prev) => ({ ...prev, ...patch }));
  }, [isViewMode]);

  const clearError = useCallback((fieldId) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const scrollToElement = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  };

  const handleCancel = useCallback(() => {
    navigate("/rule-builder");
  }, [navigate]);

  const handleViewModeEdit = useCallback(() => {
    navigate(`/rule-builder/edit/${ruleId}`);
  }, [navigate, ruleId]);

  const handleExportRule = useCallback(async () => {
    if (!isViewMode || !storeId || !ruleId || exporting) return;

    setExporting(true);
    try {
      const response = await executeRule(
        {
          store_id: Number(storeId),
          rule_id: Number(ruleId)
        },
        token
      );
      const rows = normalizeExecuteRuleRows(response);
      if (!rows.length) {
        MessageBox("warn", "No data available to export");
        return;
      }

      const sheetData = buildSheetFromObjects(rows);
      if (!sheetData.length) {
        MessageBox("warn", "No data available to export");
        return;
      }

      const ruleName = String(form.name || "rule").trim() || "rule";
      downloadExcelWorkbook(sheetData, {
        sheetName: "Rule Export",
        fileName: ruleName
      });
      MessageBox("success", "Exported successfully");
    } catch {
      void 0;
    } finally {
      setExporting(false);
    }
  }, [isViewMode, storeId, ruleId, exporting, token, form.name]);

  const handleNameChange = useCallback((name) => {
    clearError("name");
    patchForm({ name });
  }, [clearError, patchForm]);
  const handleSourceChange = useCallback((source) => {
    clearError("source");
    patchForm({ source });
  }, [clearError, patchForm]);
  const handleProductChange = useCallback((selectedProductIds, selectedProducts = []) => {
    clearError("products");
    patchForm({ selectedProductIds, selectedProducts });
  }, [clearError, patchForm]);

  const handleSubmit = useCallback(async () => {
    if (isViewMode) return;
    setErrors({});
    const validators = [
      validateBasicDetails(form),
      validateRuleBlocks(form.ruleBlocks),
      validateProductSelection(form),
      validateLookback(form),
      validateSchedule(form)
    ];

    for (const result of validators) {
      if (!result) continue;
      setErrors(result.errors);
      scrollToElement(result.firstErrorId);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildRulePayload({
        form,
        storeId,
        sourceConfig: currentSourceConfig,
        isEditMode,
        ruleId
      });

      let response;
      if (isEditMode) {
        response = await updateRule(payload, token);
        MessageBox("success", response?.message || "Rule updated successfully.");
      } else {
        response = await createRule(payload, token);
        MessageBox("success", response?.message || "Rule created successfully.");
      }
      await queryClient.invalidateQueries({ queryKey: ruleKeys.all });
      if (isEditMode) {
        navigate(`/rule-builder/details/${ruleId}`, { replace: true });
      } else {
        navigate("/rule-builder");
      }
    } catch {
      void 0;
    } finally {
      setSubmitting(false);
    }
  }, [
    isViewMode,
    form,
    storeId,
    currentSourceConfig,
    isEditMode,
    ruleId,
    token,
    queryClient,
    navigate
  ]);

  if (loading) {
  }

  const pageTitle = isViewMode ? "Rule Details" : isEditMode ? "Edit Rule" : "Create Rule";
  const pageSubtitle = isViewMode
    ? "Review automation conditions, actions, targets, and schedule."
    : isEditMode
      ? "Modify automation conditions, actions, targets, and schedule."
      : "Build automation conditions, actions, targets, and schedule in one place.";
  const submitText = isViewMode ? "Edit Rule" : isEditMode ? "Update Rule" : "Create Rule";
  const footerSubmitAction = isViewMode ? handleViewModeEdit : handleSubmit;
  const headerActions = isViewMode ? (
    <Button
      type="button"
      size="md"
      onClick={handleExportRule}
      disabled={loading || exporting || !storeId || !ruleId}
      className="w-full shrink-0 gap-1.5 px-3 sm:w-auto sm:px-3.5"
      aria-label="Export"
      title="Export"
      aria-busy={exporting}
    >
      {exporting ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
      ) : (
        <ArrowDownTrayIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
      )}
      <span>{exporting ? "Exporting..." : "Export"}</span>
    </Button>
  ) : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-3 pt-3 sm:px-5 sm:pt-4 lg:pl-0 lg:pr-6 lg:pt-5">
        <RuleBuilderHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          onBack={handleCancel}
          actions={headerActions}
        />
      </div>

      <div className="dashboard-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 sm:px-5 lg:pl-0 lg:pr-6">
      {loading ? (
        <RuleBuilderLoadingState />
      ) : (
      <div className="space-y-4">
        <RuleSection>
          <div className="space-y-5">
            <RuleNameField
              value={form.name}
              error={errors.name}
              readOnly={isViewMode}
              onChange={handleNameChange}
            />
            {!isAccountLevel ? (
              <SourceSelector
                value={form.source}
                options={apiConfig}
                error={errors.source}
                readOnly={isViewMode || isEditMode}
                onChange={handleSourceChange}
              />
            ) : null}
          </div>
        </RuleSection>

        <div className="h-[min(55dvh,520px)] min-h-[260px] sm:min-h-[420px] sm:h-[min(70vh,720px)]">
          <StepConditions
            form={form}
            errors={errors}
            currentSourceConfig={currentSourceConfig}
            onChange={patchForm}
            clearError={clearError}
            readOnly={isViewMode}
            wheelZoomMode="ctrl"
          />
        </div>

        {!isAccountLevel ? (
          <ProductPicker
            selectedIds={form.selectedProductIds || []}
            selectedProducts={form.selectedProducts || []}
            error={errors.products}
            readOnly={isViewMode}
            ruleId={ruleId}
            onChange={handleProductChange}
          />
        ) : null}

        <LookbackPeriod
          lookbackDays={form.lookbackDays}
          waitDays={form.waitDays}
          errors={errors}
          clearError={clearError}
          readOnly={isViewMode}
          onChange={patchForm}
        />

        <RunSchedule
          frequency={form.frequency}
          hours={form.hours}
          daysOfWeek={form.daysOfWeek}
          daysOfMonth={form.daysOfMonth}
          errors={errors}
          clearError={clearError}
          readOnly={isViewMode}
          onChange={patchForm}
        />

        <div className="space-y-4 sm:space-y-5">
          <NotificationFields
            notifyPass={form.notifyPass}
            notifyFail={form.notifyFail}
            readOnly={isViewMode}
            onChange={patchForm}
          />
          <MasterRuleToggle
            checked={form.isMasterRule}
            readOnly={isViewMode}
            onChange={(isMasterRule) => patchForm({ isMasterRule })}
          />
        </div>
      </div>
      )}
      </div>

      <RuleBuilderFooter
        submitting={submitting || loading}
        submitText={submitText}
        cancelText={isViewMode ? "Back" : "Cancel"}
        onCancel={handleCancel}
        onSubmit={footerSubmitAction}
      />
    </div>
  );
}

export default function CreateRule({ viewOnly = false }) {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  if (!token) return null;

  return (
    <CreateRuleForm viewOnly={viewOnly} />
  );
}