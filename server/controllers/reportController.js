import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import {
  parseReportPeriod,
  toLocalDateKey,
  monthKey,
  buildSeriesBuckets,
  aggregateByField,
  withPercents,
  rowsToCsv,
  round2,
} from "../utils/reportHelpers.js";

const loadPeriodTransactions = async (userId, start, end) => {
  const match = { userId, date: { $gte: start, $lte: end } };
  const [expenses, incomes] = await Promise.all([
    Expense.find(match).sort({ date: 1 }).lean(),
    Income.find(match).sort({ date: 1 }).lean(),
  ]);
  return { expenses, incomes };
};

const buildReportPayload = (period, expenses, incomes) => {
  const totalExpense = round2(
    expenses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  );
  const totalIncome = round2(
    incomes.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  );
  const net = round2(totalIncome - totalExpense);
  const savingsRate =
    totalIncome > 0 ? Math.round((net / totalIncome) * 1000) / 10 : 0;

  const seriesMap = Object.fromEntries(
    buildSeriesBuckets(period).map((bucket) => [bucket.key, { ...bucket }])
  );

  for (const row of expenses) {
    const key =
      period.type === "yearly" ? monthKey(row.date) : toLocalDateKey(row.date);
    if (!key || !seriesMap[key]) continue;
    seriesMap[key].expense = round2(
      seriesMap[key].expense + (Number(row.amount) || 0)
    );
  }
  for (const row of incomes) {
    const key =
      period.type === "yearly" ? monthKey(row.date) : toLocalDateKey(row.date);
    if (!key || !seriesMap[key]) continue;
    seriesMap[key].income = round2(
      seriesMap[key].income + (Number(row.amount) || 0)
    );
  }

  const incomeVsExpense = Object.values(seriesMap).map((bucket) => ({
    ...bucket,
    net: round2(bucket.income - bucket.expense),
  }));

  const expenseByCategory = withPercents(
    aggregateByField(expenses, "category").map((r) => ({
      category: r.name,
      total: r.total,
      count: r.count,
    })),
    totalExpense
  );
  const incomeByCategory = withPercents(
    aggregateByField(incomes, "category").map((r) => ({
      category: r.name,
      total: r.total,
      count: r.count,
    })),
    totalIncome
  );

  const expenseByAccount = aggregateByField(expenses, "paymentMode");
  const incomeByAccount = aggregateByField(incomes, "paymentMode");
  const accountNames = new Set([
    ...expenseByAccount.map((r) => r.name),
    ...incomeByAccount.map((r) => r.name),
  ]);
  const expenseAccountMap = Object.fromEntries(
    expenseByAccount.map((r) => [r.name, r])
  );
  const incomeAccountMap = Object.fromEntries(
    incomeByAccount.map((r) => [r.name, r])
  );

  const byAccount = Array.from(accountNames)
    .map((name) => {
      const income = incomeAccountMap[name]?.total || 0;
      const expense = expenseAccountMap[name]?.total || 0;
      return {
        account: name,
        income,
        expense,
        net: round2(income - expense),
        incomeCount: incomeAccountMap[name]?.count || 0,
        expenseCount: expenseAccountMap[name]?.count || 0,
      };
    })
    .sort(
      (a, b) => b.income + b.expense - (a.income + a.expense)
    );

  return {
    period: {
      type: period.type,
      year: period.year,
      month: period.month,
      label: period.label,
      start: period.start,
      end: period.end,
    },
    summary: {
      totalIncome,
      totalExpense,
      net,
      savingsRate,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
    },
    incomeVsExpense,
    byCategory: {
      expense: expenseByCategory,
      income: incomeByCategory,
    },
    byAccount,
  };
};

export const getReportSummary = async (req, res, next) => {
  try {
    const period = parseReportPeriod(req.query);
    if (period.error) {
      res.status(400);
      throw new Error(period.error);
    }

    const { expenses, incomes } = await loadPeriodTransactions(
      req.user._id,
      period.start,
      period.end
    );

    res.status(200).json({
      success: true,
      report: buildReportPayload(period, expenses, incomes),
    });
  } catch (error) {
    next(error);
  }
};

export const exportReportCsv = async (req, res, next) => {
  try {
    const period = parseReportPeriod(req.query);
    if (period.error) {
      res.status(400);
      throw new Error(period.error);
    }

    const section = String(req.query.section || "all").toLowerCase();
    const { expenses, incomes } = await loadPeriodTransactions(
      req.user._id,
      period.start,
      period.end
    );
    const report = buildReportPayload(period, expenses, incomes);

    let headers;
    let rows;
    let filename = `report-${period.type}-${period.year}`;

    if (period.type === "monthly") {
      filename += `-${String(period.month).padStart(2, "0")}`;
    }

    if (section === "transactions") {
      headers = [
        "Type",
        "Date",
        "Title",
        "Category",
        "Account",
        "Amount",
        "Description",
      ];
      rows = [
        ...incomes.map((row) => [
          "Income",
          toLocalDateKey(row.date),
          row.title,
          row.category,
          row.paymentMode,
          row.amount,
          row.description || "",
        ]),
        ...expenses.map((row) => [
          "Expense",
          toLocalDateKey(row.date),
          row.title,
          row.category,
          row.paymentMode,
          row.amount,
          row.description || "",
        ]),
      ];
      filename += "-transactions";
    } else if (section === "category") {
      headers = ["Type", "Category", "Total", "Count", "Percent"];
      rows = [
        ...report.byCategory.income.map((row) => [
          "Income",
          row.category,
          row.total,
          row.count,
          row.percent,
        ]),
        ...report.byCategory.expense.map((row) => [
          "Expense",
          row.category,
          row.total,
          row.count,
          row.percent,
        ]),
      ];
      filename += "-category";
    } else if (section === "account") {
      headers = [
        "Account",
        "Income",
        "Expense",
        "Net",
        "Income count",
        "Expense count",
      ];
      rows = report.byAccount.map((row) => [
        row.account,
        row.income,
        row.expense,
        row.net,
        row.incomeCount,
        row.expenseCount,
      ]);
      filename += "-account";
    } else {
      headers = ["Label", "Income", "Expense", "Net"];
      rows = [
        ["Summary - Total income", report.summary.totalIncome, "", ""],
        ["Summary - Total expense", "", report.summary.totalExpense, ""],
        ["Summary - Net", "", "", report.summary.net],
        ...report.incomeVsExpense.map((row) => [
          row.label,
          row.income,
          row.expense,
          row.net,
        ]),
      ];
      filename += "-summary";
    }

    const csv = rowsToCsv(headers, rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
