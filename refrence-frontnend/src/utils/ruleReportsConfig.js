import {
  SLUG_EDGE_UNDERSCORE_REGEX,
  SLUG_NON_ALNUM_REGEX,
  TITLE_WORD_REGEX,
  UNDERSCORE_REGEX
} from "./constants";

export function normalizeRuleReportsConfig(raw) {
  if (!raw) return { rule_report: [], rule_Level: [] };

  const nested =
    raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)
      ? raw.data
      : raw;

  if (Array.isArray(raw)) {
    return { rule_report: raw, rule_Level: [] };
  }
  if (Array.isArray(nested) && nested !== raw) {
    return { rule_report: nested, rule_Level: [] };
  }

  const reports =
    nested?.rule_report ||
    nested?.rule_Report ||
    nested?.reports ||
    raw?.rule_report ||
    [];

  const levels =
    nested?.rule_Level ||
    nested?.rule_level ||
    nested?.ruleLevel ||
    raw?.rule_Level ||
    [];

  return {
    rule_report: Array.isArray(reports) ? reports : [],
    rule_Level: Array.isArray(levels) ? levels : []
  };
}

export function slugifyRuleName(name = "") {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(SLUG_NON_ALNUM_REGEX, "_")
    .replace(SLUG_EDGE_UNDERSCORE_REGEX, "");
}

export function ruleLevelValueFromName(name = "") {
  const slug = slugifyRuleName(name);
  if (slug.includes("account")) return "account";
  if (slug.includes("product")) return "product";
  return slug;
}

/** Normalize form/API level to `account` | `product`. */
export function normalizeRuleLevel(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  if (key === "account" || key.includes("account")) return "account";
  if (key === "product" || key.includes("product")) return "product";
  return ruleLevelValueFromName(key);
}

export function mapRuleLevelsToOptions(levels = []) {
  if (!Array.isArray(levels) || !levels.length) return [];
  return levels
    .map((item) => {
      const title = String(item?.name || item?.title || "").trim();
      if (!title) return null;
      return {
        value: ruleLevelValueFromName(title),
        title,
        description: String(item?.description || "").trim()
      };
    })
    .filter(Boolean);
}

export function mapRuleReportsToOptions(reports = []) {
  if (!Array.isArray(reports) || !reports.length) return [];
  return reports
    .map((item) => {
      const value = String(item?.name || item?.id || "").trim();
      if (!value) return null;
      const reportId = Number(item?.id ?? item?.report_id ?? item?.reportId ?? 0);
      return {
        value,
        reportId: Number.isFinite(reportId) && reportId > 0 ? reportId : null,
        title: item?.display_name || item?.name || value,
        description: String(item?.description || "").trim()
      };
    })
    .filter(Boolean);
}

export function resolveReportId(sourceConfig, form = {}) {
  const candidates = [
    form.reportId,
    form.report_id,
    sourceConfig?.id,
    sourceConfig?.report_id,
    sourceConfig?.reportId
  ];
  for (const value of candidates) {
    const id = Number(value);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return null;
}

export function findRuleReportByName(reports = [], name = "") {
  if (!Array.isArray(reports) || !name) return null;
  const key = slugifyRuleName(name);
  return (
    reports.find((item) => String(item?.name) === String(name)) ||
    reports.find((item) => slugifyRuleName(item?.name) === key) ||
    reports.find((item) => slugifyRuleName(item?.display_name) === key) ||
    reports.find((item) => String(item?.id) === String(name)) ||
    null
  );
}

export function findRuleReportById(reports = [], reportId) {
  if (!Array.isArray(reports) || reportId == null || reportId === "") return null;
  const id = Number(reportId);
  if (!Number.isFinite(id) || id <= 0) return null;
  return (
    reports.find(
      (item) =>
        Number(item?.id) === id ||
        Number(item?.report_id) === id ||
        Number(item?.reportId) === id
    ) || null
  );
}

/** Default target for account-level rules (step 2 is skipped): Campaign Group. */
export function findAccountDefaultReport(reports = []) {
  if (!Array.isArray(reports) || !reports.length) return null;

  const scored = reports
    .map((item) => {
      const name = slugifyRuleName(item?.name || "");
      const display = slugifyRuleName(item?.display_name || "");
      const hay = `${name} ${display}`;
      let score = 0;
      if (
        name === "campaign_group" ||
        display === "campaign_group" ||
        hay.includes("campaign_group")
      ) {
        score += 100;
      }
      if (hay.includes("campaign") && hay.includes("group")) score += 80;
      if (name === "campaigns" || name === "campaign" || display === "campaigns") score += 40;
      if (hay.includes("campaign") && !hay.includes("product") && !hay.includes("ad_product")) {
        score += 15;
      }
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.item || null;
}

export function applyAccountDefaultSource(formPatch = {}, reports = []) {
  const report = findAccountDefaultReport(reports);
  if (!report) {
    return {
      ...formPatch,
      targetType: "campaign_group",
      source: "campaign_group",
      reportId: null
    };
  }
  const name = String(report.name || report.report_name || "campaign_group").trim();
  const reportId = resolveReportId(report, {});
  return {
    ...formPatch,
    targetType: name,
    source: name,
    reportId
  };
}

export function normalizeActionUnit(unit = "") {
  const key = String(unit || "").trim().toLowerCase();
  if (key === "percent" || key === "percentage" || key === "%") return "percentage";
  if (key === "fixed" || key === "number" || key === "amount") return "number";
  if (key === "text" || key === "string") return "text";
  return key || "";
}

export function resolveFieldValueKind(field) {
  if (!field) return "number";
  const type = String(field.field_type || "").toLowerCase();
  if (type === "date") return "date";

  const rawUnits = field.units;
  if (rawUnits == null) return "dropdown";

  const unitList = (Array.isArray(rawUnits) ? rawUnits : [rawUnits])
    .map((unit) => normalizeActionUnit(unit))
    .filter(Boolean);

  if (
    type === "categorical" ||
    (unitList.length === 0 && Array.isArray(field.options) && field.options.length)
  ) {
    return "dropdown";
  }
  if (unitList.includes("text") || type === "text") return "text";
  if (unitList.includes("percentage") && !unitList.includes("number")) return "percentage";
  if (unitList.includes("number") && !unitList.includes("percentage")) return "number";
  if (unitList.includes("percentage")) return "percentage";
  if (type === "numeric" || type === "number") return "number";
  if (type === "categorical") return "dropdown";
  return unitList[0] || "number";
}

export function actionUnitOptions(units = []) {
  const list = Array.isArray(units) ? units : [];
  return list
    .map((unit) => {
      const value = normalizeActionUnit(unit);
      if (!value) return null;
      if (value === "percentage") return { value: "percentage", label: "Percentage" };
      if (value === "number") return { value: "number", label: "Number" };
      return {
        value,
        label: String(unit)
          .replace(UNDERSCORE_REGEX, " ")
          .replace(TITLE_WORD_REGEX, (c) => c.toUpperCase())
      };
    })
    .filter(Boolean);
}

export function parseRuleAction(act) {
  if (act == null) return null;
  if (typeof act === "string") {
    const value = act.trim();
    if (!value) return null;
    return { value, label: value, units: [], hasMax: false };
  }
  if (typeof act !== "object") return null;
  const value = String(act.value || act.key || "").trim();
  if (!value) return null;
  return {
    value,
    label: String(act.key || act.label || act.value || value).trim(),
    units: Array.isArray(act.units) ? act.units : [],
    hasMax: Boolean(act.max)
  };
}

export function listRuleActions(sourceConfig) {
  const raw = sourceConfig?.action;
  if (!Array.isArray(raw)) return [];
  return raw.map(parseRuleAction).filter(Boolean);
}