/**
 * components/AuthCard.jsx
 * Shared card wrapper for auth form pages.
 */

const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-auth">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
};

export const authInputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15";

export const authButtonClass =
  "w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600/30 disabled:cursor-not-allowed disabled:opacity-60";

export const authLinkClass = "font-medium text-brand-600 hover:text-brand-700";

export default AuthCard;
