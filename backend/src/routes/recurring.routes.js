const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, create, remove, apply } = require('../controllers/recurring.controller');

router.use(auth);
router.get('/', getAll);
router.post('/', create);
router.delete('/:id', remove);
router.post('/:id/apply', apply);

module.exports = router;
