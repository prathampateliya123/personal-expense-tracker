import { normalizeGroupLogic } from "./ruleTree";

import { normalizeActionUnit, normalizeRuleLevel, resolveReportId } from "./ruleReportsConfig";

export function parseConditionValue(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((v) => v.trim()).filter(Boolean);
    }
    if (trimmed !== "" && !isNaN(trimmed)) {
      return Number(trimmed);
    }
    return trimmed;
  }
  if (typeof val === "number") return val;
  return val;
}

export function formatScheduleHours(hours = []) {
  return hours.length > 0
    ? hours.map((h) => `${String(h).padStart(2, "0")}:00`).join(",")
    : "12:00";
}

export function toUiActionUnit(unit = "") {
  return normalizeActionUnit(unit) || "percentage";
}

export function toApiActionUnit(unit = "") {
  return normalizeActionUnit(unit) || "percentage";
}

function isBetweenOperator(operator = "") {
  return ["between", "is_between"].includes(String(operator || "").toLowerCase());
}

function normalizeConditionOperator(operator = "") {
  const raw = String(operator || "").trim();
  if (!raw) return raw;
  return isBetweenOperator(raw) ? "between" : raw;
}

export function transformGroupNodeToJSON(groupNode) {
  if (!groupNode) return null;

  const conditions = [];
  const groups = [];

  (groupNode.children || []).forEach((child) => {
    if (child.type === "condition") {
      if (!child.metric) return;

      const operator = normalizeConditionOperator(child.operator);
      const condObj = {
        field: child.metric,
        operator,
        value: parseConditionValue(child.value)
      };

      if (isBetweenOperator(operator) && child.valueTo != null && child.valueTo !== "") {
        condObj.value_to = parseConditionValue(child.valueTo);
      }

      conditions.push(condObj);
    } else if (child.type === "group") {
      const nested = transformGroupNodeToJSON(child);
      if (nested) {
        groups.push(nested);
      }
    }
  });

  const result = {
    logic: normalizeGroupLogic(groupNode.logic)
  };

  if (conditions.length > 0) {
    result.conditions = conditions;
  }

  if (groups.length > 0) {
    result.groups = groups;
  }

  return result;
}

function buildRuleBranchJSON(block, index = 0) {
  const blockType = String(block?.kind || (index === 0 ? "if" : "else_if"))
    .trim()
    .toLowerCase();
  const isElseBlock = blockType === "else";
  const transformed = isElseBlock ? null : transformGroupNodeToJSON(block.conditions);
  if (!isElseBlock && !transformed) return null;

  const actionType = String(block.action?.actionType || "").trim();
  if (!actionType) return null;

  const branch = {
    type: isElseBlock ? "else" : blockType || (index === 0 ? "if" : "else_if"),
    action: { type: actionType }
  };
  if (!isElseBlock) {
    branch.logic = transformed.logic || "AND";
    branch.groups = transformed.groups || [];
    branch.conditions = transformed.conditions || [];
  }

  const actionValue = block.action?.value;
  const actionUnit = toApiActionUnit(block.action?.unit);
  if (actionValue != null && actionValue !== "") {
    branch.action.unit = actionUnit;
    branch.action.value = parseConditionValue(actionValue);
  } else if (actionUnit && actionUnit !== "percentage") {
    branch.action.unit = actionUnit;
  }

  if (
    !String(actionType).toLowerCase().includes("set_bid") &&
    block.action?.maxBid !== "" &&
    block.action?.maxBid != null
  ) {
    branch.action.minimum_bid = parseConditionValue(block.action.maxBid);
  }

  return branch;
}

export function buildConditionsJSON(ruleBlocks = []) {
  if (!Array.isArray(ruleBlocks) || !ruleBlocks.length) return [];
  return ruleBlocks.map((block, index) => buildRuleBranchJSON(block, index)).filter(Boolean);
}

export function buildActionsJSON(ruleBlocks = []) {
  return buildConditionsJSON(ruleBlocks);
}

export function getProductRowId(row, index = 0) {
  const id =
    row?.product_id ??
    row?.advertised_product_id ??
    row?.productId ??
    row?.id;
  if (id != null && String(id).trim() !== "") return String(id).trim();

  const asin = String(row?.asin || row?.advertised_asin || "").trim();
  const sku = String(row?.sku || row?.advertised_sku || "").trim();
  const adGroupId = String(row?.adGroupId || row?.ad_group_id || "").trim();
  const campaignId = String(row?.campaignId || row?.campaign_id || "").trim();
  const campaignName = String(row?.campaign_name || row?.campaignName || "").trim();
  const parts = [campaignId || campaignName, adGroupId, asin, sku].filter(Boolean);
  if (parts.length) return parts.join("::");
  return index ? `row-${index}` : "";
}

export function compactProductSnapshot(row, index = 0) {
  if (row == null || row === "") return null;
  if (typeof row !== "object") {
    const id = String(row).trim();
    return id ? { productId: id } : null;
  }

  const rowId = getProductRowId(row, index);
  const productId = String(
    row.productId ??
    row.product_id ??
    row.advertised_product_id ??
    row.id ??
    rowId ??
    ""
  ).trim();
  const asin = String(row.asin ?? row.advertised_asin ?? "").trim();
  const sku = String(row.sku ?? row.advertised_sku ?? "").trim();
  const campaignId = String(row.campaignId ?? row.campaign_id ?? "").trim();
  const campaignName = String(row.campaign_name ?? row.campaignName ?? "").trim();
  const adGroupId = String(row.adGroupId ?? row.ad_group_id ?? "").trim();
  const id = productId || rowId || asin || sku;
  if (!id) return null;

  return {
    productId: id,
    ...(asin ? { asin } : {}),
    ...(sku ? { sku } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(campaignName ? { campaign_name: campaignName } : {}),
    ...(adGroupId ? { adGroupId } : {})
  };
}

export function toProductJsonItem(item, index = 0) {
  const snap = compactProductSnapshot(item, index);
  if (!snap?.productId) return null;
  return snap;
}

export function buildProductJSON(form = {}) {
  const rows = Array.isArray(form.selectedProducts)
    ? form.selectedProducts.filter(Boolean)
    : [];
  if (rows.length) {
    return rows.map((item, index) => toProductJsonItem(item, index)).filter(Boolean);
  }
  return (form.selectedProductIds || [])
    .map((id, index) => toProductJsonItem(id, index))
    .filter(Boolean);
}

export function parseSelectedProducts(details) {
  const raw =
    details?.campaign_json ??
    details?.product_json ??
    details?.products_json ??
    details?.products ??
    [];
  const list = Array.isArray(raw) ? raw : [];
  const selectedProducts = list
    .map((item, index) => toProductJsonItem(item, index))
    .filter(Boolean);
  return {
    selectedProducts,
    selectedProductIds: selectedProducts.map((item) => String(item.productId))
  };
}

export function buildRulePayload({
  form,
  storeId,
  sourceConfig,
  isEditMode = false,
  ruleId = null
}) {
  const ruleLevel =
    normalizeRuleLevel(form.ruleLevel || form.rule_level) || "product";
  const reportName = String(
    sourceConfig?.name ||
      sourceConfig?.report_name ||
      form.source ||
      form.targetType ||
      (ruleLevel === "account" ? "campaign_group" : "") ||
      ""
  ).trim();
  const reportId = resolveReportId(sourceConfig, form);
  const passMessage = String(form.notifyPass || "").trim();
  const failMessage = String(form.notifyFail || "").trim();

  const payload = {
    store_id: Number(storeId),
    ...(reportId ? { report_id: reportId } : {}),
    report_name: reportName,
    rule_name: String(form.name || "").trim(),
    description: String(form.name || "").trim(),
    rule_level: ruleLevel,
    is_manual: false,
    is_master_rule: Boolean(form.isMasterRule),
    priority: 1,
    conditions_json: buildConditionsJSON(form.ruleBlocks),
    actions_json: buildActionsJSON(form.ruleBlocks),
    campaign_json: ruleLevel === "account" ? [] : buildProductJSON(form),
    schedule_json: {
      repeat: form.frequency,
      time: formatScheduleHours(form.hours),
      ...(form.frequency === "weekly" ? { days: form.daysOfWeek } : {}),
      ...(form.frequency === "monthly" ? { days: form.daysOfMonth } : {})
    },
    lookback_json: {
      days: Number(form.lookbackDays) || 7,
      skip_days: Number(form.waitDays) || 0
    },
    exclude_json: {
      pass: passMessage,
      fail: failMessage
    }
  };

  if (isEditMode) {
    payload.rule_id = Number(ruleId);
  }

  return payload;
}