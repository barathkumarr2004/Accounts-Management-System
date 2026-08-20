const journalModel = require("../models/journalModel");

// POST /api/journals
const createJournalVoucher = async (req, res) => {
  try {
    const { voucherDate, narration, entries } = req.body;

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher date is required",
      });
    }

    if (!Array.isArray(entries) || entries.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two journal entries are required",
      });
    }

    for (const entry of entries) {
      if (
        entry.ledgerId === undefined ||
        entry.ledgerId === null ||
        entry.ledgerId === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Ledger is required for every entry",
        });
      }

      const ledgerId = Number(entry.ledgerId);
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      if (!Number.isInteger(ledgerId) || ledgerId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid ledger",
        });
      }

      if (debit < 0 || credit < 0) {
        return res.status(400).json({
          success: false,
          message: "Debit and credit amounts cannot be negative",
        });
      }

      if (debit > 0 && credit > 0) {
        return res.status(400).json({
          success: false,
          message: "An entry cannot have both debit and credit",
        });
      }

      if (debit === 0 && credit === 0) {
        return res.status(400).json({
          success: false,
          message: "Every entry must have a debit or credit amount",
        });
      }
    }

    const totalDebit = entries.reduce(
      (total, entry) => total + Number(entry.debit || 0),
      0
    );

    const totalCredit = entries.reduce(
      (total, entry) => total + Number(entry.credit || 0),
      0
    );

    if (totalDebit !== totalCredit) {
      return res.status(400).json({
        success: false,
        message: "Total debit and total credit must be equal",
        data: {
          totalDebit,
          totalCredit,
        },
      });
    }

    const journal = await journalModel.createJournalVoucher({
      voucherDate,
      narration,
      entries,
    });

    return res.status(201).json({
      success: true,
      message: "Journal voucher created successfully",
      data: journal,
    });
  } catch (error) {
    console.error("CREATE JOURNAL VOUCHER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create journal voucher",
    });
  }
};

// GET /api/journals
const getAllJournalVouchers = async (req, res) => {
  try {
    const journals = await journalModel.getAllJournals();

    return res.status(200).json({
      success: true,
      message: "Journal vouchers fetched successfully",
      data: journals,
    });
  } catch (error) {
    console.error("GET JOURNAL VOUCHERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch journal vouchers",
    });
  }
};

// GET /api/journals/:id
const getJournalVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid journal voucher ID",
      });
    }

    const journal = await journalModel.getJournalVoucherById(id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal voucher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal voucher fetched successfully",
      data: journal,
    });
  } catch (error) {
    console.error("GET JOURNAL VOUCHER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch journal voucher",
    });
  }
};

module.exports = {
  createJournalVoucher,
  getAllJournalVouchers,
  getJournalVoucherById,
};