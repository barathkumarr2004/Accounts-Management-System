const model = require("../models/trialBalanceModel");

const getTrialBalanceController = async (req, res) => {
  try {
    const rows = await model.getTrialBalance();

    const data = [];

    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach((row) => {
      const debit = Number(row.total_debit) || 0;
      const credit = Number(row.total_credit) || 0;

      if (debit === 0 && credit === 0) {
        return;
      }

      data.push({
        id: row.group_id,
        group_id: row.group_id,
        name: row.group_name,
        group_name: row.group_name,
        debit,
        credit,
      });

      totalDebit += debit;
      totalCredit += credit;
    });

    return res.status(200).json({
      success: true,
      data,
      totalDebit,
      totalCredit,
    });
  } catch (error) {
    console.error(
      "TRIAL BALANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load Trial Balance",
      error: error.message,
    });
  }
};

const getVouchersByLedger = async (req, res) => {
  try {
    const ledgerId = Number(req.params.id);

    if (!ledgerId || Number.isNaN(ledgerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ledger ID",
      });
    }

    const vouchers =
      await model.getLedgerVouchers(ledgerId);

    return res.status(200).json({
      success: true,
      data: vouchers,
      vouchers,
    });
  } catch (error) {
    console.error(
      "TRIAL BALANCE VOUCHER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ledger vouchers",
      error: error.message,
    });
  }
};

module.exports = {
  getTrialBalanceController,
  getVouchersByLedger,
};