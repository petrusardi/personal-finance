const csv = require('csv-parser');
const fs = require('fs');
const prisma = require('../prisma/client');

const importCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      fs.unlinkSync(req.file.path);
      let imported = 0;
      const errors = [];

      for (const row of results) {
        try {
          const category = await prisma.category.findFirst({
            where: { name: row.category, userId: req.userId },
          });
          if (!category) {
            errors.push(`Row skipped: category "${row.category}" not found`);
            continue;
          }
          await prisma.transaction.create({
            data: {
              amount: parseFloat(row.amount),
              type: row.type?.toUpperCase(),
              description: row.description || '',
              date: new Date(row.date),
              categoryId: category.id,
              userId: req.userId,
            },
          });
          imported++;
        } catch (err) {
          errors.push(`Row skipped: ${err.message}`);
        }
      }

      res.json({ imported, errors });
    });
};

module.exports = { importCSV };
