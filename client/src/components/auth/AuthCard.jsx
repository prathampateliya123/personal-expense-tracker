/**
 * components/AuthCard.jsx
 * Shared card wrapper for auth form pages.
 */

const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="card p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
        )}
      </div>
      {children}
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
};

export const authInputClass =
  "w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export const authButtonClass =
  "w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60";

export const authLinkClass =
  "font-medium text-brand-600 transition hover:text-brand-700";

export default AuthCard;
