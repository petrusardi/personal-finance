const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getInitialBalance, setInitialBalance, getCurrentBalance } = require('../controllers/balance.controller');

router.use(auth);
router.get('/initial', getInitialBalance);
router.post('/initial', setInitialBalance);
router.get('/current', getCurrentBalance);

module.exports = router;
