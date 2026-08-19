const express = require('express');
const { getCOA } = require('../controllers/chartOfAccountsController');
const router = express.Router();

router.get('/', getCOA);

module.exports = router;