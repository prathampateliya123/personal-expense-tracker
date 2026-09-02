import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  CHART_COLORS,
  formatCurrency,
  formatCpc,
  formatPercent,
  resolveCurrencyCode
} from "../../utils/dashboard";

export function KPICard({ title, value, change, changeTone = "neutral", subtext, alert = false }) {
  const changeColor =
    changeTone === "positive"
      ? "text-green-600"
      : changeTone === "negative"
        ? "text-red-600"
        : "text-[var(--ink-muted)]";

  return (
    <div
      className={`flex min-h-[84px] flex-col justify-between rounded-lg border bg-[var(--surface)] p-2.5 sm:min-h-[108px] sm:rounded-xl sm:p-4 ${
        alert ? "border-red-300 bg-red-50/40" : "border-[var(--border)]"
      }`}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-[var(--ink-muted)] sm:mb-2 sm:text-[11.5px] sm:tracking-wider">
        {title}
      </div>
      <div className="mb-0.5 text-lg font-bold tracking-tight text-[var(--ink)] sm:mb-1 sm:text-2xl">{value}</div>
      {change ? (
        <div className={`mb-0.5 text-[10px] font-semibold sm:mb-1 sm:text-xs ${changeColor}`}>{change}</div>
      ) : null}
      {subtext ? (
        <div className="truncate text-[9.5px] font-normal text-[var(--ink-muted)] sm:text-[10.5px]">{subtext}</div>
      ) : null}
    </div>
  );
}

export function ChartCard({ title, desc, children, className = "" }) {
  return (
    <div
      className={`flex h-[280px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:h-[320px] sm:rounded-xl sm:p-5 lg:h-[340px] ${className}`}
    >
      <div className="mb-0.5 text-[13px] font-bold tracking-tight text-[var(--ink)] sm:text-[14px]">{title}</div>
      {desc ? (
        <div className="mb-2 text-[11px] leading-snug text-[var(--ink-muted)] sm:mb-3 sm:text-[12px]">{desc}</div>
      ) : null}
      <div className="relative min-h-0 flex-1 overflow-visible">{children}</div>
    </div>
  );
}

export function ChartEmpty({ message = "No chart data" }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-[13px] text-[var(--ink-muted)]">
      {message}
    </div>
  );
}

export function ChartLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--brand-orange)] border-t-transparent animate-spin" />
    </div>
  );
}

function CustomTooltip({ active, payload, label, currencyCode = "INR" }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const title = point?.formattedDate || point?.report_date || point?.period || label;
  const code = resolveCurrencyCode(currencyCode);

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-[0_8px_24px_rgba(26,29,35,0.12)]">
      <p className="mb-1.5 text-[12.5px] font-semibold text-[var(--ink)]">{title}</p>
      {payload.map((entry, index) => {
        const name = String(entry.name || "");
        let display = entry.value;
        if (/surplus|spend|sales|waste|profit/i.test(name)) {
          display = formatCurrency(entry.value, code);
        } else if (/acos|cvr|ctr/i.test(name)) display = formatPercent(entry.value);
        else if (/cpc/i.test(name)) display = formatCpc(entry.value, code);

        return (
          <div key={`${name}-${index}`} className="flex items-center gap-2 text-[12.5px]">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--ink-muted)]">{name}:</span>
            <span className="font-medium text-[var(--ink)]">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

const CHART_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 900,
  animationEasing: "ease-out"
};

const CHART_MARGIN = { top: 8, right: 8, left: 4, bottom: 0 };
const MONEY_Y_AXIS_WIDTH = 72;
const METRIC_Y_AXIS_WIDTH = 52;

const axisTick = { fontSize: 11, fill: "var(--ink-muted)" };

function moneyYAxisProps(currencyCode, values, options = {}) {
  const code = resolveCurrencyCode(currencyCode);
  return {
    tick: axisTick,
    width: MONEY_Y_AXIS_WIDTH,
    axisLine: false,
    tickLine: false,
    tickMargin: 6,
    tickFormatter: (val) => compactMoney(val, code),
    domain: yDomain(values, options)
  };
}

function metricYAxisProps(values, tickFormatter, options = {}) {
  return {
    tick: axisTick,
    width: options.width ?? METRIC_Y_AXIS_WIDTH,
    axisLine: false,
    tickLine: false,
    tickMargin: 6,
    tickFormatter,
    domain: yDomain(values, options)
  };
}

function chartMountKey(animationKey, data = []) {
  if (animationKey != null && animationKey !== "") return String(animationKey);
  if (!data?.length) return "empty";
  const first = data[0]?.period || data[0]?.report_date || "start";
  const last = data[data.length - 1]?.period || data[data.length - 1]?.report_date || "end";
  return `${data.length}-${first}-${last}`;
}

function compactMoney(val, currencyCode = "INR") {
  const n = Number(val);
  if (!Number.isFinite(n)) return "";
  const code = resolveCurrencyCode(currencyCode);
  const abs = Math.abs(n);
  let body = "";
  if (abs >= 1_000_000) body = `${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) body = `${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  else body = `${Math.round(abs)}`;
  return `${n < 0 ? "-" : ""}${body} ${code}`;
}

function pointRadius(length) {
  if (length <= 1) return 5;
  if (length <= 14) return 3;
  if (length <= 40) return 2;
  return 0;
}

function yDomain(values, { padRatio = 0.12, hardZero = false } = {}) {
  const nums = values.map(Number).filter((n) => Number.isFinite(n));
  if (!nums.length) return ["auto", "auto"];
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.25, 1);
    min -= pad;
    max += pad;
  } else {
    const pad = (max - min) * padRatio;
    min -= pad;
    max += pad;
  }
  if (hardZero && min > 0) min = 0;
  return [min, max];
}

const timeXAxisProps = {
  dataKey: "period",
  tick: axisTick,
  tickMargin: 8,
  minTickGap: 20,
  axisLine: false,
  tickLine: false,
  allowDuplicatedCategory: true,
  tickFormatter: (value) => {
    if (!value) return "";
    const raw = String(value);
    const d = new Date(/^\d{4}-\d{2}-\d{2}/.test(raw) ? `${raw.slice(0, 10)}T00:00:00` : raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

function TrendAreaChart({
  data,
  loading,
  dataKey,
  name,
  color,
  fillColor,
  yFormatter,
  showZeroLine = false,
  hardZero = false,
  currencyCode = "INR",
  animationKey,
  yAxisWidth = METRIC_Y_AXIS_WIDTH
}) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const values = data.map((row) => row[dataKey]);
  const r = pointRadius(data.length);
  const code = resolveCurrencyCode(currencyCode);
  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart key={mountKey} data={data} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.55} />
        <XAxis {...timeXAxisProps} />
        <YAxis {...metricYAxisProps(values, yFormatter, { hardZero, width: yAxisWidth })} />
        <Tooltip content={<CustomTooltip currencyCode={code} />} />
        {showZeroLine ? (
          <ReferenceLine y={0} stroke="var(--ink-muted)" strokeDasharray="4 4" strokeOpacity={0.7} />
        ) : null}
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2.4}
          fill={fillColor || `url(#fill-${dataKey})`}
          dot={r > 0 ? { r, strokeWidth: 0, fill: color } : false}
          activeDot={{ r: Math.max(r, 4) + 1, strokeWidth: 0, fill: color }}
          connectNulls
          {...CHART_ANIMATION}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SurplusChart({ data, loading, currencyCode = "INR", animationKey }) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const values = data.map((row) => row.ad_surplus);
  const r = pointRadius(data.length);
  const code = resolveCurrencyCode(currencyCode);
  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart key={mountKey} data={data} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id="fill-surplus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.pos} stopOpacity={0.2} />
            <stop offset="100%" stopColor={CHART_COLORS.pos} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.55} />
        <XAxis {...timeXAxisProps} />
        <YAxis {...moneyYAxisProps(code, values)} />
        <Tooltip content={<CustomTooltip currencyCode={code} />} />
        <ReferenceLine y={0} stroke="var(--ink-muted)" strokeDasharray="4 4" strokeOpacity={0.7} />
        <Area
          type="monotone"
          dataKey="ad_surplus"
          name="Ad Surplus"
          stroke={CHART_COLORS.pos}
          strokeWidth={2.4}
          fill="url(#fill-surplus)"
          dot={r > 0 ? { r, strokeWidth: 0, fill: CHART_COLORS.pos } : false}
          activeDot={{ r: Math.max(r, 4) + 1, strokeWidth: 0, fill: CHART_COLORS.pos }}
          connectNulls
          {...CHART_ANIMATION}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendSalesChart({ data, loading, currencyCode = "INR", animationKey }) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const values = data.flatMap((row) => [row.spend, row.sales]);
  const r = pointRadius(data.length);
  const code = resolveCurrencyCode(currencyCode);
  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart key={mountKey} data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.55} />
        <XAxis {...timeXAxisProps} />
        <YAxis {...moneyYAxisProps(code, values, { hardZero: true })} />
        <Tooltip content={<CustomTooltip currencyCode={code} />} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingBottom: 4, color: "var(--ink-muted)" }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke={CHART_COLORS.sales}
          strokeWidth={2.4}
          dot={r > 0 ? { r, strokeWidth: 0, fill: CHART_COLORS.sales } : false}
          activeDot={{ r: Math.max(r, 4) + 1, strokeWidth: 0, fill: CHART_COLORS.sales }}
          connectNulls
          {...CHART_ANIMATION}
        />
        <Line
          type="monotone"
          dataKey="spend"
          name="Spend"
          stroke={CHART_COLORS.spendHex}
          strokeWidth={2.4}
          dot={r > 0 ? { r, strokeWidth: 0, fill: CHART_COLORS.spendHex } : false}
          activeDot={{ r: Math.max(r, 4) + 1, strokeWidth: 0, fill: CHART_COLORS.spendHex }}
          connectNulls
          {...CHART_ANIMATION}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AcosChart({ data, loading, animationKey }) {
  return (
    <TrendAreaChart
      data={data}
      loading={loading}
      dataKey="acos"
      name="ACoS %"
      color={CHART_COLORS.acos}
      yFormatter={(val) => `${Number(val).toFixed(0)}%`}
      hardZero
      animationKey={animationKey}
    />
  );
}

export function WastedSpendChart({ data, loading, currencyCode = "INR", animationKey }) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const values = data.map((row) => row.wasted_spend);
  const code = resolveCurrencyCode(currencyCode);
  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart key={mountKey} data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.55} />
        <XAxis {...timeXAxisProps} />
        <YAxis {...moneyYAxisProps(code, values, { hardZero: true })} />
        <Tooltip content={<CustomTooltip currencyCode={code} />} cursor={{ fill: "var(--ink)", opacity: 0.04 }} />
        <Bar
          dataKey="wasted_spend"
          name="Wasted Spend"
          fill="rgba(239,68,68,0.72)"
          radius={[3, 3, 0, 0]}
          maxBarSize={data.length <= 14 ? 28 : 12}
          {...CHART_ANIMATION}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CpcChart({ data, loading, currencyCode = "INR", animationKey }) {
  const code = resolveCurrencyCode(currencyCode);
  return (
    <TrendAreaChart
      data={data}
      loading={loading}
      dataKey="cpc"
      name="CPC"
      color={CHART_COLORS.spendHex}
      yFormatter={(val) => `${Number(val).toFixed(2)} ${code}`}
      hardZero
      currencyCode={code}
      yAxisWidth={MONEY_Y_AXIS_WIDTH}
      animationKey={animationKey}
    />
  );
}

export function CvrChart({ data, loading, animationKey }) {
  return (
    <TrendAreaChart
      data={data}
      loading={loading}
      dataKey="cvr"
      name="CVR %"
      color={CHART_COLORS.sales}
      yFormatter={(val) => `${Number(val).toFixed(1)}%`}
      hardZero
      animationKey={animationKey}
    />
  );
}

export function CategoryBarChart({
  data,
  dataKey,
  name,
  color = CHART_COLORS.acos,
  labelKey = "label",
  loading,
  animationKey
}) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart key={mountKey} data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.55} />
        <XAxis dataKey={labelKey} tick={axisTick} tickMargin={8} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={axisTick} width={METRIC_Y_AXIS_WIDTH} axisLine={false} tickLine={false} tickMargin={6} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--ink)", opacity: 0.04 }} />
        <Bar dataKey={dataKey} name={name} radius={[3, 3, 0, 0]} maxBarSize={42} {...CHART_ANIMATION}>
          {data.map((entry, index) => (
            <Cell
              key={`${entry[labelKey]}-${index}`}
              fill={Array.isArray(color) ? color[index % color.length] : color}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SpendDonutChart({ data, loading, labelKey = "label", valueKey = "spend", animationKey }) {
  if (loading) return <ChartLoading />;
  if (!data?.length) return <ChartEmpty />;

  const mountKey = chartMountKey(animationKey, data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart key={mountKey}>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={labelKey}
          innerRadius="48%"
          outerRadius="72%"
          paddingAngle={2}
          {...CHART_ANIMATION}
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry[labelKey]}-${index}`}
              fill={CHART_COLORS.placement[index % CHART_COLORS.placement.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, lineHeight: "14px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusBadge({ status }) {
  const map = {
    high: { label: "High Leak", className: "bg-red-100 text-red-700" },
    medium: { label: "Medium", className: "bg-amber-100 text-amber-800" },
    healthy: { label: "Healthy", className: "bg-green-100 text-green-700" }
  };
  const item = map[status] || map.healthy;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.className}`}
    >
      {item.label}
    </span>
  );
}

export function ActionBadge({ action }) {
  const map = {
    negate: { label: "Negate", className: "bg-red-100 text-red-700" },
    watch: { label: "Watch", className: "bg-amber-100 text-amber-800" },
    scale: { label: "Scale", className: "bg-green-100 text-green-700" }
  };
  const item = map[action] || map.watch;
  return (
    <span
      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.className}`}
    >
      {item.label}
    </span>
  );
}
