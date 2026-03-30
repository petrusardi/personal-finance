const prisma = require('../prisma/client');

const getAll = async (req, res) => {
  const categories = await prisma.category.findMany({ where: { userId: req.userId } });
  res.json(categories);
};

const create = async (req, res) => {
  const { name, type, icon, color } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name, type, icon, color, userId: req.userId },
    });
    res.status(201).json(category);
  } catch {
    res.status(400).json({ message: 'Category name already exists' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findFirst({
    where: { id: parseInt(id), userId: req.userId },
  });
  if (!category) return res.status(404).json({ message: 'Not found' });

  const updated = await prisma.category.update({
    where: { id: parseInt(id) },
    data: req.body,
  });
  res.json(updated);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findFirst({
    where: { id: parseInt(id), userId: req.userId },
  });
  if (!category) return res.status(404).json({ message: 'Not found' });

  await prisma.category.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deleted' });
};

module.exports = { getAll, create, update, remove };
