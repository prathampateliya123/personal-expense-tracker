export const applyDateQueryFilter = (filter, query = {}) => {
  const dateOperator = String(query.dateOperator || "between").toLowerCase();
  const startDate = query.startDate?.trim();
  const endDate = query.endDate?.trim();

  if (dateOperator === "between" && (startDate || endDate)) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  } else if (startDate || endDate) {
    const day = startDate || endDate;
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    if (dateOperator === "on") {
      filter.date = { $gte: start, $lte: end };
    } else if (dateOperator === "before") {
      filter.date = { $lt: start };
    } else if (dateOperator === "after") {
      filter.date = { $gt: end };
    }
  }

  return filter;
};

export const buildTransactionListFilter = (userId, query = {}) => {
  const filter = { userId };

  if (query.category?.trim()) {
    filter.category = query.category.trim();
  }

  if (query.paymentMode?.trim()) {
    filter.paymentMode = query.paymentMode.trim();
  }

  if (query.search?.trim()) {
    filter.title = { $regex: query.search.trim(), $options: "i" };
  }

  return applyDateQueryFilter(filter, query);
};

export const parseTransactionSort = (sortBy) => {
  const sortMap = {
    date: { date: -1 },
    "date-asc": { date: 1 },
    amount: { amount: -1 },
    "amount-asc": { amount: 1 },
    title: { title: 1 },
  };

  return sortMap[sortBy] || sortMap.date;
};
