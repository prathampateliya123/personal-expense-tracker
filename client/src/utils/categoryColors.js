/**
 * utils/categoryColors.js
 * Color tokens for category chips / avatars.
 */

export const CATEGORY_COLOR_OPTIONS = [
  { key: "amber", label: "Amber", chip: "bg-amber-50 text-amber-700", avatar: "bg-amber-100 text-amber-700", swatch: "bg-amber-400" },
  { key: "sky", label: "Sky", chip: "bg-sky-50 text-sky-700", avatar: "bg-sky-100 text-sky-700", swatch: "bg-sky-400" },
  { key: "violet", label: "Violet", chip: "bg-violet-50 text-violet-700", avatar: "bg-violet-100 text-violet-700", swatch: "bg-violet-400" },
  { key: "rose", label: "Rose", chip: "bg-rose-50 text-rose-700", avatar: "bg-rose-100 text-rose-700", swatch: "bg-rose-400" },
  { key: "pink", label: "Pink", chip: "bg-pink-50 text-pink-700", avatar: "bg-pink-100 text-pink-700", swatch: "bg-pink-400" },
  { key: "emerald", label: "Emerald", chip: "bg-emerald-50 text-emerald-700", avatar: "bg-emerald-100 text-emerald-700", swatch: "bg-emerald-400" },
  { key: "indigo", label: "Indigo", chip: "bg-indigo-50 text-indigo-700", avatar: "bg-indigo-100 text-indigo-700", swatch: "bg-indigo-400" },
  { key: "orange", label: "Orange", chip: "bg-orange-50 text-orange-700", avatar: "bg-orange-100 text-orange-700", swatch: "bg-orange-400" },
  { key: "slate", label: "Slate", chip: "bg-slate-100 text-slate-700", avatar: "bg-slate-200 text-slate-700", swatch: "bg-slate-400" },
  { key: "blue", label: "Blue", chip: "bg-blue-50 text-blue-700", avatar: "bg-blue-100 text-blue-700", swatch: "bg-blue-400" },
  { key: "teal", label: "Teal", chip: "bg-teal-50 text-teal-700", avatar: "bg-teal-100 text-teal-700", swatch: "bg-teal-400" },
  { key: "lime", label: "Lime", chip: "bg-lime-50 text-lime-700", avatar: "bg-lime-100 text-lime-700", swatch: "bg-lime-400" },
];

const byKey = Object.fromEntries(
  CATEGORY_COLOR_OPTIONS.map((opt) => [opt.key, opt])
);

/** Fallback map for legacy hardcoded category names */
const LEGACY_NAME_COLORS = {
  Food: "amber",
  Travel: "sky",
  Shopping: "violet",
  Bills: "rose",
  Entertainment: "pink",
  Health: "emerald",
  Education: "indigo",
  Rent: "orange",
  Other: "slate",
};

export const getCategoryColorMeta = (colorOrName) => {
  if (byKey[colorOrName]) return byKey[colorOrName];
  const legacy = LEGACY_NAME_COLORS[colorOrName];
  if (legacy && byKey[legacy]) return byKey[legacy];
  return byKey.slate;
};

export const getCategoryChipClass = (category) => {
  const color =
    typeof category === "object" && category?.color
      ? category.color
      : typeof category === "string"
        ? category
        : "slate";
  return getCategoryColorMeta(color).chip;
};

export const getCategoryAvatarClass = (category) => {
  const color =
    typeof category === "object" && category?.color
      ? category.color
      : typeof category === "string"
        ? category
        : "slate";
  return getCategoryColorMeta(color).avatar;
};

/**
 * Build a name → color lookup from API categories for table chips.
 */
export const buildCategoryColorMap = (categories = []) =>
  Object.fromEntries(categories.map((c) => [c.name, c.color]));
