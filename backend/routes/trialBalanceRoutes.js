const express = require("express");
const router = express.Router();
const controller = require("../controllers/trialBalanceController");

router.get("/", controller.getTrialBalanceController);

router.get("/:id/vouchers", controller.getVouchersByLedger);

module.exports = router;