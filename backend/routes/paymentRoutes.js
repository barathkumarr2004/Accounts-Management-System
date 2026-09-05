const express = require("express");

const {createPaymentVoucher} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", createPaymentVoucher);

module.exports = router;