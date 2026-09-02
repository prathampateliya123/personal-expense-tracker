import { PlusIcon, TrashIcon } from "../ui/Icons";
import ConditionRow from "./ConditionRow";
import OrgTreeBranch from "./OrgTreeBranch";
import {
  getGroupTheme,
  pickUniqueGroupColor
} from "../../utils/conditionGroupTheme";
import { normalizeGroupLogic } from "../../utils/ruleTree";

const LOGIC_OPTIONS = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" }
];

function LogicBadge({ value, onChange, readOnly }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[7px] border border-[var(--border)] bg-[var(--canvas)] p-0.5">
      {LOGIC_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly || active) return;
              onChange?.(option.value);
            }}
            className={`min-w-[52px] rounded-[6px] px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"
              } ${active
                ? "bg-[var(--brand-orange)] text-white"
                : "text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function GroupCard({
  isRoot,
  isNested,
  logic,
  readOnly,
  onUpdateLogic,
  onAddCondition,
  onAddGroup,
  onRemove,
  showRemove = false,
  groupId,
  softBg,
  borderColor,
  canvasFocus
}) {
  return (
    <div
      data-canvas-focus={canvasFocus || undefined}
      className={`relative w-full max-w-full overflow-visible rounded-[7px] px-3.5 py-3 shadow-[0_1px_3px_rgba(17,24,39,0.06)] sm:w-fit ${isRoot ? "sm:min-w-[220px]" : "sm:min-w-[200px]"
        }`}
      style={{
        backgroundColor: softBg,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            {isRoot ? "Logic group" : "Nested group"}
          </span>
          <LogicBadge
            value={normalizeGroupLogic(logic)}
            readOnly={readOnly}
            onChange={(next) => onUpdateLogic?.(groupId, next)}
          />
        </div>

        {showRemove && !readOnly ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[var(--ink-muted)] hover:bg-red-50 hover:text-red-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1"
            aria-label={isRoot ? "Remove rule block" : "Remove group"}
          >
            <TrashIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {!readOnly ? (
        <div
          className="mt-2.5 flex flex-wrap items-center gap-3 border-t pt-2.5"
          style={{ borderTopColor: borderColor }}
        >
          <button
            type="button"
            onClick={() => onAddCondition?.(groupId)}
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1"
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            Add Condition
          </button>
          <button
            type="button"
            onClick={() => onAddGroup?.(groupId)}
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1"
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            Add Group
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ConditionGroup({
  group,
  depth = 0,
  isRoot = false,
  colorIndex = 0,
  ancestorIndexes = [],
  usedColorIndexes,
  currentSourceConfig,
  errors = {},
  clearError,
  onUpdateLogic,
  onUpdateCondition,
  onAddCondition,
  onAddGroup,
  onRemoveNode,
  canRemoveRoot = false,
  onRemoveRoot,
  rootFocusKey = "rule-if",
  readOnly = false,
  conditionMetrics = []
}) {
  const children = Array.isArray(group.children) ? group.children : [];
  const canRemoveChild = children.length > 1 || depth > 0;
  const isNested = depth > 0;
  const theme = getGroupTheme(isRoot, colorIndex);
  const nextAncestors = isRoot ? [] : [...ancestorIndexes, colorIndex];
  // Shared list for this render tree — every nested group gets a globally unique index
  const treeUsedColors = isRoot ? [] : usedColorIndexes || [];
  const usedSiblingIndexes = [];

  let groupSiblingIndex = 0;

  const renderChild = (child) => {
    if (child.type === "group") {
      const childColorIndex = pickUniqueGroupColor({
        siblingIndex: groupSiblingIndex,
        parentIsRoot: isRoot,
        parentColorIndex: colorIndex,
        ancestorIndexes: nextAncestors,
        usedSiblingIndexes,
        usedTreeIndexes: treeUsedColors
      });
      usedSiblingIndexes.push(childColorIndex);
      treeUsedColors.push(childColorIndex);
      groupSiblingIndex += 1;
      return (
        <ConditionGroup
          key={child.id}
          group={child}
          depth={depth + 1}
          colorIndex={childColorIndex}
          ancestorIndexes={nextAncestors}
          usedColorIndexes={treeUsedColors}
          currentSourceConfig={currentSourceConfig}
          errors={errors}
          clearError={clearError}
          onUpdateLogic={onUpdateLogic}
          onUpdateCondition={onUpdateCondition}
          onAddCondition={onAddCondition}
          onAddGroup={onAddGroup}
          onRemoveNode={onRemoveNode}
          readOnly={readOnly}
          conditionMetrics={conditionMetrics}
        />
      );
    }

    return (
      <ConditionRow
        key={child.id}
        condition={child}
        canRemove={canRemoveChild}
        currentSourceConfig={currentSourceConfig}
        errors={errors}
        clearError={clearError}
        onChange={(patch) => onUpdateCondition?.(child.id, patch)}
        onRemove={() => onRemoveNode?.(child.id)}
        readOnly={readOnly}
        softBg={theme.soft}
        borderColor={theme.border}
        conditionMetrics={conditionMetrics}
      />
    );
  };

  const parentCard = (
    <GroupCard
      isRoot={isRoot}
      isNested={isNested}
      logic={group.logic}
      readOnly={readOnly}
      groupId={group.id}
      softBg={theme.soft}
      borderColor={theme.border}
      canvasFocus={isRoot ? rootFocusKey : undefined}
      showRemove={isNested || (isRoot && canRemoveRoot)}
      onUpdateLogic={onUpdateLogic}
      onAddCondition={onAddCondition}
      onAddGroup={onAddGroup}
      onRemove={() => {
        if (isRoot) {
          onRemoveRoot?.();
          return;
        }
        onRemoveNode?.(group.id);
      }}
    />
  );

  if (!children.length) {
    return <div className="flex flex-col items-center">{parentCard}</div>;
  }

  return (
    <OrgTreeBranch parent={parentCard} lineColor={theme.line}>
      {children.map((child) => renderChild(child))}
    </OrgTreeBranch>
  );
}