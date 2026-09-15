export const normalizeName = (name = "") =>
  String(name).trim().replace(/\s+/g, " ");

export const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const toNameKey = (name = "") => normalizeName(name).toLowerCase();

export const findDuplicateByName = async (
  Model,
  { userId, name, excludeId = null, extraFilter = {} }
) => {
  const nameKey = toNameKey(name);
  if (!nameKey) return null;

  const filter = {
    userId,
    ...extraFilter,
    $or: [
      { nameKey },
      {
        name: {
          $regex: `^${escapeRegex(normalizeName(name))}$`,
          $options: "i",
        },
      },
    ],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Model.findOne(filter);
};
