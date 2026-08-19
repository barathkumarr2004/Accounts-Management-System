const express = require("express");

const router = express.Router();

const {
  getLedgers,
  createLedger,
} = require("../controllers/ledgerController");


router.get("/", getLedgers);

router.post("/", createLedger);


module.exports = router;