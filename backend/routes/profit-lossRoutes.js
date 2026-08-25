const express=require("express");
const router=express.router();

const {getProfitLoss}=require("../controllers/profit-lossController");

router.get("/",getProfitLoss);

module.exports=router;