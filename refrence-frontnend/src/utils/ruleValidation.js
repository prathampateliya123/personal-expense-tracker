import {
  collectConditionNodes,
  findAcosRoasConflict
} from "./ruleTree";

function isValuelessAction(actionType = "") {
  const lowerAction = String(actionType).toLowerCase();
  return (
    lowerAction.includes("pause") ||
    lowerAction.includes("enable") ||
    lowerAction.includes("negative")
  );
}

function isBetweenOperator(operator = "") {
  return ["between", "is_between"].includes(String(operator || "").toLowerCase());
}

export function validateRuleBlocks(ruleBlocks = []) {
  if (!Array.isArray(ruleBlocks) || !ruleBlocks.length) {
    return {
      errors: { ruleBlocks: "Please add at least one condition block." },
      firstErrorId: "ruleBlocks"
    };
  }

  const acosRoasConflict = findAcosRoasConflict(ruleBlocks);
  if (acosRoasConflict) return acosRoasConflict;

  const checkGroup = (group) => {
    for (const child of group?.children || []) {
      if (child.type === "group") {
        const nested = checkGroup(child);
        if (nested) return nested;
        continue;
      }
      if (child.type !== "condition") continue;

      if (!String(child.metric || "").trim()) {
        return {
          errors: { [`metric_${child.id}`]: "Please select a metric." },
          firstErrorId: `metric_${child.id}`
        };
      }

      if (!String(child.operator || "").trim()) {
        return {
          errors: { [`operator_${child.id}`]: "Please select an operator." },
          firstErrorId: `operator_${child.id}`
        };
      }

      if (child.value === "" || child.value == null) {
        return {
          errors: { [`value_${child.id}`]: "Please enter a value." },
          firstErrorId: `value_${child.id}`
        };
      }

      if (isBetweenOperator(child.operator) && (child.valueTo === "" || child.valueTo == null)) {
        return {
          errors: { [`valueTo_${child.id}`]: "Please enter a second value." },
          firstErrorId: `valueTo_${child.id}`
        };
      }
    }
    return null;
  };

  for (const block of ruleBlocks) {
    const isElseBlock = String(block?.kind || "").toLowerCase() === "else";
    if (!isElseBlock) {
      const conditions = collectConditionNodes(block?.conditions);
      if (!conditions.length) {
        return {
          errors: { ruleBlocks: "Please add at least one condition." },
          firstErrorId: "ruleBlocks"
        };
      }

      const groupError = checkGroup(block.conditions);
      if (groupError) return groupError;
    }

    if (!block.action?.actionType) {
      return {
        errors: { [`actionType_${block.id}`]: "Please select an action." },
        firstErrorId: `actionType_${block.id}`
      };
    }

    if (!isValuelessAction(block.action.actionType)) {
      if (block.action.value === "" || block.action.value == null) {
        return {
          errors: { [`actionValue_${block.id}`]: "Please enter a value." },
          firstErrorId: `actionValue_${block.id}`
        };
      }
    }
  }

  return null;
}

export function validateWizardStep(step, form) {
  const isAccount = String(form.ruleLevel || "").toLowerCase().includes("account");

  if (step === 1) {
    if (!String(form.name || "").trim()) {
      return { errors: { name: "Please enter a rule name." }, firstErrorId: "name" };
    }
    if (!form.ruleLevel) {
      return {
        errors: { ruleLevel: "Please select a rule level." },
        firstErrorId: "ruleLevel"
      };
    }
    return null;
  }

  if (step === 2) {
    if (isAccount) return null;
    if (!form.targetType) {
      return {
        errors: { targetType: "Please select a target type." },
        firstErrorId: "targetType"
      };
    }
    return null;
  }

  if (step === 3) {
    return validateRuleBlocks(form.ruleBlocks);
  }

  if (step === 4) {
    if (isAccount) return null;
    if (!form.selectedProductIds?.length && !form.selectedProducts?.length) {
      return {
        errors: { products: "Please select at least one product." },
        firstErrorId: "products"
      };
    }
    return null;
  }

  if (step === 5) {
    if (form.lookbackDays === "" || form.lookbackDays == null) {
      return {
        errors: { lookbackDays: "Please enter lookback days." },
        firstErrorId: "lookbackDays"
      };
    }
    if (form.waitDays === "" || form.waitDays == null) {
      return {
        errors: { waitDays: "Please enter skip days." },
        firstErrorId: "waitDays"
      };
    }
    return null;
  }

  if (step === 6) {
    if (form.frequency === "weekly" && !form.daysOfWeek?.length) {
      return {
        errors: { daysOfWeek: "Please select at least one day." },
        firstErrorId: "daysOfWeek"
      };
    }
    if (form.frequency === "monthly" && !form.daysOfMonth?.length) {
      return {
        errors: { daysOfMonth: "Please select at least one day." },
        firstErrorId: "daysOfMonth"
      };
    }
    return null;
  }

  return null;
}