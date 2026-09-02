import {
  DIGITS_ONLY_REGEX,
  RULE_FREQUENCIES,
  RULE_ACTION_TYPES,
  TITLE_WORD_REGEX,
  UNDERSCORE_REGEX
} from "./constants";

const FIELD_LABELS = {
  acos: "ACOS",
  spend: "Spend",
  ctr: "CTR",
  cpc: "CPC",
  roas: "ROAS",
  clicks: "Clicks",
  impressions: "Impressions",
  orders: "Orders",
  sales: "Sales",
  conversion_rate: "Conversion Rate",
  cvr: "CVR",
  bid: "Bid",
  campaign: "Campaign",
  campaign_name: "Campaign Name",
  ad_group: "Ad Group",
  ad_group_name: "Ad Group Name",
  match_type: "Match Type",
  targeting_type: "Targeting Type",
  target_text: "Target / Keyword",
  keyword_target: "Keyword Target",
  keyword_status: "Keyword Status",
  status: "Status"
};

const OPERATOR_LABELS = {
  is_greater_than: ">",
  greater_than: ">",
  gt: ">",
  gte: ">=",
  is_greater_than_or_equals: ">=",
  is_less_than: "<",
  less_than: "<",
  lt: "<",
  lte: "<=",
  is_less_than_or_equals: "<=",
  is_equals: "=",
  equals: "=",
  eq: "=",
  is_not_equals: "≠",
  not_equals: "≠",
  neq: "≠",
  is_any_of: "is any of",
  is: "is",
  is_not: "is not",
  between: "between",
  is_between: "between",
  contains: "contains",
  does_not_contain: "does not contain",
  starts_with: "starts with"
};

const DAY_LABELS = {
  Mo: "Mon",
  Tu: "Tue",
  We: "Wed",
  Th: "Thu",
  Fr: "Fri",
  Sa: "Sat",
  Su: "Sun"
};

export function formatFieldLabel(field = "") {
  if (!field) return "—";
  const key = String(field).toLowerCase();
  return FIELD_LABELS[key] || String(field).replace(UNDERSCORE_REGEX, " ");
}

export function formatOperatorLabel(op = "") {
  if (!op) return "—";
  const key = String(op).toLowerCase();
  return OPERATOR_LABELS[key] || String(op).replace(UNDERSCORE_REGEX, " ");
}

export function formatActionLabel(action = "") {
  if (!action) return "Action";
  const key = String(action).toLowerCase();
  const match = RULE_ACTION_TYPES.find((item) => item.value === key);
  if (match) return match.label;
  return String(action)
    .replace(UNDERSCORE_REGEX, " ")
    .replace(TITLE_WORD_REGEX, (char) => char.toUpperCase());
}

export function formatConditionValue(cond) {
  if (Array.isArray(cond?.value)) return cond.value.join(", ");
  if (cond?.value_to != null && cond?.value_to !== "") {
    return `${cond.value} – ${cond.value_to}`;
  }
  if (cond?.value == null || cond?.value === "") return "—";
  return String(cond.value);
}

export function formatFrequencyLabel(value = "daily") {
  const key = String(value || "daily").toLowerCase();
  const match = RULE_FREQUENCIES.find((item) => item.value === key);
  if (match) return `Every ${match.label}`;
  return String(value).replace(UNDERSCORE_REGEX, " ");
}

export function formatScheduleTime(time = "") {
  const raw = String(time || "").trim();
  if (!raw) return "—";

  const [hourPart, minutePart = "00"] = raw.split(":");
  const hour = Number(hourPart);
  if (Number.isNaN(hour)) return raw;

  const suffix = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minutes = String(minutePart).padStart(2, "0");
  return minutes === "00"
    ? `${displayHour}:00 ${suffix}`
    : `${displayHour}:${minutes} ${suffix}`;
}

export function formatScheduleTimes(timeValue) {
  if (!timeValue) return [];
  return String(timeValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(formatScheduleTime);
}

export function formatDayLabels(days = []) {
  if (!Array.isArray(days) || days.length === 0) return [];
  return days.map((day) => {
    const key = String(day);
    if (DAY_LABELS[key]) return DAY_LABELS[key];
    if (DIGITS_ONLY_REGEX.test(key)) return `Day ${key}`;
    return key;
  });
}

export function formatActionValue(action) {
  const unit = action?.unit;
  const isPercent = unit === "percent" || unit === "percentage" || unit === "%";
  if (action?.value == null || action?.value === "") return "—";
  return `${action.value}${isPercent ? "%" : unit === "currency" || !unit ? "" : ` ${unit}`}`;
}

export function getConditionRoot(conditionsJson) {
  if (Array.isArray(conditionsJson)) return conditionsJson[0] || null;
  return conditionsJson || null;
}

function isBranchBundleItem(item) {
  if (!item || typeof item !== "object") return false;
  const type = String(item.type || "").trim().toLowerCase();
  return type === "if" || type === "else_if" || type === "else";
}

function isBranchBundleFormat(conditionsJson) {
  const list = Array.isArray(conditionsJson)
    ? conditionsJson
    : conditionsJson
      ? [conditionsJson]
      : [];
  return list.some(isBranchBundleItem);
}

function toConditionGroupFromBranch(branch) {
  if (!branch || typeof branch !== "object") return null;
  return {
    logic: branch.logic || "AND",
    conditions: Array.isArray(branch.conditions) ? branch.conditions : [],
    groups: Array.isArray(branch.groups) ? branch.groups : []
  };
}

export function parseRuleBranches(conditionsJson, actionsJson = []) {
  const conditionList = Array.isArray(conditionsJson)
    ? conditionsJson
    : conditionsJson
      ? [conditionsJson]
      : [];
  const actionList = Array.isArray(actionsJson) ? actionsJson : [];

  if (isBranchBundleFormat(conditionList)) {
    return conditionList.map((branch, index) => {
      const paired = actionList[index] || branch;
      const action = paired?.action ?? branch?.action ?? null;
      const type = String(branch.type || (index === 0 ? "if" : "else_if"))
        .trim()
        .toLowerCase();
      const isElse = type === "else";

      return {
        label: isElse ? "Else" : type === "if" || index === 0 ? "If" : "Else if",
        kind: isElse ? "else" : type === "else_if" ? "else_if" : "if",
        conditionGroup: isElse ? null : toConditionGroupFromBranch(branch),
        action
      };
    });
  }

  const actions = actionList;
  const root = getConditionRoot(conditionsJson);

  if (!root) {
    return actions.length
      ? actions.map((action, index) => ({
        label: index === 0 ? "If" : "Else if",
        conditionGroup: null,
        action
      }))
      : [{ label: "If", conditionGroup: null, action: null }];
  }

  const logic = String(root.logic || "AND").toUpperCase();
  const groups = Array.isArray(root.groups) ? root.groups.filter(Boolean) : [];
  const rootConditions = Array.isArray(root.conditions) ? root.conditions : [];

  const isElseIfChain =
    logic === "OR" &&
    groups.length > 1 &&
    rootConditions.length === 0 &&
    (actions.length === groups.length || actions.length > 1);

  if (isElseIfChain) {
    return groups.map((group, index) => ({
      label: index === 0 ? "If" : "Else if",
      conditionGroup: group,
      action: actions[index] || null
    }));
  }

  if (groups.length === 1 && rootConditions.length === 0) {
    return [
      {
        label: "If",
        conditionGroup: groups[0],
        action: actions[0] || null,
        extraActions: actions.slice(1)
      }
    ];
  }

  return [
    {
      label: "If",
      conditionGroup: root,
      action: actions[0] || null,
      extraActions: actions.slice(1)
    }
  ];
}

export function flattenConditions(group) {
  if (!group) return [];

  const items = [];
  const walk = (node, depth = 0) => {
    if (!node) return;

    const conditions = Array.isArray(node.conditions) ? node.conditions : [];
    conditions.forEach((cond) => {
      items.push({ ...cond, depth });
    });

    const groups = Array.isArray(node.groups) ? node.groups : [];
    groups.forEach((child) => walk(child, depth + 1));
  };

  walk(group);
  return items;
}

export function flattenConditionTree(group, depth = 0) {
  if (!group) return [];

  const rows = [];
  const logic = String(group.logic || "AND").toUpperCase();
  const conditions = Array.isArray(group.conditions) ? group.conditions : [];
  const groups = Array.isArray(group.groups) ? group.groups : [];

  if (conditions.length > 0 || groups.length > 0) {
    rows.push({ type: "group", logic, depth });
  }

  conditions.forEach((condition) => {
    rows.push({ type: "condition", condition, depth });
  });

  groups.forEach((child) => {
    rows.push(...flattenConditionTree(child, depth + 1));
  });

  return rows;
}

export function countConditions(group) {
  return flattenConditions(group).length;
}

export function hasExcludeKeywords(excludeJson) {
  const phrase = excludeJson?.phrase || [];
  const exact = excludeJson?.exact || [];
  return phrase.length > 0 || exact.length > 0;
}