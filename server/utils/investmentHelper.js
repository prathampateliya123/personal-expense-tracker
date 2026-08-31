/**
 * utils/investmentHelper.js
 * Helpers for computing gain/loss on investment documents.
 */

/**
 * Enrich a single investment with gain/loss metrics.
 */
export const enrichInvestment = (investment) => {
  const doc = investment.toObject ? investment.toObject() : investment;
  const gainLoss = doc.currentValue - doc.investedAmount;
  const gainLossPercent =
    doc.investedAmount > 0
      ? Math.round((gainLoss / doc.investedAmount) * 10000) / 100
      : 0;

  return {
    ...doc,
    gainLoss: Math.round(gainLoss * 100) / 100,
    gainLossPercent,
    isProfit: gainLoss >= 0,
  };
};

/**
 * Compute portfolio-level summary from enriched investments.
 */
export const computePortfolioSummary = (investments) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  );
  const totalGainLoss = totalCurrentValue - totalInvested;
  const overallGainLossPercent =
    totalInvested > 0
      ? Math.round((totalGainLoss / totalInvested) * 10000) / 100
      : 0;

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    overallGainLossPercent,
    isProfit: totalGainLoss >= 0,
  };
};

/**
 * Aggregate current value by investment type for pie chart data.
 */
export const groupByType = (investments) => {
  const map = {};

  investments.forEach((inv) => {
    if (!map[inv.type]) {
      map[inv.type] = { type: inv.type, value: 0, count: 0 };
    }
    map[inv.type].value += inv.currentValue;
    map[inv.type].count += 1;
  });

  return Object.values(map).map((item) => ({
    ...item,
    value: Math.round(item.value * 100) / 100,
  }));
};
