const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const { importCSV } = require('../controllers/import.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/csv', auth, upload.single('file'), importCSV);

module.exports = router;
