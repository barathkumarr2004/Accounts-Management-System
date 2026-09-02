const express = require("express");

const {
  getStocks,
  getStock,
  getNextItemCode,
  createStock,
  updateStock,
  deleteStock,
} = require("../controllers/stockController");

const router = express.Router();

router.get("/", getStocks);
router.get("/next-code", getNextItemCode);
router.get("/:id", getStock);
router.post("/", createStock);
router.put("/:id", updateStock);
router.delete("/:id", deleteStock);

module.exports = router;