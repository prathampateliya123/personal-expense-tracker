import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import { AUTH_COOKIE_KEY, getCookie } from "../utils/cookie";

export default function NotFound() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getCookie(AUTH_COOKIE_KEY));
  const homePath = isLoggedIn ? '/' : '/sign-in';

  return (
    <AuthLayout brandHref={homePath}>
      <div className="text-center py-2 sm:py-4">
        <p className="text-[56px] sm:text-[72px] font-semibold leading-none text-[var(--brand-orange)]">
          404
        </p>
        <h1 className="mt-4 text-[22px] sm:text-[28px] font-semibold text-[var(--ink)] leading-tight">
          Page not found
        </h1>
        <p className="mt-2 text-[14px] text-[var(--ink-muted)] leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Button
          type="button"
          onClick={() => navigate(homePath)}
          className="mt-6 h-[46px] px-5 text-[15px]"
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Go to Sign In'}
        </Button>
      </div>
    </AuthLayout>
  );
}