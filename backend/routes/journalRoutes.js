const express = require("express");

const router = express.Router();

const {
  createJournalVoucher,
  getAllJournalVouchers,
  getJournalVoucherById,
} = require("../controllers/journalController");

// GET all journal vouchers
router.get("/", getAllJournalVouchers);

// GET journal voucher by ID
router.get("/:id", getJournalVoucherById);

// POST create journal voucher
router.post("/", createJournalVoucher);

module.exports = router;