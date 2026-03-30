const prisma = require('../prisma/client');

const getAll = async (req, res) => {
  try {
    const entries = await prisma.savingsEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBalance = async (req, res) => {
  try {
    const entries = await prisma.savingsEntry.findMany({
      where: { userId: req.userId },
    });
    const balance = entries.reduce((sum, e) => {
      const amount = parseFloat(e.amount);
      return e.type === 'DEPOSIT' ? sum + amount : sum - amount;
    }, 0);
    res.json({ balance });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  const { amount, type, description, date } = req.body;
  if (!amount || !type || !date) {
    return res.status(400).json({ message: 'amount, type, and date are required' });
  }
  if (!['DEPOSIT', 'WITHDRAWAL'].includes(type)) {
    return res.status(400).json({ message: 'type must be DEPOSIT or WITHDRAWAL' });
  }
  try {
    const entry = await prisma.savingsEntry.create({
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        userId: req.userId,
      },
    });
    res.status(201).json(entry);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  const { amount, type, description, date } = req.body;
  try {
    const entry = await prisma.savingsEntry.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.savingsEntry.update({
      where: { id: entry.id },
      data: { amount, type, description, date: date ? new Date(date) : undefined },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const entry = await prisma.savingsEntry.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    await prisma.savingsEntry.delete({ where: { id: entry.id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getBalance, create, update, remove };
