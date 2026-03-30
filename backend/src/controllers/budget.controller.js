const prisma = require('../prisma/client');

const getAll = async (req, res) => {
  const { month, year } = req.query;
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId, month: parseInt(month), year: parseInt(year) },
    include: { category: true },
  });

  const withSpent = await Promise.all(
    budgets.map(async (budget) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const spent = await prisma.transaction.aggregate({
        where: {
          userId: req.userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });
      return { ...budget, spent: Number(spent._sum.amount) || 0 };
    })
  );

  res.json(withSpent);
};

const upsert = async (req, res) => {
  const { limitAmount, month, year, categoryId } = req.body;
  const budget = await prisma.budget.upsert({
    where: { categoryId_userId_month_year: { categoryId, userId: req.userId, month, year } },
    update: { limitAmount },
    create: { limitAmount, month, year, categoryId, userId: req.userId },
    include: { category: true },
  });
  res.json(budget);
};

const remove = async (req, res) => {
  const { id } = req.params;
  await prisma.budget.deleteMany({ where: { id: parseInt(id), userId: req.userId } });
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, upsert, remove };
