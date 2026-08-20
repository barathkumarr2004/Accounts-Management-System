const express = require('express');
const { getCOA } = require('../controllers/chartofAccountsController');
const router = express.Router();

router.get('/', getCOA);

module.exports = router;