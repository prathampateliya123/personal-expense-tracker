/**
 * components/auth/AuthCard.jsx
 * Shared card wrapper for auth form pages.
 */

const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="card p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-textSecondary">{subtitle}</p>
        )}
      </div>
      {children}
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
};

export const authInputClass =
  "fintech-input";

export const authButtonClass =
  "btn-primary w-full";

export const authLinkClass =
  "font-medium text-accentGreen transition hover:text-primaryMid";

export default AuthCard;
