const prisma = require('../prisma/client');

const getAll = async (req, res) => {
  const templates = await prisma.recurringTemplate.findMany({
    where: { userId: req.userId },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(templates);
};

const create = async (req, res) => {
  const { name, amount, type, categoryId, paymentMethod } = req.body;
  const template = await prisma.recurringTemplate.create({
    data: {
      name,
      amount: Number(amount),
      type,
      categoryId: parseInt(categoryId),
      paymentMethod: paymentMethod || null,
      userId: req.userId,
    },
    include: { category: true },
  });
  res.status(201).json(template);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.recurringTemplate.findFirst({ where: { id: parseInt(id), userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  await prisma.recurringTemplate.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deleted' });
};

// Apply template: create a transaction from this template
const apply = async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const template = await prisma.recurringTemplate.findFirst({
    where: { id: parseInt(id), userId: req.userId },
  });
  if (!template) return res.status(404).json({ message: 'Not found' });

  const transaction = await prisma.transaction.create({
    data: {
      amount: template.amount,
      type: template.type,
      description: template.name,
      date: new Date(date),
      categoryId: template.categoryId,
      paymentMethod: template.paymentMethod,
      userId: req.userId,
    },
    include: { category: true },
  });
  res.status(201).json(transaction);
};

module.exports = { getAll, create, remove, apply };
