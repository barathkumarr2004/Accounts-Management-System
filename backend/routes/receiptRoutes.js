const express = require("express");

const {createReceiptVoucher} = require("../controllers/receiptController");

const router = express.Router();

router.post("/", createReceiptVoucher);

module.exports = router;