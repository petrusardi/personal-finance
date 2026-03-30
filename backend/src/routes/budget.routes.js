const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, upsert, remove } = require('../controllers/budget.controller');

router.use(auth);
router.get('/', getAll);
router.post('/', upsert);
router.delete('/:id', remove);

module.exports = router;
