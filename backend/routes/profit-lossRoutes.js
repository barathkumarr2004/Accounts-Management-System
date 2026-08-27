const express=require("express");
const router=express.Router();

const {getProfitLoss}=require("../controllers/profit-lossController");

router.get("/",getProfitLoss);

module.exports=router;