const express = require("express");

const router = express.Router();

const {
  createJournalVoucher,
  getAllJournalVouchers,
  getJournalVoucherById,
  getLedgerTransactions,
} = require("../controllers/journalController");

router.get("/", getAllJournalVouchers);

router.get("/ledger/:ledgerId", getLedgerTransactions);

router.get("/:id", getJournalVoucherById);

router.post("/", createJournalVoucher);

module.exports = router;