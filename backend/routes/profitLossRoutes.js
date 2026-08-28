const express = require("express");
const router = express.Router();

const {
  getProfitLoss,
  getVouchersByLedger,
  getVoucherDetail
} = require("../controllers/profitLossController");

router.get("/", getProfitLoss);
router.get("/ledgers/:id/vouchers", getVouchersByLedger);

module.exports = router;