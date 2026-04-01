const prisma = require('../prisma/client');

function computeBalance(type, entries) {
  if (type === 'TABUNGAN') {
    return entries.reduce((sum, e) =>
      e.type === 'DEPOSIT' ? sum + Number(e.amount) : sum - Number(e.amount), 0);
  }
  // INVESTASI: nilai dari entry terbaru
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
  return Number(sorted[0].amount);
}

const getAll = async (req, res) => {
  const savings = await prisma.savings.findMany({
    where: { userId: req.userId },
    include: { entries: { orderBy: { date: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json(savings.map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    type: s.type,
    target: s.target ? Number(s.target) : null,
    createdAt: s.createdAt,
    balance: computeBalance(s.type, s.entries),
    entryCount: s.entries.length,
  })));
};

const create = async (req, res) => {
  const { name, icon, type, target } = req.body;
  const saving = await prisma.savings.create({
    data: {
      name,
      icon: icon || '💰',
      type,
      target: target ? Number(target) : null,
      userId: req.userId,
    },
  });
  res.status(201).json({ ...saving, balance: 0, entryCount: 0 });
};

const update = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.savings.findFirst({ where: { id: parseInt(id), userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  const { name, icon, target } = req.body;
  const updated = await prisma.savings.update({
    where: { id: parseInt(id) },
    data: {
      name: name ?? existing.name,
      icon: icon ?? existing.icon,
      target: target !== undefined ? (target ? Number(target) : null) : existing.target,
    },
  });
  res.json(updated);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.savings.findFirst({ where: { id: parseInt(id), userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  await prisma.savings.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deleted' });
};

const getEntries = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.savings.findFirst({ where: { id: parseInt(id), userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  const entries = await prisma.savingsEntry.findMany({
    where: { savingsId: parseInt(id) },
    orderBy: { date: 'desc' },
  });
  res.json(entries);
};

const addEntry = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.savings.findFirst({ where: { id: parseInt(id), userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });

  const { amount, type, note, date } = req.body;
  const entry = await prisma.savingsEntry.create({
    data: {
      savingsId: parseInt(id),
      amount: Number(amount),
      type,
      note: note || null,
      date: new Date(date),
      userId: req.userId,
    },
  });
  res.status(201).json(entry);
};

const deleteEntry = async (req, res) => {
  const { id, entryId } = req.params;
  const entry = await prisma.savingsEntry.findFirst({
    where: { id: parseInt(entryId), savingsId: parseInt(id), userId: req.userId },
  });
  if (!entry) return res.status(404).json({ message: 'Not found' });

  await prisma.savingsEntry.delete({ where: { id: parseInt(entryId) } });
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, create, update, remove, getEntries, addEntry, deleteEntry };
