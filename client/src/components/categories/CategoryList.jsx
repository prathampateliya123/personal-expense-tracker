import Select from "../ui/Select";
import TableSearch from "../table/TableSearch";
import TablePager, { TableLimit } from "../table/TablePager";
import NoDataFound from "../ui/NoDataFound";
import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import {
  getCategoryAvatarClass,
  getCategoryChipClass,
  getCategoryColorMeta,
} from "../../utils/categoryColors";

const CategoryList = ({
  categories,
  loading,
  searchInput,
  onSearchChange,
  filters,
  colorFilterOptions,
  hasActiveFilters,
  onApplyFilter,
  onClear,
  usageLabel,
  usageWord,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalCount,
  pagerDisabled,
  onPageChange,
}) => (
  <div className="table-panel w-full overflow-hidden">
    <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="table-toolbar">
        <div className="table-toolbar__row">
          <div className="table-toolbar__search">
            <div className="table-toolbar__search-field">
              <TableSearch
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search categories..."
              />
            </div>
          </div>

          <div className="table-toolbar__controls">
            <div className="table-toolbar__control-row">
              <div className="table-toolbar__tools-wrap">
                <div className="table-toolbar__tools table-toolbar__controls-start">
                  <Select
                    id="filter-category-color"
                    value={filters.color}
                    onChange={(e) => onApplyFilter({ color: e.target.value })}
                    placeholder="Color"
                    options={colorFilterOptions}
                    size="sm"
                    className="table-toolbar__type"
                  />

                  <TableLimit
                    value={filters.limit}
                    onChange={(limit) => onApplyFilter({ limit })}
                  />

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={onClear}
                      className="shrink-0 text-sm font-medium text-accentGreen hover:text-primaryMid"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {loading && categories.length === 0 ? (
      <div className="space-y-3 p-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surfaceGray"
          />
        ))}
      </div>
    ) : categories.length === 0 ? (
      <NoDataFound />
    ) : (
      <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Color</th>
                <th className="px-5 py-3">{usageLabel}</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="border-b border-border last:border-0 hover:bg-surfaceLight/70"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(category)}`}
                      >
                        {category.name?.[0] || "?"}
                      </div>
                      <p className="font-semibold text-textPrimary">
                        {category.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`category-chip ${getCategoryChipClass(category)}`}
                    >
                      {getCategoryColorMeta(category.color).label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-textSecondary">
                    {category.usageCount ?? category.expenseCount ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
                        aria-label={`Edit ${category.name}`}
                      >
                        <PencilSquareIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete ${category.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(category)}`}
              >
                {category.name?.[0] || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-textPrimary">
                  {category.name}
                </p>
                <p className="text-xs text-textSecondary">
                  {category.usageCount ?? category.expenseCount ?? 0}{" "}
                  {usageWord}
                  {(category.usageCount ?? category.expenseCount ?? 0) === 1
                    ? ""
                    : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                aria-label={`Edit ${category.name}`}
              >
                <PencilSquareIcon />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary"
                aria-label={`Delete ${category.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </>
    )}

    <TablePager
      page={currentPage}
      totalPages={totalPages}
      totalRecords={totalCount}
      pageSize={filters.limit}
      entityName="categories"
      disabled={pagerDisabled}
      onPageChange={onPageChange}
    />
  </div>
);

export default CategoryList;
