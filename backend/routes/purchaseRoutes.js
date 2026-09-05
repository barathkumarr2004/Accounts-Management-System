const express = require("express");
const {createPurchaseVoucher,} = require("../controllers/purchaseController");

const router = express.Router();

router.post("/", createPurchaseVoucher);

module.exports = router;