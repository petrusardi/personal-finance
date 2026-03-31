const prisma = require('../prisma/client');

const getInitialBalance = async (req, res) => {
  try {
    const record = await prisma.initialBalance.findUnique({ where: { userId: req.userId } });
    res.json({ amount: record ? Number(record.amount) : 0 });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const setInitialBalance = async (req, res) => {
  const { amount } = req.body;
  try {
    const record = await prisma.initialBalance.upsert({
      where: { userId: req.userId },
      update: { amount },
      create: { amount, userId: req.userId },
    });
    res.json({ amount: Number(record.amount) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentBalance = async (req, res) => {
  try {
    const [initialRecord, income, expense] = await Promise.all([
      prisma.initialBalance.findUnique({ where: { userId: req.userId } }),
      prisma.transaction.aggregate({
        where: { userId: req.userId, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: req.userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const initial = Number(initialRecord?.amount) || 0;
    const totalIncome = Number(income._sum.amount) || 0;
    const totalExpense = Number(expense._sum.amount) || 0;
    const current = initial + totalIncome - totalExpense;

    res.json({ initial, totalIncome, totalExpense, current });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getInitialBalance, setInitialBalance, getCurrentBalance };
