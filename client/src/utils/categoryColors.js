export const CATEGORY_COLOR_OPTIONS = [
  {
    key: "amber",
    label: "Amber",
    chip: "bg-[#FFF1A8] text-primaryDark",
    avatar: "bg-[#FFF1A8] text-primaryDark",
    swatch: "bg-[#FFF1A8]",
  },
  {
    key: "sky",
    label: "Sky",
    chip: "bg-[#B0E0E6] text-primaryDark",
    avatar: "bg-[#B0E0E6] text-primaryDark",
    swatch: "bg-[#B0E0E6]",
  },
  {
    key: "violet",
    label: "Violet",
    chip: "bg-[#D3C3FC] text-primaryDark",
    avatar: "bg-[#D3C3FC] text-primaryDark",
    swatch: "bg-[#D3C3FC]",
  },
  {
    key: "rose",
    label: "Rose",
    chip: "bg-[#FFC1CC] text-primaryDark",
    avatar: "bg-[#FFC1CC] text-primaryDark",
    swatch: "bg-[#FFC1CC]",
  },
  {
    key: "pink",
    label: "Pink",
    chip: "bg-[#FFC1CC] text-primaryDark",
    avatar: "bg-[#FFC1CC] text-primaryDark",
    swatch: "bg-[#FFC1CC]",
  },
  {
    key: "emerald",
    label: "Emerald",
    chip: "bg-[#D4FF37] text-primaryDark",
    avatar: "bg-[#D4FF37] text-primaryDark",
    swatch: "bg-[#D4FF37]",
  },
  {
    key: "indigo",
    label: "Indigo",
    chip: "bg-[#D3C3FC] text-primaryDark",
    avatar: "bg-[#D3C3FC] text-primaryDark",
    swatch: "bg-[#D3C3FC]",
  },
  {
    key: "orange",
    label: "Orange",
    chip: "bg-[#FFF1A8] text-primaryDark",
    avatar: "bg-[#FFF1A8] text-primaryDark",
    swatch: "bg-[#FFF1A8]",
  },
  {
    key: "slate",
    label: "Slate",
    chip: "bg-[#E8E2D4] text-primaryDark",
    avatar: "bg-[#E8E2D4] text-primaryDark",
    swatch: "bg-[#C9C2B0]",
  },
  {
    key: "blue",
    label: "Blue",
    chip: "bg-[#B0E0E6] text-primaryDark",
    avatar: "bg-[#B0E0E6] text-primaryDark",
    swatch: "bg-[#B0E0E6]",
  },
  {
    key: "teal",
    label: "Teal",
    chip: "bg-[#B0E0E6] text-primaryDark",
    avatar: "bg-[#B0E0E6] text-primaryDark",
    swatch: "bg-[#B0E0E6]",
  },
  {
    key: "lime",
    label: "Lime",
    chip: "bg-[#D4FF37] text-primaryDark",
    avatar: "bg-[#D4FF37] text-primaryDark",
    swatch: "bg-[#D4FF37]",
  },
];

const byKey = Object.fromEntries(
  CATEGORY_COLOR_OPTIONS.map((opt) => [opt.key, opt])
);

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

export const buildCategoryColorMap = (categories = []) =>
  Object.fromEntries(categories.map((c) => [c.name, c.color]));
