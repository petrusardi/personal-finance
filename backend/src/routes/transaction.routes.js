const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, getSummary, getByCategory, getDailyExpenses, getYearlySummary, create, update, remove } = require('../controllers/transaction.controller');

router.use(auth);
router.get('/', getAll);
router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/daily', getDailyExpenses);
router.get('/yearly', getYearlySummary);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
