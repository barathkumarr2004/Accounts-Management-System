const express = require("express");
const {
  createSalesVoucher,
} = require("../controllers/salesController");

const router = express.Router();

router.post("/", createSalesVoucher);

module.exports = router;