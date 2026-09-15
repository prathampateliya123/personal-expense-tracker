const fs = require("fs");
const path =
  "C:/Users/prath/Documents/GitHub/personal-expense-tracker/client/src/components/transactions/TransactionTable.jsx";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  `import {
  formatCurrency,
  formatExpenseDate,
} from "../../utils/expenseConstants";
import {
  getCategoryAvatarClass,
  getCategoryChipClass,
  buildCategoryColorMap,
} from "../../utils/categoryColors";
import { INITIAL_EXPENSE_FILTERS } from "../../services/expenseService";`,
  `import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  getCategoryAvatarClass,
  getCategoryChipClass,
  buildCategoryColorMap,
} from "../../utils/categoryColors";
import { INITIAL_TRANSACTION_FILTERS } from "../../services/buildTransactionQuery";`
);

s = s.replace(
  `const COLUMNS = ["Expense", "Category", "Payment", "Date", "Amount", ""];

const ExpenseAvatar = ({ category, colorMap }) => (`,
  `const TransactionAvatar = ({ category, colorMap }) => (`
);

s = s.replace(/ExpenseAvatar/g, "TransactionAvatar");
s = s.replace(/formatExpenseDate/g, "formatDate");
s = s.replace(/INITIAL_EXPENSE_FILTERS/g, "INITIAL_TRANSACTION_FILTERS");

s = s.replace(
  `const ActionButtons = ({ expense, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <Link
      to={\`/expenses/\${expense._id}/edit\`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
      aria-label={\`Edit \${expense.title}\`}
      title="Edit"
    >
      <PencilSquareIcon />
    </Link>
    <button
      type="button"
      onClick={() => onDelete(expense)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      aria-label={\`Delete \${expense.title}\`}
      title="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);`,
  `const ActionButtons = ({ item, onDelete, editBasePath }) => (
  <div className="flex items-center justify-end gap-1.5">
    <Link
      to={\`\${editBasePath}/\${item._id}/edit\`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
      aria-label={\`Edit \${item.title}\`}
      title="Edit"
    >
      <PencilSquareIcon />
    </Link>
    <button
      type="button"
      onClick={() => onDelete(item)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      aria-label={\`Delete \${item.title}\`}
      title="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);`
);

s = s.replace(
  `const ExpenseRow = ({ expense, onDelete, colorMap }) => (
  <tr className="group border-b border-border transition last:border-0 hover:bg-surfaceLight/70">
    <td className="px-5 py-4">
      <div className="flex min-w-[220px] items-center gap-3">
        <TransactionAvatar category={expense.category} colorMap={colorMap} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-textPrimary" title={expense.title}>
            {expense.title}
          </p>
          {expense.description ? (
            <p className="mt-0.5 truncate text-xs text-textSecondary" title={expense.description}>
              {expense.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-textSecondary">{expense.paymentMode}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <span
        className={\`inline-flex rounded-full px-2.5 py-1 text-xs font-medium \${getCategoryChipClass(
          colorMap?.[expense.category] || expense.category
        )}\`}
      >
        {expense.category}
      </span>
    </td>
    <td className="hidden px-5 py-4 sm:table-cell">
      <PaymentBadge mode={expense.paymentMode} />
    </td>
    <td className="px-5 py-4 text-sm text-textSecondary">
      {formatDate(expense.date)}
    </td>
    <td className="px-5 py-4 text-right font-semibold text-textPrimary">
      <span className="text-primaryDark">
        {formatCurrency(expense.amount)}
      </span>
    </td>
    <td className="px-5 py-4">
      <ActionButtons expense={expense} onDelete={onDelete} />
    </td>
  </tr>
);`,
  `const TransactionRow = ({ item, onDelete, colorMap, editBasePath }) => (
  <tr className="group border-b border-border transition last:border-0 hover:bg-surfaceLight/70">
    <td className="px-5 py-4">
      <div className="flex min-w-[220px] items-center gap-3">
        <TransactionAvatar category={item.category} colorMap={colorMap} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-textPrimary" title={item.title}>
            {item.title}
          </p>
          {item.description ? (
            <p className="mt-0.5 truncate text-xs text-textSecondary" title={item.description}>
              {item.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-textSecondary">{item.paymentMode}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <span
        className={\`inline-flex rounded-full px-2.5 py-1 text-xs font-medium \${getCategoryChipClass(
          colorMap?.[item.category] || item.category
        )}\`}
      >
        {item.category}
      </span>
    </td>
    <td className="hidden px-5 py-4 sm:table-cell">
      <PaymentBadge mode={item.paymentMode} />
    </td>
    <td className="px-5 py-4 text-sm text-textSecondary">
      {formatDate(item.date)}
    </td>
    <td className="px-5 py-4 text-right font-semibold text-textPrimary">
      <span className="text-primaryDark">
        {formatCurrency(item.amount)}
      </span>
    </td>
    <td className="px-5 py-4">
      <ActionButtons item={item} onDelete={onDelete} editBasePath={editBasePath} />
    </td>
  </tr>
);`
);

// If the first ExpenseRow replace failed due to whitespace, do broader replace
if (s.includes("const ExpenseRow")) {
  s = s.replace(/const ExpenseRow =/g, "const TransactionRow =");
  s = s.replace(/\{ expense, onDelete, colorMap \}/g, "{ item, onDelete, colorMap, editBasePath }");
  s = s.replace(/expense\./g, "item.");
  s = s.replace(/\{expense\}/g, "{item}");
  s = s.replace(/expense=/g, "item=");
  s = s.replace(/ActionButtons expense=/g, "ActionButtons item=");
  // Fix accidental over-replacement in comments/strings - check categoryKeys
}

s = s.replace(/ExpenseMobileCard/g, "TransactionMobileCard");
s = s.replace(/const ExpenseTable = \(\{/g, "const TransactionTable = ({");
s = s.replace(
  `  filters,
  onFiltersChange,
  expenses,
  loading,`,
  `  filters,
  onFiltersChange,
  items,
  loading,
  categoryType = "expense",
  editBasePath = "/expenses",
  columnLabel = "Expense",
  entityName = "expenses",
  deleteTitle = "Delete expense?",`
);

s = s.replace(
  `queryKey: categoryKeys.options("expense"),
    queryFn: async () => {
      const data = await categoryService.options("expense");`,
  `queryKey: categoryKeys.options(categoryType),
    queryFn: async () => {
      const data = await categoryService.options(categoryType);`
);

s = s.replace(/expenses\.length/g, "items.length");
s = s.replace(/expenses\.map/g, "items.map");
s = s.replace(
  /\{expenses\.map\(\(expense\) => \(/g,
  "{items.map((item) => ("
);
s = s.replace(/key=\{expense\._id\}/g, "key={item._id}");
s = s.replace(/expense=\{expense\}/g, "item={item}");
s = s.replace(
  /<ExpenseRow/g,
  "<TransactionRow"
);
s = s.replace(
  /<TransactionRow([\s\S]*?)expense=/g,
  "<TransactionRow$1item="
);

s = s.replace(/entityName="expenses"/g, "entityName={entityName}");
s = s.replace(
  `title="Delete expense?"`,
  `title={deleteTitle}`
);
s = s.replace(
  `export default ExpenseTable;`,
  `export default TransactionTable;`
);

// Fix COLUMNS usage - need to make columns dynamic
if (!s.includes("columnLabel")) {
  // already in props
}
s = s.replace(
  /COLUMNS\.map/g,
  "[columnLabel, \"Category\", \"Payment\", \"Date\", \"Amount\", \"\"].map"
);

// Fix ActionButtons still using expense if any remain in TransactionRow after partial replace
s = s.replace(
  /<ActionButtons item=\{item\} onDelete=\{onDelete\} \/>/g,
  "<ActionButtons item={item} onDelete={onDelete} editBasePath={editBasePath} />"
);
s = s.replace(
  /<TransactionRow([\s\S]*?)onDelete=\{onDelete\}([\s\S]*?)colorMap=\{colorMap\}/g,
  "<TransactionRow$1onDelete={onDelete}$2colorMap={colorMap} editBasePath={editBasePath}"
);

// Fix over-replacement: categoryType might have become item if we replaced expense. - shouldn't
// Fix handleDeleteClick parameter names
s = s.replace(/handleDeleteClick = \(expense\)/g, "handleDeleteClick = (item)");
s = s.replace(/setDeleteTarget\(expense\)/g, "setDeleteTarget(item)");

fs.writeFileSync(path, s);
console.log("TransactionTable transformed, length", s.length);
console.log("has ExpenseTable", s.includes("ExpenseTable"));
console.log("has expenses prop", /expenses,/.test(s));
console.log("has item.", s.includes("item."));
console.log("has expense.", s.includes("expense."));
