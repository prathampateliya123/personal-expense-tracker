import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PlusIcon } from "../ui/Icons";
import ConditionGroup from "./ConditionGroup";
import RuleSection from "./RuleSection";
import ThenActionRow from "./ThenActionRow";
import { ROOT_GROUP_THEME } from "../../utils/conditionGroupTheme";
import {
  getLocalBox,
  RULE_CANVAS_TRANSFORM_EVENT
} from "../../utils/domGeometry";
import {
  addConditionToGroup,
  addGroupToGroup,
  collectConditionMetrics,
  createRuleBlock,
  ensureRuleBlockStructure,
  removeNodeFromTree,
  updateCondition,
  updateGroupLogic
} from "../../utils/ruleTree";

function updateBlockTree(block, nextTree) {
  return { ...block, conditions: nextTree };
}

function ThenConnector({ children }) {
  const items = Children.toArray(children);
  const wrapRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const [path, setPath] = useState("");
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!wrap || !top || !bottom) return undefined;

    const redraw = () => {
      const topBox = getLocalBox(wrap, top);
      const bottomBox = getLocalBox(wrap, bottom);
      const startX = topBox.left + topBox.width / 2;
      const startY = topBox.bottom;
      const endX = bottomBox.left + bottomBox.width / 2;
      const endY = bottomBox.top;
      const midY = (startY + endY) / 2;
      setPath(`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`);
      setSize({
        width: Math.max(wrap.scrollWidth, wrap.clientWidth),
        height: Math.max(wrap.scrollHeight, wrap.clientHeight)
      });
    };

    const schedule = () => requestAnimationFrame(redraw);
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(wrap);
    observer.observe(top);
    observer.observe(bottom);
    window.addEventListener("resize", schedule);
    wrap.addEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    document.addEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      wrap.removeEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
      document.removeEventListener(RULE_CANVAS_TRANSFORM_EVENT, schedule);
    };
  }, [items.length]);

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      <div ref={topRef} className="relative z-[1] flex w-full justify-center">
        {items[0]}
      </div>
      <svg
        className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
        width={Math.max(size.width, 1)}
        height={Math.max(size.height, 1)}
        aria-hidden
      >
        {path ? (
          <path
            d={path}
            fill="none"
            stroke={ROOT_GROUP_THEME.line}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      <div ref={bottomRef} className="relative z-[1] pt-24">
        {items[1]}
      </div>
    </div>
  );
}

function ThenActionPanel({
  block,
  currentSourceConfig,
  errors,
  clearError,
  readOnly,
  onChange,
  canvasFocus = "rule-then"
}) {
  return (
    <div
      data-canvas-focus={canvasFocus}
      className="flex w-fit flex-wrap items-center gap-3 overflow-visible rounded-[7px] px-3.5 py-3 shadow-[0_1px_3px_rgba(17,24,39,0.06)]"
      style={{
        backgroundColor: ROOT_GROUP_THEME.soft,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: ROOT_GROUP_THEME.border
      }}
    >
      <p className="m-0 shrink-0 text-[12px] font-semibold uppercase tracking-wide text-[var(--brand-orange)]">
        Then{" "}
        <span className="font-medium normal-case tracking-normal text-[var(--ink-muted)]">
          take this action
        </span>
      </p>
      <ThenActionRow
        blockId={block.id}
        action={block.action}
        currentSourceConfig={currentSourceConfig}
        errors={errors}
        clearError={clearError}
        readOnly={readOnly}
        onChange={onChange}
      />
    </div>
  );
}

export default function ConditionActionBuilder({
  ruleBlocks = [],
  currentSourceConfig,
  errors = {},
  clearError,
  onChange,
  readOnly = false,
  embedInCanvas = false
}) {
  const structuredBlocks = useMemo(
    () => ensureRuleBlockStructure(ruleBlocks, currentSourceConfig),
    [ruleBlocks, currentSourceConfig]
  );
  const elseBlock = structuredBlocks[structuredBlocks.length - 1];
  const middleBlocks = structuredBlocks.slice(0, -1);

  useEffect(() => {
    const hasElse = ruleBlocks.some(
      (block) => String(block?.kind || "").toLowerCase() === "else"
    );
    if (!hasElse || ruleBlocks.length !== structuredBlocks.length) {
      onChange?.(structuredBlocks);
    }
  }, [ruleBlocks, structuredBlocks, onChange]);

  const updateRuleBlocks = (updater) => {
    onChange?.(
      ensureRuleBlockStructure(updater(structuredBlocks), currentSourceConfig)
    );
  };

  const updateBlock = (blockId, patch) => {
    updateRuleBlocks((blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block))
    );
  };

  const updateBlockConditions = (blockId, updater) => {
    updateRuleBlocks((blocks) =>
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        return updateBlockTree(block, updater(block.conditions));
      })
    );
  };

  const conditionMetrics = collectConditionMetrics(structuredBlocks);

  const addElseIfBlock = () => {
    updateRuleBlocks((blocks) => {
      const normalized = ensureRuleBlockStructure(blocks, currentSourceConfig);
      const trailingElse = normalized[normalized.length - 1];
      const prefix = normalized.slice(0, -1);
      return [...prefix, createRuleBlock("else_if", currentSourceConfig), trailingElse];
    });
  };

  const removeRuleBlock = (blockId) => {
    updateRuleBlocks((blocks) => {
      const target = blocks.find((block) => block.id === blockId);
      const kind = String(target?.kind || "").toLowerCase();
      if (kind === "if" || kind === "else") {
        return ensureRuleBlockStructure(blocks, currentSourceConfig);
      }
      return ensureRuleBlockStructure(
        blocks.filter((block) => block.id !== blockId),
        currentSourceConfig
      );
    });
  };

  const renderConditionalBlock = (block, index) => {
    const isFirst = index === 0;
    const isElseIf = String(block?.kind || "").toLowerCase() === "else_if";

    return (
      <div
        key={block.id}
        className={`flex w-max max-w-full flex-col ${embedInCanvas ? "items-stretch" : "w-full"}`}
      >
        <div className="mb-3 px-1 text-center sm:mb-4">
          <p className="m-0 text-[16px] font-semibold tracking-tight text-[var(--ink)] sm:text-[20px]">
            {isFirst ? "If" : "Else if"}{" "}
            <span className="block font-medium text-[var(--ink-muted)] sm:inline">
              these conditions are met
            </span>
          </p>
        </div>

        <div
          className={`flex flex-col items-center ${embedInCanvas ? "" : "overflow-x-auto overflow-y-visible"
            }`}
        >
          <ThenConnector>
            <ConditionGroup
              group={block.conditions}
              isRoot
              rootFocusKey={isFirst ? "rule-if" : "rule-else-if"}
              currentSourceConfig={currentSourceConfig}
              errors={errors}
              clearError={clearError}
              readOnly={readOnly}
              conditionMetrics={conditionMetrics}
              canRemoveRoot={!readOnly && isElseIf}
              onRemoveRoot={() => removeRuleBlock(block.id)}
              onUpdateLogic={(groupId, logic) =>
                updateBlockConditions(block.id, (tree) =>
                  updateGroupLogic(tree, groupId, logic)
                )
              }
              onUpdateCondition={(conditionId, patch) =>
                updateBlockConditions(block.id, (tree) =>
                  updateCondition(tree, conditionId, patch)
                )
              }
              onAddCondition={(groupId) =>
                updateBlockConditions(block.id, (tree) =>
                  addConditionToGroup(tree, groupId, currentSourceConfig)
                )
              }
              onAddGroup={(groupId) =>
                updateBlockConditions(block.id, (tree) =>
                  addGroupToGroup(tree, groupId, currentSourceConfig)
                )
              }
              onRemoveNode={(nodeId) =>
                updateBlockConditions(block.id, (tree) =>
                  removeNodeFromTree(tree, nodeId, currentSourceConfig)
                )
              }
            />

            <ThenActionPanel
              block={block}
              currentSourceConfig={currentSourceConfig}
              errors={errors}
              clearError={clearError}
              readOnly={readOnly}
              onChange={(patch) =>
                updateBlock(block.id, {
                  action: { ...block.action, ...patch }
                })
              }
            />
          </ThenConnector>
        </div>
      </div>
    );
  };

  const renderElseBlock = (block) => (
    <div
      key={block.id}
      data-canvas-focus="rule-else"
      className={`flex w-max max-w-full flex-col ${embedInCanvas ? "items-stretch" : "w-full"}`}
    >
      <div className="mb-3 px-1 text-center sm:mb-4">
        <p className="m-0 text-[16px] font-semibold tracking-tight text-[var(--ink)] sm:text-[20px]">
          Else{" "}
          <span className="block font-medium text-[var(--ink-muted)] sm:inline">
            when no above condition matches
          </span>
        </p>
      </div>

      <div
        className={`flex flex-col items-center ${embedInCanvas ? "" : "overflow-x-auto overflow-y-visible"
          }`}
      >
        <ThenActionPanel
          block={block}
          currentSourceConfig={currentSourceConfig}
          errors={errors}
          clearError={clearError}
          readOnly={readOnly}
          onChange={(patch) =>
            updateBlock(block.id, {
              action: { ...block.action, ...patch }
            })
          }
        />
      </div>
    </div>
  );

  return (
    <RuleSection
      title={embedInCanvas ? "" : "Build Condition & Action"}
      description={
        embedInCanvas
          ? ""
          : "Define the conditions that trigger your automation and the actions to take."
      }
      className={
        embedInCanvas
          ? "border-0 bg-transparent p-0 shadow-none"
          : ""
      }
    >
      <div className={`flex flex-col ${embedInCanvas ? "items-center gap-8" : "gap-6"}`}>
        {middleBlocks.map((block, index) => renderConditionalBlock(block, index))}

        {!readOnly ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addElseIfBlock}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--brand-orange)]/35 bg-[var(--surface)] px-3 py-2 text-[13px] font-semibold text-[var(--brand-orange)] shadow-sm hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange-soft)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1"
              aria-label="Add else if block"
            >
              <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[var(--brand-orange)]">
                <PlusIcon className="h-3 w-3" aria-hidden />
              </span>
              Add Else If
            </button>
          </div>
        ) : null}

        {elseBlock ? renderElseBlock(elseBlock) : null}
      </div>
    </RuleSection>
  );
}
