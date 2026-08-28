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

//ledger transaction

const getLedgerTransactions = async (req, res) => {
  try {
    const { ledgerId } = req.params;

    if (!ledgerId || Number.isNaN(Number(ledgerId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ledger ID",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        je.id AS entry_id,
        je.ledger_id,

        jv.id AS voucher_id,
        jv.voucher_number,
        jv.voucher_date,
        jv.narration,

        je.debit,
        je.credit

      FROM journal_entries je

      INNER JOIN journal_vouchers jv
        ON jv.id = je.voucher_id

      WHERE je.ledger_id = ?

      ORDER BY
        jv.voucher_date ASC,
        jv.id ASC,
        je.id ASC
      `,
      [ledgerId]
    );

    let runningBalance = 0;

    const transactions = rows.map((row) => {
      const debit = Number(row.debit || 0);
      const credit = Number(row.credit || 0);

      // Debit increases asset/expense,
      // credit increases liability/income.
      runningBalance += debit - credit;

      return {
        entry_id: row.entry_id,
        ledger_id: row.ledger_id,

        voucher_id: row.voucher_id,
        voucher_number: row.voucher_number,

        voucher_date: row.voucher_date,
        narration: row.narration,

        debit,
        credit,

        running_balance: runningBalance,
      };
    });

    const totalDebit = transactions.reduce(
      (sum, row) => sum + row.debit,
      0
    );

    const totalCredit = transactions.reduce(
      (sum, row) => sum + row.credit,
      0
    );

    return res.json({
      success: true,

      ledger_id: Number(ledgerId),

      transactions,

      totalDebit,
      totalCredit,

      closingBalance:
        totalDebit - totalCredit,
    });

  } catch (error) {
    console.error(
      "GET LEDGER TRANSACTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ledger transactions",
    });
  }
};



module.exports = {
  createJournalVoucher,
  getAllJournalVouchers,
  getJournalVoucherById,
};