const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, getSummary, getByCategory, getByPaymentMethod, getDailyExpenses, getYearlySummary, getTrend, getByWeekday, create, update, remove } = require('../controllers/transaction.controller');

router.use(auth);
router.get('/', getAll);
router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/by-payment-method', getByPaymentMethod);
router.get('/daily', getDailyExpenses);
router.get('/yearly', getYearlySummary);
router.get('/trend', getTrend);
router.get('/by-weekday', getByWeekday);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
