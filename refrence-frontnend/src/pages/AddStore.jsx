import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AmazonIcon, ChevronLeftIcon } from '../components/ui/Icons';
import Button from '../components/ui/Button';
import { MessageBox } from '../components/ui/MessageBox';
import { extractRedirectUrl } from "../services/authService";
import userService from "../services/userService";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { clearPendingAdsConnectStoreId, setPendingAccountType } from "../utils/storage";

const ACCOUNT_TYPES = [
  {
    id: "seller",
    title: "Amazon - Seller",
    description: "You sell directly to Amazon's customers."
  },
  {
    id: "vendor",
    title: "Amazon - Vendor",
    description: "You sell wholesale to Amazon."
  },
  {
    id: "ams",
    title: "Amazon - AMS",
    description: "You have a prepaid ads account."
  },
  {
    id: "dsp",
    title: "Amazon - DSP",
    description: "You have an Amazon DSP account."
  }
];

export default function AddStore() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("seller");

  const connectAdsMutation = useMutation({
    mutationFn: async () => {
      const authToken = getCookie(TOKEN_NAME);
      return userService.connectAmazonAds(authToken);
    },
    onSuccess: (data) => {
      const redirectUrl = extractRedirectUrl(data);
      if (!redirectUrl) {
        MessageBox("error", "Amazon Ads redirect URL was not found. Please try again.");
        return;
      }
      try {
        clearPendingAdsConnectStoreId();
        setPendingAccountType(selectedType);
      } catch {
        void 0;
      }
      window.location.assign(redirectUrl);
    }
  });

  const handleContinue = () => {
    if (connectAdsMutation.isPending) return;
    connectAdsMutation.mutate();
  };

  return (
    <div className="w-full min-w-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]/60 hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="h-4 w-4" strokeWidth={2.5} />
          Back
        </button>

        <div className="mb-6">
          <h1 className="page-title">
            What type of Amazon account do you have?
          </h1>
          <p className="page-subtitle">
            Select the account type that matches your Amazon business model to connect your
            account.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCOUNT_TYPES.map((type) => {
            const selected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`flex w-full items-start gap-3.5 rounded-[7px] border px-4 py-4 text-left transition-colors cursor-pointer ${selected
                    ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/10"
                    : "border-[var(--ink)]/10 bg-[var(--surface)] hover:border-[var(--ink)]/25 hover:bg-[var(--ink)]/[0.02]"
                  }`}
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[var(--surface)] border border-[var(--ink)]/10">
                  <AmazonIcon width={22} height={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[15px] font-semibold ${selected ? "text-[var(--brand-orange-strong)]" : "text-[var(--ink)]"
                      }`}
                  >
                    {type.title}
                  </span>
                  <span
                    className={`mt-1 block text-[13px] leading-snug ${selected ? "text-[var(--brand-orange-strong)]/80" : "text-[var(--ink)]/55"
                      }`}
                  >
                    {type.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-start">
          <Button
            type="button"
            onClick={handleContinue}
            loading={connectAdsMutation.isPending}
            className="w-full min-w-0 sm:w-auto sm:min-w-[180px]"
          >
            Continue
          </Button>
        </div>
      </div>
  );
}