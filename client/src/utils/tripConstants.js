export const TRIP_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "settled", label: "Settled" },
  { value: "archived", label: "Archived" },
];

export const TRIP_EXPENSE_CATEGORIES = [
  { value: "Food", label: "Food" },
  { value: "Hotel", label: "Hotel" },
  { value: "Transport", label: "Transport" },
  { value: "Other", label: "Other" },
];

export const getTripStatusLabel = (status) =>
  TRIP_STATUSES.find((s) => s.value === status)?.label || status;

export const tripStatusBadgeClass = (status) => {
  if (status === "active") return "bg-successBg text-successText";
  if (status === "planning") return "bg-sky-50 text-sky-700";
  if (status === "settled") return "bg-surfaceGray text-textSecondary";
  return "bg-amber-50 text-amber-700";
};

export const emptyTripForm = () => ({
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  status: "active",
  notes: "",
  members: [
    { name: "Me", isSelf: true },
    { name: "", isSelf: false },
  ],
});

export const tripToForm = (trip) => ({
  title: trip.title || "",
  destination: trip.destination || "",
  startDate: trip.startDate
    ? new Date(trip.startDate).toISOString().split("T")[0]
    : "",
  endDate: trip.endDate
    ? new Date(trip.endDate).toISOString().split("T")[0]
    : "",
  status: trip.status || "active",
  notes: trip.notes || "",
  members: (trip.members || []).map((m) => ({
    _id: m._id,
    name: m.name || "",
    isSelf: Boolean(m.isSelf),
  })),
});

export const emptyTripExpenseForm = (members = []) => {
  const ids = members.map((m) => String(m._id));
  const self = members.find((m) => m.isSelf) || members[0];
  return {
    title: "",
    amount: "",
    category: "Food",
    paidBy: self ? String(self._id) : "",
    splitAmong: ids,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  };
};

export const memberNameById = (members = [], id) =>
  members.find((m) => String(m._id) === String(id))?.name || "Unknown";
