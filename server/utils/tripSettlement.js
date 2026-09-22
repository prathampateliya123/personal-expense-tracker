export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const computeMemberBalances = (members = [], expenses = [], settlements = []) => {
  const balances = {};
  for (const member of members) {
    balances[String(member._id)] = 0;
  }

  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0;
    const paidBy = String(expense.paidBy);
    const splitAmong = (expense.splitAmong || []).map(String).filter(Boolean);
    if (!splitAmong.length || amount <= 0) continue;

    if (balances[paidBy] === undefined) continue;
    balances[paidBy] = round2(balances[paidBy] + amount);

    const share = round2(amount / splitAmong.length);
    let allocated = 0;
    splitAmong.forEach((memberId, index) => {
      if (balances[memberId] === undefined) return;
      const isLast = index === splitAmong.length - 1;
      const piece = isLast ? round2(amount - allocated) : share;
      allocated = round2(allocated + piece);
      balances[memberId] = round2(balances[memberId] - piece);
    });
  }

  for (const settlement of settlements) {
    const fromId = String(settlement.fromMemberId);
    const toId = String(settlement.toMemberId);
    const amount = Number(settlement.amount) || 0;
    if (amount <= 0) continue;
    if (balances[fromId] !== undefined) {
      balances[fromId] = round2(balances[fromId] + amount);
    }
    if (balances[toId] !== undefined) {
      balances[toId] = round2(balances[toId] - amount);
    }
  }

  return balances;
};

export const suggestSettlements = (members = [], balances = {}) => {
  const debtors = [];
  const creditors = [];

  for (const member of members) {
    const id = String(member._id);
    const bal = round2(balances[id] || 0);
    if (bal < -0.009) debtors.push({ id, name: member.name, amount: -bal });
    else if (bal > 0.009) creditors.push({ id, name: member.name, amount: bal });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggestions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    const amount = round2(pay);
    if (amount > 0) {
      suggestions.push({
        fromMemberId: debtors[i].id,
        fromName: debtors[i].name,
        toMemberId: creditors[j].id,
        toName: creditors[j].name,
        amount,
      });
    }
    debtors[i].amount = round2(debtors[i].amount - amount);
    creditors[j].amount = round2(creditors[j].amount - amount);
    if (debtors[i].amount <= 0.009) i += 1;
    if (creditors[j].amount <= 0.009) j += 1;
  }

  return suggestions;
};

export const buildCategoryBreakdown = (expenses = []) => {
  const map = {};
  let total = 0;

  for (const expense of expenses) {
    const category = expense.category || "Other";
    const amount = Number(expense.amount) || 0;
    total += amount;
    if (!map[category]) map[category] = { category, total: 0, count: 0 };
    map[category].total = round2(map[category].total + amount);
    map[category].count += 1;
  }

  const breakdown = Object.values(map).sort((a, b) => b.total - a.total);
  return { total: round2(total), breakdown };
};

export const buildTripSummary = (trip, expenses = []) => {
  const members = trip.members || [];
  const settlements = trip.settlements || [];
  const balancesMap = computeMemberBalances(members, expenses, settlements);
  const { total, breakdown } = buildCategoryBreakdown(expenses);
  const suggestions = suggestSettlements(members, balancesMap);

  const balances = members.map((member) => {
    const id = String(member._id);
    const balance = round2(balancesMap[id] || 0);
    return {
      memberId: id,
      name: member.name,
      isSelf: Boolean(member.isSelf),
      balance,
      status:
        balance > 0.009 ? "owed" : balance < -0.009 ? "owes" : "settled",
    };
  });

  return {
    total,
    expenseCount: expenses.length,
    memberCount: members.length,
    breakdown,
    balances,
    suggestedSettlements: suggestions,
    isFullySettled: suggestions.length === 0 && total >= 0,
  };
};
