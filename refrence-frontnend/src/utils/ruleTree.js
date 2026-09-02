import {
  NORMALIZE_KEY_SPACES_REGEX,
  RULE_ACOS_KEY_REGEX,
  RULE_ROAS_KEY_REGEX
} from "./constants";
import { normalizeActionUnit } from "./ruleReportsConfig";

let ruleNodeSeq = 0;

export const createRuleId = (prefix = "rule") => {
  ruleNodeSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${ruleNodeSeq}`;
};

export const normalizeGroupLogic = (logic) => {
  const value = String(logic || "AND").trim().toUpperCase();
  if (value === "OR" || value === "||") return "OR";
  return "AND";
};

export function normalizeMetricKey(metric = "") {
  return String(metric || "")
    .trim()
    .toLowerCase()
    .replace(NORMALIZE_KEY_SPACES_REGEX, "_");
}

export function isAcosMetric(metric) {
  const key = normalizeMetricKey(metric);
  if (!key) return false;
  return key === "acos" || RULE_ACOS_KEY_REGEX.test(key);
}

export function isRoasMetric(metric) {
  const key = normalizeMetricKey(metric);
  if (!key) return false;
  return key === "roas" || RULE_ROAS_KEY_REGEX.test(key);
}

export function collectConditionNodes(node, acc = []) {
  if (!node) return acc;
  if (node.type === "condition") {
    acc.push(node);
    return acc;
  }
  for (const child of node.children || []) {
    collectConditionNodes(child, acc);
  }
  return acc;
}

export function collectConditionMetrics(ruleBlocks = []) {
  const items = [];
  for (const block of ruleBlocks || []) {
    collectConditionNodes(block?.conditions).forEach((cond) => {
      items.push({ id: cond.id, metric: cond.metric || "" });
    });
  }
  return items;
}

export function getAcosRoasLock(conditionMetrics = [], currentConditionId = "") {
  const others = conditionMetrics.filter((item) => item.id !== currentConditionId);
  return {
    blockAcos: others.some((item) => isRoasMetric(item.metric)),
    blockRoas: others.some((item) => isAcosMetric(item.metric))
  };
}

export function findAcosRoasConflict(ruleBlocks = []) {
  const metrics = collectConditionMetrics(ruleBlocks);
  const hasAcos = metrics.some((item) => isAcosMetric(item.metric));
  const hasRoas = metrics.some((item) => isRoasMetric(item.metric));
  if (!hasAcos || !hasRoas) return null;
  const conflict = metrics.find((item) => isRoasMetric(item.metric));
  return {
    errors: {
      [`metric_${conflict.id}`]: "ACOS and ROAS cannot be used together. Choose only one."
    },
    firstErrorId: `metric_${conflict.id}`
  };
}

export const getDefaultConditionFields = () => ({
  metric: "",
  operator: ""
});

export const createCondition = (partial = {}, _sourceConfig = null) => ({
  id: createRuleId("cond"),
  type: "condition",
  metric:
    partial.metric !== undefined && partial.metric !== null ? String(partial.metric) : "",
  operator:
    partial.operator !== undefined && partial.operator !== null
      ? String(partial.operator)
      : "",
  value: partial.value ?? "",
  valueTo: partial.valueTo ?? ""
});

export const createGroup = (partial = {}, sourceConfig = null) => ({
  id: createRuleId("group"),
  type: "group",
  logic: normalizeGroupLogic(partial.logic),
  children:
    Array.isArray(partial.children) && partial.children.length
      ? partial.children
      : [createCondition({}, sourceConfig)]
});

export const createThenAction = (partial = {}) => ({
  id: createRuleId("action"),
  actionType: partial.actionType ?? "",
  unit: partial.unit ? normalizeActionUnit(partial.unit) || "percentage" : "percentage",
  value: partial.value ?? "",
  maxBid: partial.maxBid ?? ""
});

export const createRuleBlock = (kind = "if", sourceConfig = null) => ({
  id: createRuleId("block"),
  kind,
  conditions:
    kind === "else"
      ? null
      : createGroup(
        {
          logic: "AND",
          children: [createCondition({}, sourceConfig)]
        },
        sourceConfig
      ),
  action: createThenAction()
});

export function createDefaultRuleBlocks(sourceConfig = null) {
  return [createRuleBlock("if", sourceConfig), createRuleBlock("else", sourceConfig)];
}

export function ensureRuleBlockStructure(blocks = [], sourceConfig = null) {
  if (!Array.isArray(blocks) || !blocks.length) {
    return createDefaultRuleBlocks(sourceConfig);
  }

  const nonElseBlocks = blocks.filter(
    (block) => String(block?.kind || "").toLowerCase() !== "else"
  );
  let elseBlock = blocks.find(
    (block) => String(block?.kind || "").toLowerCase() === "else"
  );

  const normalizedMiddle = nonElseBlocks.map((block, index) => ({
    ...block,
    kind: index === 0 ? "if" : "else_if"
  }));

  if (!normalizedMiddle.length) {
    normalizedMiddle.push(createRuleBlock("if", sourceConfig));
  }

  if (!elseBlock) {
    elseBlock = createRuleBlock("else", sourceConfig);
  } else {
    elseBlock = { ...elseBlock, kind: "else", conditions: null };
  }

  return [...normalizedMiddle, elseBlock];
}

export const createInitialRuleFormState = () => ({
  name: "",
  source: "keyword_targets",
  ruleLevel: "product",
  ruleBlocks: [],
  selectedCampaignIds: [],
  selectedProductIds: [],
  selectedProducts: [],
  lookbackDays: 7,
  waitDays: 3,
  frequency: "weekly",
  hours: [],
  daysOfWeek: [],
  daysOfMonth: [],
  notifyPass: "",
  notifyFail: "",
  isMasterRule: false
});

const mapNode = (node, targetId, mapper) => {
  if (!node) return node;
  if (node.id === targetId) return mapper(node);
  if (node.type !== "group" || !Array.isArray(node.children)) return node;
  return {
    ...node,
    children: node.children.map((child) => mapNode(child, targetId, mapper))
  };
};

export const updateGroupLogic = (tree, groupId, logic) =>
  mapNode(tree, groupId, (node) => ({ ...node, logic: normalizeGroupLogic(logic) }));

export const updateCondition = (tree, conditionId, patch) =>
  mapNode(tree, conditionId, (node) => ({ ...node, ...patch }));

export const addConditionToGroup = (tree, groupId, sourceConfig = null) =>
  mapNode(tree, groupId, (node) => ({
    ...node,
    children: [...(node.children || []), createCondition({}, sourceConfig)]
  }));

export const addGroupToGroup = (tree, groupId, sourceConfig = null) =>
  mapNode(tree, groupId, (node) => ({
    ...node,
    children: [...(node.children || []), createGroup({ logic: "AND" }, sourceConfig)]
  }));

export const removeNodeFromTree = (tree, nodeId, sourceConfig = null) => {
  if (!tree || tree.id === nodeId) return tree;
  if (tree.type !== "group") return tree;

  const nextChildren = [];
  for (const child of tree.children || []) {
    if (child.id === nodeId) continue;
    if (child.type === "group") {
      nextChildren.push(removeNodeFromTree(child, nodeId, sourceConfig));
    } else {
      nextChildren.push(child);
    }
  }

  return {
    ...tree,
    children: nextChildren.length ? nextChildren : [createCondition({}, sourceConfig)]
  };
};