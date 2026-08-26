const express = require("express");
const router = express.Router();
const { getBalanceSheet, getVouchersByLedger, getVoucherDetail } = require("../controllers/balanceSheetController");

router.get("/", getBalanceSheet);
router.get("/ledgers/:id/vouchers", getVouchersByLedger);
router.get("/vouchers/:voucherId", getVoucherDetail);

module.exports = router;