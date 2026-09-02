import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageBox } from '../../components/ui/MessageBox';
import Button from '../../components/ui/Button';
import { ErrorXCircleIcon } from '../../components/ui/Icons';
import authService, {
  extractAuthToken,
  shouldRedirectToRegistration
} from "../../services/authService";

import { authKeys } from "../../services/queryKeys";
import { setCookie, TOKEN_NAME } from "../../utils/cookie";
import { savePendingAmazonRegistration } from "../../utils/storage";
import { LEADING_HASH_REGEX } from "../../utils/constants";

const LOGIN_PATH = "/sign-in";
const DASHBOARD_PATH = "/";
const SIGN_UP_PATH = "/sign-up";

const getCallbackData = (payload) => {
  const data = payload?.response?.data || payload;
  return data?.data && typeof data.data === "object" ? data.data : data;
};

const handleAmazonAuthResult = ({ data, navigate, setStatus, isError = false }) => {
  const callbackData = getCallbackData(data);

  if (shouldRedirectToRegistration(data) || callbackData?.is_redirect) {
    savePendingAmazonRegistration({
      ...callbackData,
      email: callbackData?.email || callbackData?.amazon_profile?.email || ""
    });
    MessageBox("info", "Account not found. Please complete registration.");
    navigate(SIGN_UP_PATH, { replace: true });
    return;
  }

  if (isError) {
    return false;
  }

  const token = extractAuthToken(data);
  if (!token) {
    MessageBox("error", "Amazon login completed but token was not found.");
    setStatus("error");
    return;
  }

  setCookie(TOKEN_NAME, token);
  window.history.replaceState({}, document.title, "/auth/callback");
  MessageBox("success", "Signed in with Amazon successfully");
  navigate(DASHBOARD_PATH, { replace: true });
};

const collectAmazonCallbackPayload = (searchParams) => {
  const query = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const hashQuery = {};
  const hash = window.location.hash?.replace(LEADING_HASH_REGEX, "") || "";
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    hashParams.forEach((value, key) => {
      hashQuery[key] = value;
    });
  }

  const payload = {
    ...query,
    ...hashQuery,
    type: "register",
    full_url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash || ""
  };

  return { payload, query, hashQuery };
};

export default function AmazonCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);
  const [status, setStatus] = useState("loading");

  const callbackMutation = useMutation({
    mutationKey: authKeys.callback(),
    mutationFn: async (payload) => {
      const response = await authService.amazonCallback(payload);
      return response;
    },
    onSuccess: (data) => {
      handleAmazonAuthResult({ data, navigate, setStatus });
    },
    onError: (error) => {
      const handled = handleAmazonAuthResult({
        data: error,
        navigate,
        setStatus,
        isError: true
      });
      if (handled === false) {
        setStatus("error");
      }
    }
  });

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const { payload } = collectAmazonCallbackPayload(searchParams);

    const amazonKeys = Object.keys(payload).filter(
      (key) => !["full_url", "pathname", "search", "hash"].includes(key)
    );

    if (amazonKeys.length === 0) {
      Promise.resolve().then(() => setStatus("error"));
      return;
    }

    callbackMutation.mutate(payload);

  }, []);

  if (status === "error") {
    return (
      <div className="min-h-[100dvh] overflow-y-auto bg-[var(--surface)] flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[420px] rounded-[7px] border border-[var(--ink)]/10 bg-[var(--surface)] px-6 sm:px-8 py-10 text-center shadow-[0_24px_80px_rgba(0, 0, 0,0.10)]">
          <div className="mb-6 inline-flex items-center justify-center gap-2 text-[15px] sm:text-lg font-bold tracking-tight uppercase text-[var(--ink)]">
            <span>Amazon Analysis SaaS</span>
          </div>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[7px] bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]">
            <ErrorXCircleIcon className="h-7 w-7" width={28} height={28} />
          </div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] mb-2">
            Authentication Failed
          </h1>
          <p className="text-[var(--ink)]/70 text-[14px] mb-8">
            Unable to complete Amazon sign in.
          </p>
          <Button
            type="button"
            fullWidth
            onClick={() => navigate(LOGIN_PATH, { replace: true })}
            className="uppercase"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-[var(--surface)] flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[420px] rounded-[7px] border border-[var(--ink)]/10 bg-[var(--surface)] px-6 sm:px-8 py-10 text-center shadow-[0_24px_80px_rgba(0, 0, 0,0.10)]">
        <div className="mb-6 inline-flex items-center justify-center gap-2 text-[15px] sm:text-lg font-bold tracking-tight uppercase text-[var(--ink)]">
          <span>Amazon Analysis SaaS</span>
        </div>
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--ink)]/20 border-t-[var(--brand-orange)]" />
        </div>
        <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] mb-2">
          Completing Amazon Sign In...
        </h1>
        <p className="text-[var(--ink)]/70 text-[14px]">
          Please wait while we securely log you in.
        </p>
      </div>
    </div>
  );
}