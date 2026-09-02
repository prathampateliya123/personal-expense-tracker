import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "../../ui/Icons";
import Button from "../../ui/Button";
import { MessageBox } from "../../ui/MessageBox";
import {
  createDefaultRuleBlocks,
  ensureRuleBlockStructure
} from "../../../utils/ruleTree";
import { validateWizardStep } from "../../../utils/ruleValidation";
import { buildRulePayload } from "../../../utils/rulePayload";
import {
  clearCreateRuleWizardDraft,
  getCreateRuleWizardDraft,
  setCreateRuleWizardDraft
} from "../../../utils/storage";
import {
  getAdjacentWizardStep,
  getVisibleWizardSteps,
  getWizardStepPosition
} from "../../../utils/constants";
import { createRule, getRuleReportsConfig } from "../../../services/ruleService";
import { ruleKeys } from "../../../services/queryKeys";
import { useStore } from "../../../context/StoreContext";
import { getCookie, TOKEN_NAME } from "../../../utils/cookie";
import {
  applyAccountDefaultSource,
  findAccountDefaultReport,
  findRuleReportById,
  findRuleReportByName,
  mapRuleLevelsToOptions,
  mapRuleReportsToOptions,
  normalizeRuleLevel,
  resolveReportId
} from "../../../utils/ruleReportsConfig";
import WizardStepIndicator from "./WizardStepIndicator";
import StepBasics from "./steps/StepBasics";
import StepTargetType from "./steps/StepTargetType";
import StepConditions from "./steps/StepConditions";
import StepProducts from "./steps/StepProducts";
import StepLookback from "./steps/StepLookback";
import StepSchedule from "./steps/StepSchedule";
import StepNotifyConfirm from "./steps/StepNotifyConfirm";

function createWizardFormState() {
  return {
    name: "",
    ruleLevel: "product",
    targetType: "",
    source: "",
    reportId: null,
    ruleBlocks: createDefaultRuleBlocks(),
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
  };
}

function mergeWizardForm(draftForm) {
  const base = createWizardFormState();
  if (!draftForm) return base;
  let ruleBlocks = base.ruleBlocks;
  if (Array.isArray(draftForm.ruleBlocks) && draftForm.ruleBlocks.length) {
    try {
      ruleBlocks = JSON.parse(JSON.stringify(draftForm.ruleBlocks));
    } catch {
      ruleBlocks = base.ruleBlocks;
    }
  }
  return {
    ...base,
    ...draftForm,
    source: draftForm.source || draftForm.targetType || base.source,
    ruleBlocks: ensureRuleBlockStructure(ruleBlocks)
  };
}

function scrollToElement(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function CreateRuleWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedStore, selectedStoreId } = useStore();
  const storeId = Number(selectedStoreId || selectedStore?.id) || 0;
  const token = getCookie(TOKEN_NAME);

  const storeScope = String(storeId || "");
  const draftRef = useRef(null);
  if (draftRef.current === null) {
    draftRef.current = getCreateRuleWizardDraft(storeScope);
  }
  const initialDraft = draftRef.current;

  const [step, setStep] = useState(() => initialDraft?.step || 1);
  const [maxReachedStep, setMaxReachedStep] = useState(() =>
    Math.max(1, Number(initialDraft?.maxReachedStep) || Number(initialDraft?.step) || 1)
  );
  const [form, setForm] = useState(() => mergeWizardForm(initialDraft?.form));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const skipPersistRef = useRef(false);

  const {
    data: reportsConfig,
    isLoading: reportsLoading,
    isError: reportsIsError,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: [...ruleKeys.config(), { storeId: String(storeId || "") }],
    queryFn: async () => getRuleReportsConfig(storeId, token),
    enabled: Boolean(token) && storeId > 0 && selectedStore?.sync_per === 100,
    staleTime: 5 * 60 * 1000
  });

  const ruleReports = reportsConfig?.rule_report || [];
  const ruleLevels = reportsConfig?.rule_Level || [];

  const ruleLevelOptions = useMemo(
    () => mapRuleLevelsToOptions(ruleLevels),
    [ruleLevels]
  );

  const targetTypeOptions = useMemo(
    () => mapRuleReportsToOptions(ruleReports),
    [ruleReports]
  );

  const isAccountLevel = normalizeRuleLevel(form.ruleLevel) === "account";
  const visibleSteps = useMemo(
    () => getVisibleWizardSteps(form.ruleLevel),
    [form.ruleLevel]
  );
  const stepMeta = useMemo(
    () => getWizardStepPosition(step, form.ruleLevel),
    [step, form.ruleLevel]
  );

  const currentSourceConfig = useMemo(() => {
    if (isAccountLevel) {
      return (
        findRuleReportById(ruleReports, form.reportId) ||
        findRuleReportByName(ruleReports, form.targetType || form.source) ||
        findAccountDefaultReport(ruleReports)
      );
    }
    const byId = findRuleReportById(ruleReports, form.reportId);
    if (byId) return byId;
    return findRuleReportByName(ruleReports, form.targetType || form.source) || null;
  }, [isAccountLevel, ruleReports, form.reportId, form.targetType, form.source]);

  // Account level skips Target Type + Products — bounce off those steps
  useEffect(() => {
    if (!isAccountLevel) return;
    if (step === 2 || step === 4) {
      const next = getAdjacentWizardStep(step, form.ruleLevel, "next");
      setStep(next);
      setMaxReachedStep((prev) => Math.max(prev, next));
    }
  }, [isAccountLevel, step, form.ruleLevel]);

  // Account level: no product selection
  useEffect(() => {
    if (!isAccountLevel) return;
    if (!form.selectedProductIds?.length && !form.selectedProducts?.length) return;
    setForm((prev) => ({
      ...prev,
      selectedProductIds: [],
      selectedProducts: []
    }));
  }, [isAccountLevel, form.selectedProductIds, form.selectedProducts]);

  // Account level: auto-select Group Campaign report (hidden step 2 default)
  useEffect(() => {
    if (!isAccountLevel || !ruleReports.length) return;
    const defaults = applyAccountDefaultSource({}, ruleReports);
    if (!defaults.source) return;
    const alreadySet =
      form.source === defaults.source &&
      form.targetType === defaults.targetType &&
      Number(form.reportId || 0) === Number(defaults.reportId || 0);
    if (alreadySet) return;
    setForm((prev) => ({
      ...prev,
      ...defaults,
      ruleBlocks: createDefaultRuleBlocks(findAccountDefaultReport(ruleReports))
    }));
  }, [isAccountLevel, ruleReports, form.source, form.targetType, form.reportId]);

  const reportsLoadError = useMemo(() => {
    if (!reportsIsError) return "";
    return (
      reportsError?.response?.data?.message ||
      reportsError?.message ||
      "Failed to load reports. Please try again."
    );
  }, [reportsIsError, reportsError]);

  const patchForm = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearError = useCallback((key) => {
    setErrors((prev) => {
      if (!prev?.[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    setDraftReady(true);
  }, []);

  const applyStoreDraft = useCallback((nextStoreId) => {
    const draft = getCreateRuleWizardDraft(nextStoreId);
    setStep(draft?.step || 1);
    setMaxReachedStep(
      Math.max(1, Number(draft?.maxReachedStep) || Number(draft?.step) || 1)
    );
    setForm(mergeWizardForm(draft?.form));
    setErrors({});
  }, []);

  const lastStoreScopeRef = useRef(storeScope);
  useEffect(() => {
    if (lastStoreScopeRef.current === storeScope) return;
    lastStoreScopeRef.current = storeScope;
    skipPersistRef.current = true;
    applyStoreDraft(storeScope);
    const timer = window.setTimeout(() => {
      skipPersistRef.current = false;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storeScope, applyStoreDraft]);

  useEffect(() => {
    if (!draftReady || skipPersistRef.current) return;
    setCreateRuleWizardDraft({ step, maxReachedStep, form, storeId: storeScope });
  }, [step, maxReachedStep, form, draftReady, storeScope]);

  useEffect(() => {
    const flush = () => {
      if (skipPersistRef.current) return;
      setCreateRuleWizardDraft({ step, maxReachedStep, form, storeId: storeScope });
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [step, maxReachedStep, form, storeScope]);

  const clearDraftAndLeave = useCallback(() => {
    skipPersistRef.current = true;
    clearCreateRuleWizardDraft(storeScope);
    navigate("/rule-builder");
  }, [navigate, storeScope]);

  const handleBackToList = () => {
    clearDraftAndLeave();
  };

  const handleStepBack = () => {
    setErrors({});
    setStep((prev) => getAdjacentWizardStep(prev, form.ruleLevel, "prev"));
  };

  const goToStep = (nextStep) => {
    const allowed = visibleSteps.some((item) => item.id === Number(nextStep));
    const target = allowed ? Number(nextStep) : stepMeta.steps[0]?.id || 1;
    if (target > maxReachedStep) return;
    setErrors({});
    setStep(target);
  };

  const handleNext = () => {
    if ((step === 1 || step === 2) && reportsLoading) return;
    if ((step === 1 || step === 2) && reportsIsError && !ruleReports.length && !ruleLevels.length)
      return;
    const result = validateWizardStep(step, form);
    if (result) {
      setErrors(result.errors);
      scrollToElement(result.firstErrorId);
      return;
    }
    setErrors({});
    const next = getAdjacentWizardStep(step, form.ruleLevel, "next");
    setMaxReachedStep((prev) => Math.max(prev, next));
    setStep(next);
  };

  const handleStepSelect = (stepId) => {
    goToStep(stepId);
  };

  const handleSubmit = async () => {
    for (const item of visibleSteps) {
      if (item.id === 7) continue;
      const result = validateWizardStep(item.id, form);
      if (result) {
        setErrors(result.errors);
        setStep(item.id);
        scrollToElement(result.firstErrorId);
        return;
      }
    }

    if (!storeId) {
      MessageBox("error", "Please select a store first.");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const payload = buildRulePayload({
        form: {
          ...form,
          source: form.source || form.targetType
        },
        storeId,
        sourceConfig: currentSourceConfig
      });
      const response = await createRule(payload, token);
      MessageBox("success", response?.message || "Rule created successfully.");
      await queryClient.invalidateQueries({ queryKey: ruleKeys.all });
      skipPersistRef.current = true;
      clearCreateRuleWizardDraft(storeScope);
      navigate("/rule-builder");
    } catch {
      void 0;
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepBasics
            form={form}
            errors={errors}
            onChange={(patch) => {
              const nextLevel = patch?.ruleLevel;
              if (nextLevel && nextLevel !== form.ruleLevel) {
                const account = normalizeRuleLevel(nextLevel) === "account";
                if (account) {
                  const defaults = applyAccountDefaultSource(patch, ruleReports);
                  const nextSource = findAccountDefaultReport(ruleReports);
                  patchForm({
                    ...defaults,
                    selectedProductIds: [],
                    selectedProducts: [],
                    ruleBlocks: createDefaultRuleBlocks(nextSource)
                  });
                  if (step === 2 || step === 4) {
                    const next = getAdjacentWizardStep(step, "account", "next");
                    setStep(next);
                    setMaxReachedStep((prev) => Math.max(prev, next));
                  }
                  return;
                }
                patchForm(patch);
                return;
              }
              patchForm(patch);
            }}
            clearError={clearError}
            options={ruleLevelOptions}
            loading={Boolean(storeId) && reportsLoading}
            loadError={reportsLoadError}
            onRetry={() => refetchReports()}
          />
        );
      case 2:
        return (
          <StepTargetType
            form={form}
            errors={errors}
            onChange={(patch) => {
              const nextType = patch?.targetType;
              if (nextType && nextType !== form.targetType) {
                const nextSource =
                  findRuleReportById(ruleReports, patch?.reportId) ||
                  findRuleReportByName(ruleReports, nextType);
                const nextReportId = resolveReportId(nextSource, patch);
                patchForm({
                  ...patch,
                  source: nextType,
                  reportId: nextReportId,
                  ruleBlocks: createDefaultRuleBlocks(nextSource)
                });
                return;
              }
              patchForm(patch);
            }}
            clearError={clearError}
            options={targetTypeOptions}
            loading={Boolean(storeId) && reportsLoading}
            loadError={reportsLoadError}
            onRetry={() => refetchReports()}
          />
        );
      case 3:
        return (
          <StepConditions
            form={form}
            errors={errors}
            currentSourceConfig={currentSourceConfig}
            onChange={patchForm}
            clearError={clearError}
          />
        );
      case 4:
        return (
          <StepProducts
            form={form}
            errors={errors}
            onChange={patchForm}
            clearError={clearError}
          />
        );
      case 5:
        return (
          <StepLookback
            form={form}
            errors={errors}
            onChange={patchForm}
            clearError={clearError}
          />
        );
      case 6:
        return (
          <StepSchedule
            form={form}
            errors={errors}
            onChange={patchForm}
            clearError={clearError}
          />
        );
      case 7:
        return (
          <StepNotifyConfirm form={form} errors={errors} onChange={patchForm} />
        );
      default:
        return null;
    }
  };

  const isLastStep = stepMeta.isLast;
  const fillStep = step === 3;
  const stickyActions = fillStep;

  const actionsInner = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className={`grid w-full gap-2 sm:flex sm:w-auto sm:shrink-0 ${!stepMeta.isFirst ? "grid-cols-2" : "grid-cols-1"}`}>
        {!stepMeta.isFirst ? (
          <Button
            variant="secondary"
            size="md"
            className="w-full min-w-0 sm:w-auto sm:min-w-[100px]"
            onClick={handleStepBack}
            disabled={submitting}
          >
            Back
          </Button>
        ) : null}
        {isLastStep ? (
          <Button
            size="md"
            className="w-full min-w-0 sm:w-auto sm:min-w-[100px]"
            loading={submitting}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            size="md"
            className="w-full min-w-0 sm:w-auto sm:min-w-[100px]"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </div>
      <p className="shrink-0 text-center text-[12px] font-medium text-[var(--ink-muted)] sm:pl-2 sm:text-right">
        Step {stepMeta.number} of {stepMeta.total}
      </p>
    </div>
  );

  const stickyFooter = (
    <div className="relative z-20 shrink-0 overflow-visible border-t border-[var(--border)] bg-[var(--surface)] px-3 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-4 sm:pb-4 lg:px-6 xl:pr-8">
      {actionsInner}
    </div>
  );

  const inlineFooter = (
    <div className="mt-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3.5 sm:mt-5 sm:px-5 sm:py-4">
      {actionsInner}
    </div>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
      <div className="shrink-0 overflow-visible border-b border-[color-mix(in_srgb,var(--brand-orange)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-orange-soft)_80%,var(--surface))] px-2 pt-2.5 pb-2 sm:px-5 sm:pt-3.5 sm:pb-3 lg:hidden">
        <WizardStepIndicator
          layout="horizontal"
          hideTitle
          steps={visibleSteps}
          currentStep={step}
          maxReachableStep={maxReachedStep}
          onStepClick={handleStepSelect}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:gap-4 lg:pt-5 lg:pr-6">
        <div
          className={
            fillStep
              ? "flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 sm:px-5 sm:pt-4 lg:px-0 lg:pt-0"
              : "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pt-3 pb-6 sm:px-5 sm:pt-4 lg:px-0 lg:pt-0"
          }
        >
          <div className="mb-3 shrink-0 sm:mb-5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 cursor-pointer sm:h-[38px] sm:w-[38px]"
                title="Back to Rule List"
                aria-label="Back to rule list"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="page-title truncate">Create Rule</h1>
              </div>
            </div>
          </div>

          <div
            className={
              fillStep
                ? "flex min-h-0 min-w-0 w-full flex-1 flex-col"
                : "min-w-0 w-full"
            }
          >
            {renderStep()}
            {!stickyActions ? <div className="hidden lg:block">{inlineFooter}</div> : null}
          </div>
        </div>

        {stickyActions ? stickyFooter : <div className="lg:hidden">{stickyFooter}</div>}
      </div>

      <aside className="hidden min-h-0 w-[240px] shrink-0 flex-col overflow-hidden border-l border-[color-mix(in_srgb,var(--brand-orange)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-orange-soft)_72%,var(--surface))] lg:flex xl:w-[300px] 2xl:w-[348px]">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 xl:px-6 xl:py-5">
          <WizardStepIndicator
            layout="vertical"
            steps={visibleSteps}
            currentStep={step}
            maxReachableStep={maxReachedStep}
            onStepClick={handleStepSelect}
            className="min-h-full"
          />
        </div>
      </aside>
    </div>
  );
}