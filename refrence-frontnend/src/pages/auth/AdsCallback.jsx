import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageBox } from '../../components/ui/MessageBox';
import Button from '../../components/ui/Button';
import { ErrorXCircleIcon } from '../../components/ui/Icons';
import { useStore } from "../../context/StoreContext";
import { useUserProfile } from "../../context/UserProfileContext";
import userService from "../../services/userService";

import { storeKeys, userKeys } from "../../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../../utils/cookie";
import {
  buildCreateStorePayload,
  clearPendingAccountType,
  clearPendingAdsConnectStoreId,
  extractCreatedStoreId,
  getPendingAdsConnectStoreId,
  normalizeStoreFromApi
} from "../../utils/storage";

const normalizeProfiles = (data) => {
  const list = data?.data?.profiles ?? data?.profiles ?? [];
  return Array.isArray(list) ? list : [];
};

const getProfileTokens = (data) => ({
  refresh_token: data?.data?.refresh_token ?? data?.refresh_token ?? "",
  access_token: data?.data?.access_token ?? data?.access_token ?? ""
});

const getAccountName = (profile) =>
  profile?.account_info?.name || profile?.raw?.accountInfo?.name || "Untitled profile";

const getAccountType = (profile) =>
  profile?.account_info?.type || profile?.raw?.accountInfo?.type || "—";

export default function AdsCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectStore, refetchStores } = useStore();
  const { ensureLoaded } = useUserProfile();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  const [status, setStatus] = useState("loading");
  const [profiles, setProfiles] = useState([]);
  const [tokens, setTokens] = useState({ refresh_token: "", access_token: "" });
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const adsCallbackMutation = useMutation({
    mutationKey: [...userKeys.all, "amazon-ads-callback"],
    mutationFn: async (payload) => {
      const token = getCookie(TOKEN_NAME);
      return userService.amazonAdsCallback(payload, token);
    },
    onSuccess: (data) => {
      const nextProfiles = normalizeProfiles(data);
      const nextTokens = getProfileTokens(data);

      if (!nextProfiles.length || !nextTokens.refresh_token || !nextTokens.access_token) {
        MessageBox("error", "No Amazon Ads profiles were returned. Please try again.");
        setStatus("error");
        return;
      }

      setProfiles(nextProfiles);
      setTokens(nextTokens);
      setSelectedProfileId(nextProfiles[0]?.profile_id ?? null);
      setStatus("select");
    },
    onError: () => {
      setStatus("error");
    }
  });

  const connectAdsOnlyMutation = useMutation({
    mutationKey: [...userKeys.all, "amazon-ads-select-profile"],
    mutationFn: async (payload) => {
      const token = getCookie(TOKEN_NAME);
      return userService.selectAmazonAdsProfile(payload, token);
    },
    onSuccess: async (res, variables) => {
      clearPendingAdsConnectStoreId();
      clearPendingAccountType();

      await queryClient.invalidateQueries({ queryKey: storeKeys.list() });
      await queryClient.invalidateQueries({ queryKey: userKeys.getUser() });
      await refetchStores();

      if (variables?.store_id) {
        selectStore(variables.store_id);
      }

      MessageBox("success", res?.message || "Ads connected successfully.");
      navigate("/", { replace: true });
    }
  });

  const createStoreMutation = useMutation({
    mutationKey: storeKeys.create(),
    mutationFn: async ({ createPayload, selectPayloadBase }) => {
      const token = getCookie(TOKEN_NAME);

      const createRes = await userService.createAmazonStore(createPayload, token);
      const storeId = extractCreatedStoreId(createRes);

      if (!storeId) {
        throw new Error("Store was created but store_id was not returned.");
      }

      const selectRes = await userService.selectAmazonAdsProfile(
        {
          ...selectPayloadBase,
          store_id: storeId
        },
        token
      );

      return { createRes, selectRes, storeId };
    },
    onSuccess: async ({ createRes, storeId }) => {
      clearPendingAccountType();
      clearPendingAdsConnectStoreId();

      const created =
        normalizeStoreFromApi(createRes?.data?.store || createRes?.data || createRes?.store) ||
        (storeId ? { id: storeId, name: createRes?.data?.store_name || "Store" } : null);

      await queryClient.invalidateQueries({ queryKey: storeKeys.list() });
      await queryClient.invalidateQueries({ queryKey: userKeys.getUser() });
      await refetchStores();

      if (storeId) {
        selectStore(storeId);
      } else if (created?.id) {
        selectStore(created.id);
      }

      MessageBox("success", createRes?.message || "Store connected successfully.");
      navigate("/", { replace: true });
    }
  });

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const code =
      searchParams.get("code") ||
      searchParams.get("sp_api_oauth_code") ||
      "";
    const state = searchParams.get("state") || "";

    if (!code && !state) {
      Promise.resolve().then(() => setStatus("error"));
      return;
    }

    adsCallbackMutation.mutate({ code, state });

  }, []);

  const isConfirmPending =
    connectAdsOnlyMutation.isPending || createStoreMutation.isPending;

  const handleConfirmSelection = () => {
    if (isConfirmPending) return;

    const profile = profiles.find((item) => item.profile_id === selectedProfileId);
    if (!profile) {
      MessageBox("error", "Please select an Amazon Ads profile to continue.");
      return;
    }

    const selectPayloadBase = {
      profile_id: profile.profile_id,
      country_code: profile.country_code || "",
      region: profile.region || "",
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token
    };

    const existingStoreId = getPendingAdsConnectStoreId();

    if (existingStoreId) {
      connectAdsOnlyMutation.mutate({
        ...selectPayloadBase,
        store_id: Number(existingStoreId) || existingStoreId
      });
      return;
    }

    const createPayload = buildCreateStorePayload({
      profile,
      tokens,
      brandName: ""
    });

    createStoreMutation.mutate({
      createPayload,
      selectPayloadBase
    });
  };

  if (status === "error") {
    return (
      <div className="min-h-[100dvh] overflow-y-auto bg-[var(--surface)] flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[440px] rounded-[7px] border border-[var(--ink)]/10 bg-[var(--surface)] px-6 sm:px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
          <div className="mb-6 inline-flex items-center justify-center gap-2 text-[15px] sm:text-lg font-bold tracking-tight uppercase text-[var(--ink)]">
            <span>Amazon Analysis SaaS</span>
          </div>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[7px] bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]">
            <ErrorXCircleIcon className="h-7 w-7" width={28} height={28} />
          </div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] mb-2">
            Ads Connection Failed
          </h1>
          <p className="text-[var(--ink)]/70 text-[14px] mb-8">
            Unable to complete Amazon Ads authorization.
          </p>
          <Button
            type="button"
            fullWidth
            onClick={() => navigate("/", { replace: true })}
            className="uppercase"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (status === "select") {
    const isConnectOnly = Boolean(getPendingAdsConnectStoreId());

    return (
      <div className="min-h-[100dvh] bg-[var(--surface)] flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[560px] rounded-[7px] border border-[var(--ink)]/10 bg-[var(--surface)] px-5 sm:px-8 py-8 sm:py-10 shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
          <div className="mb-6 text-[15px] sm:text-lg font-bold tracking-tight uppercase text-[var(--ink)]">
            Amazon Analysis SaaS
          </div>

          <h1 className="text-[22px] sm:text-[26px] font-bold text-[var(--ink)] leading-tight">
            Select Ads Profile
          </h1>
          <p className="mt-2 text-[14px] text-[var(--ink)]/65">
            {isConnectOnly
              ? "Choose the Amazon Ads account to connect to this store."
              : "Choose the Amazon Ads account you want to connect."}
          </p>

          <div
            role="radiogroup"
            aria-label="Amazon Ads profiles"
            className="mt-6 max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1"
          >
            {profiles.map((profile) => {
              const profileId = profile.profile_id;
              const selected = selectedProfileId === profileId;

              return (
                <label
                  key={profileId}
                  className={`flex cursor-pointer items-start gap-3 rounded-[7px] border px-4 py-3.5 transition-colors ${selected
                      ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/10"
                      : "border-[var(--ink)]/12 bg-[var(--surface)] hover:border-[var(--ink)]/30"
                    }`}
                >
                  <input
                    type="radio"
                    name="ads-profile"
                    value={profileId}
                    checked={selected}
                    onChange={() => setSelectedProfileId(profileId)}
                    className="mt-1 accent-[var(--brand-orange)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-[var(--ink)]">
                        {getAccountName(profile)}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/55">
                        {getAccountType(profile)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] text-[var(--ink)]/60">
                      {profile.country_code || "—"} · {profile.currency_code || "—"} ·{" "}
                      {profile.region || "—"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <Button
            type="button"
            fullWidth
            onClick={handleConfirmSelection}
            loading={isConfirmPending}
            disabled={selectedProfileId == null}
            className="mt-7 whitespace-normal text-center leading-tight uppercase text-[13px] sm:text-[15px]"
          >
            {isConnectOnly ? "Connect Selected Profile" : "Continue with Selected Profile"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-[var(--surface)] flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[440px] rounded-[7px] border border-[var(--ink)]/10 bg-[var(--surface)] px-6 sm:px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
        <div className="mb-6 inline-flex items-center justify-center gap-2 text-[15px] sm:text-lg font-bold tracking-tight uppercase text-[var(--ink)]">
          <span>Amazon Analysis SaaS</span>
        </div>
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--ink)]/20 border-t-[var(--brand-orange)]" />
        </div>
        <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] mb-2">
          Connecting Amazon Ads...
        </h1>
        <p className="text-[var(--ink)]/70 text-[14px]">
          Please wait while we process your Amazon Ads authorization.
        </p>
      </div>
    </div>
  );
}