import { AmazonIcon } from "./Icons";

export default function SocialAuthButtons({
  onAmazonClick,
  amazonLoading = false,
  disabled = false
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onAmazonClick}
        disabled={disabled}
        className="mb-1 sm:mb-2 flex h-[46px] sm:h-[50px] w-full items-center justify-center gap-2.5 sm:gap-3 rounded-[7px] border border-[var(--ink)]/20 bg-[var(--surface)] text-[14px] sm:text-[15px] font-semibold text-[var(--ink)] transition-all hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {amazonLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-[var(--ink)]/20 border-t-[var(--ink)]" />
        ) : (
          <>
            <AmazonIcon />
            Login with Amazon
          </>
        )}
      </button>
    </div>
  );
}
