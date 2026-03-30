require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const prisma = require('./client');
const bcrypt = require('bcryptjs');

function randomBetween(min, max) {
  const raw = Math.random() * (max - min) + min;
  return Math.round(raw / 1000) * 1000;
}

function randomDate(year, month) {
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day);
}

async function main() {
  console.log('Seeding...');

  const hashed = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { name: 'Demo User', email: 'demo@example.com', password: hashed },
  });

  // --- Categories ---
  const categoryDefs = [
    { name: 'Salary',        type: 'INCOME',  icon: '💼', color: '#22c55e' },
    { name: 'Freelance',     type: 'INCOME',  icon: '💻', color: '#16a34a' },
    { name: 'Food & Drink',  type: 'EXPENSE', icon: '🍔', color: '#f97316' },
    { name: 'Transport',     type: 'EXPENSE', icon: '🚗', color: '#3b82f6' },
    { name: 'Shopping',      type: 'EXPENSE', icon: '🛍️', color: '#a855f7' },
    { name: 'Bills',         type: 'EXPENSE', icon: '📄', color: '#ef4444' },
    { name: 'Health',        type: 'EXPENSE', icon: '💊', color: '#06b6d4' },
    { name: 'Entertainment', type: 'EXPENSE', icon: '🎬', color: '#f59e0b' },
  ];

  const categories = {};
  for (const cat of categoryDefs) {
    const created = await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: {},
      create: { ...cat, userId: user.id },
    });
    categories[cat.name] = created;
  }

  // --- Transactions: last 3 months ---
  const now = new Date();
  const months = [
    { month: now.getMonth() - 1 < 0 ? 12 : now.getMonth(),     year: now.getMonth() - 1 < 0 ? now.getFullYear() - 1 : now.getFullYear() },
    { month: now.getMonth() === 0 ? 12 : now.getMonth(),        year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear() },
    { month: now.getMonth() + 1,                                 year: now.getFullYear() },
  ];

  const txTemplates = [
    // INCOME
    { category: 'Salary',        type: 'INCOME',  min: 5000000,  max: 10000000, desc: 'Monthly salary' },
    { category: 'Freelance',     type: 'INCOME',  min: 500000,   max: 3000000,  desc: 'Freelance project' },
    // EXPENSE
    { category: 'Food & Drink',  type: 'EXPENSE', min: 15000,  max: 150000,  descs: ['Lunch', 'Grocery', 'Coffee', 'Dinner', 'Snacks'] },
    { category: 'Transport',     type: 'EXPENSE', min: 10000,  max: 100000,  descs: ['Grab', 'Fuel', 'Parking', 'Bus ticket'] },
    { category: 'Shopping',      type: 'EXPENSE', min: 50000,  max: 500000,  descs: ['Clothes', 'Online order', 'Accessories'] },
    { category: 'Bills',         type: 'EXPENSE', min: 100000, max: 500000,  descs: ['Electricity', 'Internet', 'Water bill', 'Phone bill'] },
    { category: 'Health',        type: 'EXPENSE', min: 30000,  max: 300000,  descs: ['Medicine', 'Doctor visit', 'Gym', 'Vitamins'] },
    { category: 'Entertainment', type: 'EXPENSE', min: 25000,  max: 200000,  descs: ['Netflix', 'Movie', 'Games', 'Concert'] },
  ];

  const txCounts = {
    'Salary': 1, 'Freelance': 2,
    'Food & Drink': 12, 'Transport': 8,
    'Shopping': 4, 'Bills': 4,
    'Health': 3, 'Entertainment': 5,
  };

  for (const { month, year } of months) {
    for (const tmpl of txTemplates) {
      const count = txCounts[tmpl.category] || 3;
      for (let i = 0; i < count; i++) {
        const desc = tmpl.desc || tmpl.descs[Math.floor(Math.random() * tmpl.descs.length)];
        await prisma.transaction.create({
          data: {
            amount: randomBetween(tmpl.min, tmpl.max),
            type: tmpl.type,
            description: desc,
            date: randomDate(year, month),
            categoryId: categories[tmpl.category].id,
            userId: user.id,
          },
        });
      }
    }

    // --- Budgets ---
    const budgetLimits = {
      'Food & Drink': 2000000, 'Transport': 800000,
      'Shopping': 2000000,    'Bills': 1500000,
      'Health': 500000,       'Entertainment': 500000,
    };
    for (const [catName, limit] of Object.entries(budgetLimits)) {
      await prisma.budget.upsert({
        where: {
          categoryId_userId_month_year: {
            categoryId: categories[catName].id,
            userId: user.id,
            month,
            year,
          },
        },
        update: {},
        create: {
          limitAmount: limit,
          month,
          year,
          categoryId: categories[catName].id,
          userId: user.id,
        },
      });
    }
  }

  const txCount = await prisma.transaction.count({ where: { userId: user.id } });
  const budgetCount = await prisma.budget.count({ where: { userId: user.id } });
  console.log(`Done! Created ${txCount} transactions and ${budgetCount} budgets for demo@example.com`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
