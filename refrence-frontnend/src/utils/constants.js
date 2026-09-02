const isProduction = import.meta.env.VITE_IS_PRODUCTION === "true";

export const IP_ADDRESS_API_URL = import.meta.env.VITE_IP_ADDRESS_API_URL || "";

export const RESEND_TIME = 30;

export const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w+)+$/;
export const PASSWORD_REGEX =
  /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export const PASSWORD_LOWER_REGEX = /[a-z]/;
export const PASSWORD_UPPER_REGEX = /[A-Z]/;
export const PASSWORD_DIGIT_REGEX = /\d/;
export const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
export const PHONE_REGEX = /^[0-9]{5,11}$/;
export const NON_DIGIT_REGEX = /\D/g;
export const OTP_CODE_REGEX = /^\d{6}$/;
export const DIGITS_ONLY_REGEX = /^\d+$/;
export const ASIN_TARGET_REGEX = /^\s*[A-Za-z_]*asin[A-Za-z_]*\s*=\s*["']?([A-Za-z0-9]{10})["']?\s*$/i;

export const AUTH_API_PATTERN =
  /\/auth\/(login|register|forgot-password|verify-forgot-password|reset-password|resend-otp|callback|logout|verify-login)/i;
export const BEARER_PREFIX_REGEX = /^Bearer\s+/i;
export const AMAZON_ACCESS_TOKEN_REGEX = /^Atza\|/i;
export const AMAZON_REFRESH_TOKEN_REGEX = /^Atzr\|/i;
export const AMAZON_CLIENT_TOKEN_REGEX = /^Atzn\|/i;
export const GOOGLE_OAUTH_TOKEN_REGEX = /^ya29\./i;
export const HTTP_URL_REGEX = /^https?:\/\//;

export const MOBILE_USER_AGENT_REGEX = /Mobi|Android/i;
export const APPLE_PLATFORM_REGEX = /Mac|iPhone|iPad|iPod/i;

export const ISO_DATE_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})/;
export const ISO_DATE_PARTS_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;
export const NORMALIZE_KEY_SPACES_REGEX = /[\s-]+/g;
export const UNDERSCORE_REGEX = /_/g;
export const UNDERSCORE_OR_HYPHEN_REGEX = /[_-]+/g;
export const WHITESPACE_COLLAPSE_REGEX = /\s+/g;
export const QUOTE_TRIM_REGEX = /^['"]|['"]$/g;
export const SLUG_NON_ALNUM_REGEX = /[^a-z0-9]+/g;
export const SLUG_EDGE_DASH_REGEX = /^-+|-+$/g;
export const SLUG_EDGE_UNDERSCORE_REGEX = /^_+|_+$/g;
export const TITLE_WORD_REGEX = /\b\w/g;
export const COMMA_REGEX = /,/g;
export const DOT_REGEX = /\./g;
export const LEADING_MINUS_REGEX = /^-/;
export const LEADING_HASH_REGEX = /^#/;
export const NON_NUMERIC_INPUT_REGEX = /[^\d.]/g;
export const RULE_ACOS_KEY_REGEX = /(^|_)acos(_|$)/;
export const RULE_ROAS_KEY_REGEX = /(^|_)roas(_|$)/;

export const AUTH_PAGE_PREFIXES = [
  "/sign-in",
  "/forgot-password",
  "/sign-up",
  "/auth-success",
  "/auth/callback",
  "/ads/callback"
];

export const DEFAULT_COUNTRY = {
  name: "India",
  dialCode: "+91",
  isoCode: "IN",
  flag: "https://cdn.kcak11.com/CountryFlags/countries/in.svg"
};

export const TOKEN_NAME = "Amazon-analysis-SaaS-token";
export const AUTH_COOKIE_KEY = TOKEN_NAME;
export const REFRESH_TOKEN_NAME = "auth-refresh-token";
export const USER_ID_NAME = "auth-user-id";
export const AUTH_PROVIDER_NAME = "auth-provider";
export const STORE_ID_NAME = "Amazon-analysis-SaaS-store-id";
export const REPORT_PREFS_COOKIE = "Amazon-analysis-SaaS-report-prefs";
export const REPORT_PREFS_STORAGE_KEY = "Amazon-analysis-SaaS-report-prefs";
export const REPORT_COLUMNS_COOKIE = "Amazon-analysis-SaaS-report-columns";
export const REPORT_FILTERS_COOKIE = "Amazon-analysis-SaaS-report-filters";
export const REPORT_DATE_RANGE_COOKIE = "Amazon-analysis-SaaS-report-date-range";
export const DASHBOARD_PREFS_COOKIE = "Amazon-analysis-SaaS-dashboard-prefs";
export const CREATE_RULE_WIZARD_COOKIE = "Amazon-analysis-SaaS-create-rule-wizard";

export const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction ? true : false
};

export const AMAZON_REGISTRATION_KEY = "pending_amazon_registration";
export const PENDING_ACCOUNT_TYPE_KEY = "pending_store_account_type";
export const PENDING_ADS_CONNECT_STORE_ID_KEY = "pending_ads_connect_store_id";
export const LEGACY_SELECTED_STORE_KEY = "amazon_analysis_selected_store";

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const RULE_SOURCES = [
  {
    id: "keyword_targets",
    label: "Keyword Targets",
    description: "Increase or decrease bid and pause or enable keyword."
  },
  {
    id: "budget",
    label: "Budget",
    description: "Increase or decrease budget and pause or enable campaign."
  },
  {
    id: "ad_products",
    label: "Ad Products",
    description: "Pause or enable ad products based on their performance metrics."
  },
  {
    id: "all_targets",
    label: "All Targets",
    description:
      "Increase or decrease bids, or pause and enable all targeting types based on performance."
  },
  {
    id: "search_terms",
    label: "Search Terms",
    description:
      "Add underperforming search terms as negative keywords based on performance criteria."
  }
];

export const RULE_METRICS = [
  { value: "acos", label: "ACOS", unit: "percent" },
  { value: "roas", label: "ROAS", unit: "number" },
  { value: "spend", label: "Spend", unit: "currency" },
  { value: "sales", label: "Sales", unit: "currency" },
  { value: "clicks", label: "Clicks", unit: "number" },
  { value: "impressions", label: "Impressions", unit: "number" },
  { value: "orders", label: "Orders", unit: "number" },
  { value: "ctr", label: "CTR", unit: "percent" },
  { value: "cpc", label: "CPC", unit: "currency" },
  { value: "cvr", label: "CVR", unit: "percent" }
];

export const RULE_OPERATORS = [
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" }
];

export const RULE_ACTION_TYPES = [
  { value: "increase_bid", label: "Increase bid" },
  { value: "decrease_bid", label: "Decrease bid" },
  { value: "set_bid", label: "Set bid" },
  { value: "pause", label: "Pause" },
  { value: "enable", label: "Enable" },
  { value: "increase_budget", label: "Increase budget" },
  { value: "decrease_budget", label: "Decrease budget" },
  { value: "set_budget", label: "Set budget" }
];

export const RULE_ACTION_UNITS = [
  { value: "percent", label: "Percentage" },
  { value: "fixed", label: "Fixed amount" }
];

export const VALUELESS_ACTIONS = new Set(["pause", "enable"]);

export const RULE_FREQUENCIES = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" }
];

export const WIZARD_SCHEDULE_FREQUENCIES = [
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" }
];

export const WIZARD_STEPS = [
  {
    id: 1,
    key: "basics",
    label: "Basics",
    description: "Rule name and level"
  },
  {
    id: 2,
    key: "target",
    label: "Target Type",
    description: "Choose what this rule applies to"
  },
  {
    id: 3,
    key: "conditions",
    label: "Conditions",
    description: "Define triggers and actions"
  },
  {
    id: 4,
    key: "products",
    label: "Products",
    description: "Select products to include"
  },
  {
    id: 5,
    key: "lookback",
    label: "Lookback",
    description: "Set lookback and wait days"
  },
  {
    id: 6,
    key: "schedule",
    label: "Schedule",
    description: "When the rule should run"
  },
  {
    id: 7,
    key: "notify",
    label: "Notify & Confirm",
    description: "Alerts and final review"
  }
];

/** Account-level rules skip Target Type (step 2) and Products (step 4). */
export function getVisibleWizardSteps(ruleLevel = "") {
  const level = String(ruleLevel || "").trim().toLowerCase();
  const isAccount = level === "account" || level.includes("account");
  if (!isAccount) return WIZARD_STEPS;
  return WIZARD_STEPS.filter((step) => step.key !== "target" && step.key !== "products");
}

export function getAdjacentWizardStep(currentStep, ruleLevel, direction = "next") {
  const steps = getVisibleWizardSteps(ruleLevel);
  const index = steps.findIndex((step) => step.id === Number(currentStep));
  if (index < 0) return steps[0]?.id || 1;
  if (direction === "prev") return steps[Math.max(0, index - 1)]?.id || steps[0].id;
  return steps[Math.min(steps.length - 1, index + 1)]?.id || steps[steps.length - 1].id;
}

export function getWizardStepPosition(currentStep, ruleLevel) {
  const steps = getVisibleWizardSteps(ruleLevel);
  const index = steps.findIndex((step) => step.id === Number(currentStep));
  return {
    steps,
    index: index < 0 ? 0 : index,
    number: index < 0 ? 1 : index + 1,
    total: steps.length,
    isFirst: index <= 0,
    isLast: index >= 0 && index === steps.length - 1
  };
}

export const RULE_HOURS = Array.from({ length: 24 }, (_, hour) => {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return {
    value: hour,
    label: `${display}${suffix}`
  };
});