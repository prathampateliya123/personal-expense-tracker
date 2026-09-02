import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AccountSettingsNav from "../layouts/AccountSettingsNav";
import { EyeClosedIcon, EyeOpenIcon } from "../components/ui/Icons";
import Button from "../components/ui/Button";
import PasteButton from "../components/ui/PasteButton";
import { MessageBox } from "../components/ui/MessageBox";
import { useStore } from "../context/StoreContext";
import userService from "../services/userService";
import { storeKeys, userKeys } from "../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { NON_DIGIT_REGEX } from "../utils/constants";

const FIELD_META = {
  storeName: { label: "Store Name" },
  brandName: { label: "Brand Name" },
  brandWebsite: { label: "Brand Website" },
  contactEmail: { label: "Brand contact email" },
  contactPhone: { label: "Brand contact phone" }
};

const emptyInputs = {
  storeName: "",
  brandName: "",
  brandWebsite: "",
  contactEmail: "",
  contactPhone: ""
};

const mapStoreToInputs = (store = {}) => ({
  storeName: store.store_name || "",
  brandName: store.marketplace_name || store.brand_name || "",
  brandWebsite: store.website || store.brand_website || "",
  contactEmail: store.email || store.brand_email || "",
  contactPhone:
    store.mobile != null && store.mobile !== ""
      ? String(store.mobile).replace(NON_DIGIT_REGEX, "")
      : store.brand_mobile != null && store.brand_mobile !== ""
        ? String(store.brand_mobile).replace(NON_DIGIT_REGEX, "")
        : ""
});

export default function BrandDetails() {
  const navigate = useNavigate();
  const token = getCookie(TOKEN_NAME);
  const { selectedStore, selectedStoreId, ensureLoaded } = useStore();
  const storeId = selectedStoreId || selectedStore?.id || "";

  const [inputs, setInputs] = useState(emptyInputs);
  const [showMasked, setShowMasked] = useState({
    contactEmail: false,
    contactPhone: false
  });
  const [hydratedForStoreId, setHydratedForStoreId] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) return;
    ensureLoaded();
  }, [token, ensureLoaded]);

  const storeQuery = useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: async () => {
      const data = await userService.getStore(storeId, getCookie(TOKEN_NAME));
      return data?.data ?? data ?? {};
    },
    enabled: Boolean(token && storeId),
    retry: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    setInputs(emptyInputs);
    setHydratedForStoreId("");
  }, [storeId]);

  useEffect(() => {
    if (!storeId || !storeQuery.isSuccess || !storeQuery.data) return;
    if (hydratedForStoreId === String(storeId)) return;

    setInputs(mapStoreToInputs(storeQuery.data));
    setHydratedForStoreId(String(storeId));
  }, [storeId, storeQuery.isSuccess, storeQuery.data, hydratedForStoreId]);

  const updateStoreMutation = useMutation({
    mutationKey: userKeys.updateStoreDetails(),
    mutationFn: async (payload) =>
      userService.updateStoreDetails(payload, getCookie(TOKEN_NAME)),
    onSuccess: async (data) => {
      MessageBox("success", data?.message || "Brand details updated successfully.");

      const result = await storeQuery.refetch();
      const freshStore = result?.data || {};
      setInputs(mapStoreToInputs(freshStore));
      setHydratedForStoreId(String(storeId));
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === "contactPhone" ? value.replace(NON_DIGIT_REGEX, "") : value
    }));
  };

  const toggleMasked = (field) => {
    setShowMasked((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (updateStoreMutation.isPending) return;

    const payload = {};
    const storeName = inputs.storeName.trim();
    const brandName = inputs.brandName.trim();
    const brandWebsite = inputs.brandWebsite.trim();
    const brandEmail = inputs.contactEmail.trim();
    const brandMobile = String(inputs.contactPhone || "").trim();
    const logo = String(inputs.logo || "").trim();

    if (storeName) payload.store_name = storeName;
    if (brandName) payload.brand_name = brandName;
    if (brandWebsite) payload.brand_website = brandWebsite;
    if (brandEmail) payload.brand_email = brandEmail;
    if (brandMobile) payload.brand_mobile = brandMobile;
    if (logo) payload.logo = logo;

    if (Object.keys(payload).length === 0) {
      MessageBox("error", "Please fill at least one field to save.");
      return;
    }

    payload.store_id = Number(storeId) || storeId;
    updateStoreMutation.mutate(payload);
  };

  const isHydrated = hydratedForStoreId === String(storeId);

  const renderField = ({ name, type = "text", placeholder, maskable = false, readOnly = false, pasteable = false }) => {
    const meta = FIELD_META[name];
    const inputType = maskable && !showMasked[name] ? "password" : type;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] lg:grid-cols-[180px_1fr] gap-2 sm:gap-6 items-start sm:items-center px-0 sm:px-5 py-3.5 sm:py-4">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[var(--ink)] uppercase">{meta.label}</p>
        </div>
        <div className="relative w-full">
          <input
            type={inputType}
            name={name}
            value={inputs[name]}
            onChange={readOnly ? undefined : handleChange}
            readOnly={readOnly}
            placeholder={placeholder}
            inputMode={name === "contactPhone" ? "numeric" : undefined}
            autoComplete="off"
            className={`w-full h-[44px] rounded-[7px] border border-[var(--ink)]/20 bg-[var(--surface)] px-[14px] text-[14px] text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink)]/50 focus:border-[var(--brand-orange)] hover:border-[var(--ink)]/40 ${maskable || pasteable ? "pr-11" : ""
              } ${readOnly ? "cursor-not-allowed bg-[var(--ink)]/5 text-[var(--ink)]/70 hover:border-[var(--ink)]/20 focus:border-[var(--ink)]/20" : ""}`}
          />
          {maskable && (
            <button
              type="button"
              onClick={() => toggleMasked(name)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink)]/55 hover:text-[var(--ink)] transition-colors cursor-pointer"
              aria-label={showMasked[name] ? "Hide value" : "Show value"}
            >
              {showMasked[name] ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          )}
          {pasteable && !readOnly && (
            <PasteButton
              onPaste={(text) => {
                setInputs((prev) => ({ ...prev, [name]: text }));
              }}
            />
          )}
        </div>
      </div>
    );
  };

  if (!token) {
    return null;
  }

  let formContent;
  if (!storeId) {
    formContent = (
      <div className="mt-8 flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[16px] font-semibold text-[var(--ink)]">No store selected</p>
        <p className="mt-1.5 max-w-[320px] text-[13px] text-[var(--ink)]/55">
          Select a store from the sidebar to manage brand details.
        </p>
      </div>
    );
  } else {
    const formLoading = (storeQuery.isLoading || !isHydrated) && !storeQuery.isError;
    formContent = (
      <form
        method="post"
        className={`mt-8 ${formLoading ? "pointer-events-none opacity-70" : ""}`}
        onSubmit={handleSubmit}
        aria-busy={formLoading || undefined}
      >
        <div className="divide-y divide-[var(--ink)]/10">
          {renderField({
            name: "storeName",
            placeholder: "Enter store name"
          })}
          {renderField({
            name: "brandName",
            placeholder: "Enter brand name",
            readOnly: true
          })}
          {renderField({
            name: "brandWebsite",
            type: "url",
            placeholder: "https://www.yourbrand.com",
            pasteable: true
          })}
          {renderField({
            name: "contactEmail",
            type: "email",
            placeholder: "Enter brand contact email",
            maskable: true
          })}
          {renderField({
            name: "contactPhone",
            placeholder: "Enter brand contact phone",
            maskable: true
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            loading={updateStoreMutation.isPending || formLoading}
            disabled={storeQuery.isFetching || formLoading}
            className="w-full min-w-0 sm:w-auto sm:min-w-[140px]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-0 min-h-full">
        <aside className="md:w-[220px] lg:w-[240px] shrink-0 md:pr-6 md:border-r md:border-[var(--border)]">
          <div className="md:sticky md:top-0">
            <AccountSettingsNav />
          </div>
        </aside>

        <div className="flex-1 min-w-0 md:pl-6 lg:pl-8">
          <h1 className="page-title">
            Brand Details
          </h1>
          <p className="page-subtitle">
            Manage your Brand details.
          </p>

          {formContent}
        </div>
      </div>
  );
}