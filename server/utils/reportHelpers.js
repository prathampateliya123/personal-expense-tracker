export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const parseReportPeriod = (query = {}) => {
  const now = new Date();
  const type = String(query.period || "monthly").toLowerCase();
  const year = parseInt(query.year, 10) || now.getFullYear();
  const month = parseInt(query.month, 10) || now.getMonth() + 1;

  if (!["monthly", "yearly"].includes(type)) {
    return { error: "Period must be monthly or yearly" };
  }
  if (year < 2000 || year > 2100) {
    return { error: "Invalid year" };
  }
  if (type === "monthly" && (month < 1 || month > 12)) {
    return { error: "Invalid month" };
  }

  let start;
  let end;
  let label;

  if (type === "yearly") {
    start = new Date(year, 0, 1, 0, 0, 0, 0);
    end = new Date(year, 11, 31, 23, 59, 59, 999);
    label = `Year ${year}`;
  } else {
    start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    end = new Date(year, month, 0, 23, 59, 59, 999);
    label = `${MONTH_LABELS[month - 1]} ${year}`;
  }

  return { type, year, month: type === "monthly" ? month : null, start, end, label };
};

export const toLocalDateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const monthKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const buildSeriesBuckets = (period) => {
  if (period.type === "yearly") {
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${period.year}-${String(i + 1).padStart(2, "0")}`;
      return {
        key,
        label: MONTH_LABELS[i],
        income: 0,
        expense: 0,
      };
    });
  }

  const daysInMonth = new Date(period.year, period.month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const key = `${period.year}-${String(period.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
      key,
      label: String(day),
      income: 0,
      expense: 0,
    };
  });
};

export const aggregateByField = (rows, field) => {
  const map = new Map();
  for (const row of rows) {
    const key = row[field] || "Other";
    const amount = Number(row.amount) || 0;
    if (!map.has(key)) {
      map.set(key, { name: key, total: 0, count: 0 });
    }
    const bucket = map.get(key);
    bucket.total = round2(bucket.total + amount);
    bucket.count += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
};

export const withPercents = (items, total) =>
  items.map((item) => ({
    ...item,
    percent:
      total > 0 ? Math.round((item.total / total) * 1000) / 10 : 0,
  }));

export const escapeCsv = (value) => {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export const rowsToCsv = (headers, rows) => {
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(","));
  }
  return `${lines.join("\n")}\n`;
};
