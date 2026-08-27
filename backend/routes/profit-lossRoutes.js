const express=require("express");
const router=express.Router();

const profitLossController = require("../controllers/profit-lossController");

router.get("/", profitLossController.getProfitLoss);

module.exports = router;
