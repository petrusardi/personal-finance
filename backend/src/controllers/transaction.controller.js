const prisma = require('../prisma/client');

const getAll = async (req, res) => {
  const { month, year, type, categoryId, page = 1, limit = 20 } = req.query;
  const where = { userId: req.userId };

  if (type) where.type = type;
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (req.query.paymentMethod) where.paymentMethod = req.query.paymentMethod;
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }
  if (req.query.search) where.description = { contains: req.query.search, mode: 'insensitive' };

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    }),
  ]);

  res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

const getSummary = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: req.userId, type: 'INCOME', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(income._sum.amount) || 0;
  const totalExpense = Number(expense._sum.amount) || 0;

  res.json({ income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense });
};

const getByCategory = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const data = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const withCategory = await Promise.all(
    data.map(async (item) => {
      const category = await prisma.category.findUnique({ where: { id: item.categoryId } });
      return { category, total: Number(item._sum.amount) };
    })
  );

  res.json(withCategory);
};

const create = async (req, res) => {
  const { amount, type, description, date, categoryId, paymentMethod } = req.body;
  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      description,
      date: new Date(date),
      categoryId: parseInt(categoryId),
      userId: req.userId,
      paymentMethod: paymentMethod || null,
    },
    include: { category: true },
  });
  res.status(201).json(transaction);
};

const update = async (req, res) => {
  const { id } = req.params;
  const transaction = await prisma.transaction.findFirst({
    where: { id: parseInt(id), userId: req.userId },
  });
  if (!transaction) return res.status(404).json({ message: 'Not found' });

  const { amount, type, description, date, categoryId, paymentMethod } = req.body;
  const updated = await prisma.transaction.update({
    where: { id: parseInt(id) },
    data: {
      amount,
      type,
      description,
      date: new Date(date),
      categoryId: parseInt(categoryId),
      paymentMethod: paymentMethod || null,
    },
    include: { category: true },
  });
  res.json(updated);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const transaction = await prisma.transaction.findFirst({
    where: { id: parseInt(id), userId: req.userId },
  });
  if (!transaction) return res.status(404).json({ message: 'Not found' });

  await prisma.transaction.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deleted' });
};

const getByPaymentMethod = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const data = await prisma.transaction.groupBy({
    by: ['paymentMethod'],
    where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end }, paymentMethod: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  res.json(data.map((d) => ({ method: d.paymentMethod, total: Number(d._sum.amount) })));
};

const getDailyExpenses = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const daysInMonth = new Date(year, month, 0).getDate();

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    select: { amount: true, date: true },
  });

  const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, expense: 0 }));
  for (const tx of transactions) {
    const day = new Date(tx.date).getDate();
    daily[day - 1].expense += Number(tx.amount);
  }

  res.json(daily);
};

const getYearlySummary = async (req, res) => {
  const { year } = req.query;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start, lte: end } },
    select: { amount: true, type: true, date: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
  for (const tx of transactions) {
    const m = new Date(tx.date).getMonth();
    if (tx.type === 'INCOME') monthly[m].income += Number(tx.amount);
    else monthly[m].expense += Number(tx.amount);
  }
  monthly.forEach((m) => { m.balance = m.income - m.expense; });

  res.json(monthly);
};

const getTrend = async (req, res) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  const results = await Promise.all(months.map(async ({ year, month }) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId: req.userId, type: 'INCOME', date: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } }, _sum: { amount: true } }),
    ]);
    return { month, year, income: Number(income._sum.amount) || 0, expense: Number(expense._sum.amount) || 0 };
  }));
  res.json(results);
};

const getByWeekday = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    select: { amount: true, date: true },
  });
  const days = [
    { day: 'Mon', total: 0 }, { day: 'Tue', total: 0 }, { day: 'Wed', total: 0 },
    { day: 'Thu', total: 0 }, { day: 'Fri', total: 0 }, { day: 'Sat', total: 0 }, { day: 'Sun', total: 0 },
  ];
  for (const tx of transactions) {
    const d = new Date(tx.date).getDay(); // 0=Sun
    const idx = d === 0 ? 6 : d - 1; // remap to Mon=0..Sun=6
    days[idx].total += Number(tx.amount);
  }
  res.json(days);
};

module.exports = { getAll, getSummary, getByCategory, getByPaymentMethod, getDailyExpenses, getYearlySummary, getTrend, getByWeekday, create, update, remove };
