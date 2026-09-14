/**
 * components/ui/NoDataFound.jsx
 * Minimal empty state — text only, no icons or supporting copy.
 */

const NoDataFound = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center px-6 py-16 text-center ${className}`.trim()}
  >
    <p className="text-sm font-medium text-textSecondary">No data found</p>
  </div>
);

export default NoDataFound;
