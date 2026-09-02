import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorXCircleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import { AUTH_PROVIDER_NAME, REFRESH_TOKEN_NAME, setCookie, TOKEN_NAME, USER_ID_NAME } from "../../utils/cookie";

const LOGIN_PATH = '/sign-in';
const DASHBOARD_PATH = '/';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);
  const [status, setStatus] = useState(() =>
    searchParams.get('token')?.trim() ? 'loading' : 'error'
  );

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get('token')?.trim() || '';
    const refreshToken = searchParams.get('refreshToken')?.trim() || '';
    const userId = searchParams.get('userId')?.trim() || '';
    const provider = searchParams.get('provider')?.trim() || '';

    if (!token) {
      return;
    }

    try {
      setCookie(TOKEN_NAME, token);

      if (refreshToken) {
        setCookie(REFRESH_TOKEN_NAME, refreshToken);
      }

      if (userId) {
        setCookie(USER_ID_NAME, userId);
      }

      if (provider) {
        setCookie(AUTH_PROVIDER_NAME, provider);
      }

      const cleanPath = window.location.pathname.includes('/auth/callback')
        ? '/auth/callback'
        : '/auth-success';
      window.history.replaceState({}, document.title, cleanPath);

      navigate(DASHBOARD_PATH, { replace: true });
    } catch {
      Promise.resolve().then(() => setStatus('error'));
    }
  }, [navigate, searchParams]);

  if (status === 'error') {
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
            Unable to complete sign in.
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
          Completing Sign In...
        </h1>
        <p className="text-[var(--ink)]/70 text-[14px]">
          Please wait while we securely log you in.
        </p>
      </div>
    </div>
  );
}