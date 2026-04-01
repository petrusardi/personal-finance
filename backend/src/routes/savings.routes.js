const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, create, update, remove, getEntries, addEntry, deleteEntry } = require('../controllers/savings.controller');

router.use(auth);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/:id/entries', getEntries);
router.post('/:id/entries', addEntry);
router.delete('/:id/entries/:entryId', deleteEntry);

module.exports = router;
