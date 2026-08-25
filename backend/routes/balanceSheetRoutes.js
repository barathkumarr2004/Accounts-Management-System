// const express = require('express');
// const router = express.Router();
// const { getBalanceSheet } = require('../controllers/balanceSheetController');
// router.get('/', getBalanceSheet);
// module.exports = router;


const express = require('express');
const router = express.Router();
const { getBalanceSheet } = require('../controllers/balanceSheetController');
router.get('/', getBalanceSheet);
module.exports = router;



