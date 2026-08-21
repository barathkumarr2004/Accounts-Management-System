const express = require("express");

const router = express.Router();

const {
  createJournalVoucher,
  getAllJournalVouchers,
  getJournalVoucherById,
} = require("../controllers/journalController");

router.get("/", getAllJournalVouchers);
router.get("/:id", getJournalVoucherById);
router.post("/", createJournalVoucher);

module.exports = router;